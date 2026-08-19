from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.schemas.weekly_plan import WeeklyPlanCreate, WeeklyPlanResponse, WeeklyPlanWithTasksResponse, WeeklyPlanTaskAttach
from app.repositories.weekly_plan import WeeklyPlanRepository
from app.repositories.task import TaskRepository

router = APIRouter(prefix="/weekly-plans", tags=["weekly_plans"])

@router.post("/", response_model=WeeklyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_weekly_plan(weekly_plan: WeeklyPlanCreate, db: Session = Depends(get_db)):
    repo = WeeklyPlanRepository(db)
    try:
        return repo.create(weekly_plan)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Weekly plan for this start date already exists")

@router.get("/", response_model=List[WeeklyPlanResponse])
def get_weekly_plans(db: Session = Depends(get_db)):
    repo = WeeklyPlanRepository(db)
    return repo.get_all()

@router.get("/{weekly_plan_id}", response_model=WeeklyPlanWithTasksResponse)
def get_weekly_plan(weekly_plan_id: UUID, db: Session = Depends(get_db)):
    repo = WeeklyPlanRepository(db)
    plan = repo.get(weekly_plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Weekly plan not found")
    
    # Map the tasks correctly from the join table to match the schema
    plan_with_tasks = {
        "id": plan.id,
        "week_start_date": plan.week_start_date,
        "notes": plan.notes,
        "created_at": plan.created_at,
        "tasks": [pt.task for pt in plan.tasks]
    }
    return plan_with_tasks

@router.post("/{weekly_plan_id}/tasks", status_code=status.HTTP_201_CREATED)
def attach_task_to_weekly_plan(weekly_plan_id: UUID, attachment: WeeklyPlanTaskAttach, db: Session = Depends(get_db)):
    repo = WeeklyPlanRepository(db)
    if not repo.get(weekly_plan_id):
        raise HTTPException(status_code=404, detail="Weekly plan not found")
        
    task_repo = TaskRepository(db)
    if not task_repo.get(attachment.task_id):
        raise HTTPException(status_code=404, detail="Task not found")
        
    try:
        repo.attach_task(weekly_plan_id, attachment.task_id)
        return {"status": "success"}
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Task is already attached to this weekly plan")
