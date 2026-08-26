from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.repositories.task import TaskRepository
from app.repositories.project import ProjectRepository
from app.core.security import verify_api_key

router = APIRouter(prefix="/tasks", tags=["tasks"], dependencies=[Depends(verify_api_key)])

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    project_repo = ProjectRepository(db)
    if not project_repo.get(task.project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    
    repo = TaskRepository(db)
    return repo.create(task)

@router.get("/", response_model=List[TaskResponse])
def get_tasks(project_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    repo = TaskRepository(db)
    return repo.get_all(project_id=project_id)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: UUID, db: Session = Depends(get_db)):
    repo = TaskRepository(db)
    task = repo.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, payload: TaskUpdate, db: Session = Depends(get_db)):
    repo = TaskRepository(db)
    task = repo.update(task_id, payload)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: UUID, db: Session = Depends(get_db)):
    repo = TaskRepository(db)
    deleted = repo.delete(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
