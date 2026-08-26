from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.repositories.project import ProjectRepository
from app.repositories.goal import GoalRepository
from app.core.security import verify_api_key

router = APIRouter(prefix="/projects", tags=["projects"], dependencies=[Depends(verify_api_key)])

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    goal_repo = GoalRepository(db)
    if not goal_repo.get(project.goal_id):
        raise HTTPException(status_code=404, detail="Goal not found")
    
    repo = ProjectRepository(db)
    return repo.create(project)

@router.get("/", response_model=List[ProjectResponse])
def get_projects(goal_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    return repo.get_all(goal_id=goal_id)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    project = repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, payload: ProjectUpdate, db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    project = repo.update(project_id, payload)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    deleted = repo.delete(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
