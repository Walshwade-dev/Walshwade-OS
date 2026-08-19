from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.goal import GoalCreate, GoalResponse
from app.repositories.goal import GoalRepository

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    repo = GoalRepository(db)
    return repo.create(goal)

@router.get("/", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    repo = GoalRepository(db)
    return repo.get_all()

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: UUID, db: Session = Depends(get_db)):
    repo = GoalRepository(db)
    goal = repo.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal
