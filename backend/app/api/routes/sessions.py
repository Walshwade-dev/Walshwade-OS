from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.repositories.work_session import WorkSessionRepository
from app.repositories.time_block import TimeBlockRepository
from app.schemas.work_session import WorkSessionResponse, WorkSessionCreate, WorkSessionUpdate
from app.models.work_session import WorkSessionStatusEnum
from app.core.security import verify_api_key

router = APIRouter(prefix="/sessions", tags=["Sessions"], dependencies=[Depends(verify_api_key)])

class CreateSessionRequest(BaseModel):
    time_block_id: UUID

class StartSessionRequest(BaseModel):
    started_at: datetime | None = None
    custom_start_time: str | None = None # e.g. "14:15"

class CompleteSessionRequest(BaseModel):
    notes: str | None = None
    actual_duration_minutes: int | None = None


@router.post("/", response_model=WorkSessionResponse)
def create_session(req: CreateSessionRequest, db: Session = Depends(get_db)):
    ws_repo = WorkSessionRepository(db)
    tb_repo = TimeBlockRepository(db)
    
    tb = tb_repo.get(req.time_block_id)
    if not tb:
        raise HTTPException(status_code=404, detail="Time block not found")
        
    session = ws_repo.create(WorkSessionCreate(
        task_id=tb.task_id,
        time_block_id=tb.id,
        planned_duration_minutes=tb.planned_duration_minutes
    ))
    return session

@router.get("/active", response_model=WorkSessionResponse | None)
def get_active_session(db: Session = Depends(get_db)):
    ws_repo = WorkSessionRepository(db)
    return ws_repo.get_active()

@router.post("/{session_id}/start", response_model=WorkSessionResponse)
def start_session(session_id: UUID, req: StartSessionRequest | None = None, db: Session = Depends(get_db)):
    ws_repo = WorkSessionRepository(db)
    session = ws_repo.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Check if there's already an active session
    active = ws_repo.get_active()
    if active and active.id != session.id:
        raise HTTPException(status_code=400, detail="Another session is currently active")
        
    start_dt = datetime.utcnow()
    if req:
        if req.started_at:
            start_dt = req.started_at
        elif req.custom_start_time:
            try:
                parts = [int(p) for p in req.custom_start_time.split(":")]
                today = datetime.utcnow().date()
                start_dt = datetime(today.year, today.month, today.day, parts[0], parts[1])
            except Exception:
                start_dt = datetime.utcnow()

    return ws_repo.update(session_id, WorkSessionUpdate(
        status=WorkSessionStatusEnum.started,
        started_at=start_dt
    ))

@router.post("/{session_id}/pause", response_model=WorkSessionResponse)
def pause_session(session_id: UUID, db: Session = Depends(get_db)):
    ws_repo = WorkSessionRepository(db)
    return ws_repo.update(session_id, WorkSessionUpdate(
        status=WorkSessionStatusEnum.paused,
        last_paused_at=datetime.utcnow()
    ))

@router.post("/{session_id}/resume", response_model=WorkSessionResponse)
def resume_session(session_id: UUID, db: Session = Depends(get_db)):
    ws_repo = WorkSessionRepository(db)
    session = ws_repo.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Calculate paused duration
    new_paused_seconds = session.paused_total_seconds
    if session.last_paused_at:
        pause_duration = (datetime.utcnow() - session.last_paused_at).total_seconds()
        new_paused_seconds += int(pause_duration)
        
    return ws_repo.update(session_id, WorkSessionUpdate(
        status=WorkSessionStatusEnum.started,
        paused_total_seconds=new_paused_seconds,
        last_paused_at=None
    ))

@router.post("/{session_id}/complete", response_model=WorkSessionResponse)
def complete_session(session_id: UUID, req: CompleteSessionRequest | None = None, db: Session = Depends(get_db)):
    ws_repo = WorkSessionRepository(db)
    session = ws_repo.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    now = datetime.utcnow()
    notes = req.notes if req else None
    
    if req and req.actual_duration_minutes is not None:
        actual_duration = req.actual_duration_minutes
    else:
        actual_duration = session.planned_duration_minutes
        if session.started_at:
            total_seconds = (now - session.started_at).total_seconds()
            active_seconds = total_seconds - session.paused_total_seconds
            actual_duration = int(active_seconds / 60)
        
    return ws_repo.update(session_id, WorkSessionUpdate(
        status=WorkSessionStatusEnum.completed,
        completed_at=now,
        actual_duration_minutes=actual_duration,
        notes=notes
    ))


