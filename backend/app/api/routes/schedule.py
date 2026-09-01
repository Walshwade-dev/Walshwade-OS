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
    
    # 1. Fetch existing time blocks for target date
    existing_blocks = tb_repo.get_by_date(req.target_date)
    
    preserved_blocks = []
    preserved_ids = []
    scheduled_task_ids = set()
    total_used_minutes = 0
    latest_end_time = time(8, 0) # Default start time
    
    for tb in existing_blocks:
        has_sessions = bool(tb.work_sessions and len(tb.work_sessions) > 0)
        task_is_completed = bool(tb.task and tb.task.status == "completed")
        
        if has_sessions or task_is_completed:
            preserved_blocks.append(tb)
            preserved_ids.append(tb.id)
            scheduled_task_ids.add(tb.task_id)
            
            # Calculate actual or planned duration
            completed_sessions = [s for s in tb.work_sessions if s.status == "completed"]
            if completed_sessions:
                duration = sum(s.actual_duration_minutes or s.planned_duration_minutes for s in completed_sessions)
            else:
                duration = tb.planned_duration_minutes
                
            total_used_minutes += duration
            if tb.end_time > latest_end_time:
                latest_end_time = tb.end_time

    # 2. Delete non-preserved (pending) time blocks
    tb_repo.delete_pending_blocks(req.target_date, preserved_ids)
    
    # 3. Get current active Weekly Plan
    plans = wp_repo.get_all()
    if not plans:
        return {
            "message": "No active weekly plan found. Awaiting weekly plan creation.",
            "overcommitted": False,
            "unscheduled_task_ids": [],
            "time_blocks_count": len(preserved_blocks)
        }
    active_plan = wp_repo.get(plans[0].id)
    
    # 4. Extract candidate planned tasks not already scheduled/completed today
    candidate_tasks = []
    for wpt in active_plan.tasks:
        task = wpt.task
        if task.status == "planned" and task.id not in scheduled_task_ids:
            candidate_tasks.append(task)
            
    # 5. Calculate remaining capacity & generate schedule
    DAILY_CAPACITY_MINUTES = 360 # Hardcoded capacity per specs
    remaining_capacity = max(0, DAILY_CAPACITY_MINUTES - total_used_minutes)
    
    result = generate_daily_schedule(
        req.target_date, 
        remaining_capacity, 
        candidate_tasks,
        start_time_offset=latest_end_time
    )
    
    # 6. Persist new blocks
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
        "time_blocks_count": len(preserved_blocks) + len(to_create)
    }

@router.get("/", response_model=List[TimeBlockResponse])
def get_schedule(target_date: date, db: Session = Depends(get_db)):
    tb_repo = TimeBlockRepository(db)
    return tb_repo.get_by_date(target_date)

@router.get("/today", response_model=List[TimeBlockResponse])
def get_today_schedule(db: Session = Depends(get_db)):
    tb_repo = TimeBlockRepository(db)
    return tb_repo.get_by_date(datetime.utcnow().date())
