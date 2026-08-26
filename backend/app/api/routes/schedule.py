from datetime import date, datetime
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.repositories.time_block import TimeBlockRepository
from app.repositories.weekly_plan import WeeklyPlanRepository
from app.services.scheduler import generate_daily_schedule
from app.schemas.time_block import TimeBlockResponse, TimeBlockCreate
from app.core.security import verify_api_key

router = APIRouter(prefix="/schedule", tags=["Schedule"], dependencies=[Depends(verify_api_key)])

class GenerateScheduleRequest(BaseModel):
    target_date: date

@router.post("/generate")
def generate_schedule(req: GenerateScheduleRequest, db: Session = Depends(get_db)):
    tb_repo = TimeBlockRepository(db)
    wp_repo = WeeklyPlanRepository(db)
    
    # 1. Clear existing schedule for this date (simplest way to "regenerate")
    tb_repo.delete_by_date(req.target_date)
    
    # 2. Get current active Weekly Plan (most recent one for simplicity)
    plans = wp_repo.get_all()
    if not plans:
        raise HTTPException(status_code=400, detail="No active weekly plan found.")
    active_plan = wp_repo.get(plans[0].id)
    
    # 3. Extract planned tasks that are attached to this weekly plan
    tasks = []
    for wpt in active_plan.tasks:
        if wpt.task.status == "planned":
            tasks.append(wpt.task)
            
    # 4. Generate schedule
    DAILY_CAPACITY_MINUTES = 360 # Hardcoded constant per specs
    result = generate_daily_schedule(req.target_date, DAILY_CAPACITY_MINUTES, tasks)
    
    # 5. Persist
    to_create = []
    for block in result["time_blocks"]:
        to_create.append(TimeBlockCreate(
            task_id=UUID(block["task_id"]),
            date=block["date"],
            start_time=block["start_time"],
            end_time=block["end_time"],
            planned_duration_minutes=block["planned_duration_minutes"]
        ))
    
    if to_create:
        tb_repo.create_many(to_create)
        
    return {
        "message": "Schedule generated",
        "overcommitted": result["overcommitted"],
        "unscheduled_task_ids": result["unscheduled_task_ids"],
        "time_blocks_count": len(to_create)
    }

@router.get("/", response_model=List[TimeBlockResponse])
def get_schedule(target_date: date, db: Session = Depends(get_db)):
    tb_repo = TimeBlockRepository(db)
    return tb_repo.get_by_date(target_date)

@router.get("/today", response_model=List[TimeBlockResponse])
def get_today_schedule(db: Session = Depends(get_db)):
    tb_repo = TimeBlockRepository(db)
    return tb_repo.get_by_date(datetime.utcnow().date())
