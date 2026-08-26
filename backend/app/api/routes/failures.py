from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.failure import FailureCreate, FailureResponse
from app.schemas.corrective_action import CorrectiveActionCreate, CorrectiveActionResponse
from app.repositories.failure import FailureRepository
from app.repositories.corrective_action import CorrectiveActionRepository
from app.models.task import Task, TaskStatusEnum
from app.models.work_session import WorkSession, WorkSessionStatusEnum
from datetime import datetime
from app.core.security import verify_api_key

router = APIRouter(prefix="/failures", tags=["Failures"], dependencies=[Depends(verify_api_key)])

@router.post("/", response_model=FailureResponse, status_code=status.HTTP_201_CREATED)
def create_failure(failure_in: FailureCreate, db: Session = Depends(get_db)):
    repo = FailureRepository(db)
    
    # Flip the task status to failed
    task = db.query(Task).filter(Task.id == failure_in.task_id).first()
    if task and task.status != TaskStatusEnum.failed:
        task.status = TaskStatusEnum.failed
        
    # If session_id is provided, close the session as failed
    if failure_in.session_id:
        session = db.query(WorkSession).filter(WorkSession.id == failure_in.session_id).first()
        if session and session.status in [WorkSessionStatusEnum.started, WorkSessionStatusEnum.paused]:
            now = datetime.utcnow()
            session.status = WorkSessionStatusEnum.failed
            session.completed_at = now
            if session.started_at:
                total_seconds = (now - session.started_at).total_seconds()
                active_seconds = total_seconds - session.paused_total_seconds
                session.actual_duration_minutes = int(max(0, active_seconds) / 60)

    db.commit()

    return repo.create(failure_in)

@router.get("/", response_model=List[FailureResponse])
def get_failures(task_id: UUID = None, failure_type: str = None, db: Session = Depends(get_db)):
    repo = FailureRepository(db)
    return repo.get_all(task_id=task_id, failure_type=failure_type)

@router.get("/{id}", response_model=FailureResponse)
def get_failure(id: UUID, db: Session = Depends(get_db)):
    repo = FailureRepository(db)
    failure = repo.get(id)
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")
    return failure

@router.post("/{id}/corrective-action", response_model=CorrectiveActionResponse, status_code=status.HTTP_201_CREATED)
def add_corrective_action(id: UUID, ca_in: CorrectiveActionCreate, db: Session = Depends(get_db)):
    f_repo = FailureRepository(db)
    failure = f_repo.get(id)
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")

    ca_repo = CorrectiveActionRepository(db)
    ca = ca_repo.create(failure_id=id, schema=ca_in)

    # Flip Task and Session status to rescheduled
    task = db.query(Task).filter(Task.id == failure.task_id).first()
    if task:
        task.status = TaskStatusEnum.rescheduled

    if failure.session_id:
        session = db.query(WorkSession).filter(WorkSession.id == failure.session_id).first()
        if session:
            session.status = WorkSessionStatusEnum.rescheduled

    db.commit()

    return ca
