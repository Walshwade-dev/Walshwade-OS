from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.task import TaskResponse

class WeeklyPlanBase(BaseModel):
    week_start_date: date
    notes: Optional[str] = None

class WeeklyPlanCreate(WeeklyPlanBase):
    @field_validator("week_start_date")
    @classmethod
    def must_be_future_or_today(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("week_start_date cannot be in the past")
        return v

class WeeklyPlanResponse(WeeklyPlanBase):
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class WeeklyPlanWithTasksResponse(WeeklyPlanResponse):
    tasks: List[TaskResponse] = []
    
class WeeklyPlanTaskAttach(BaseModel):
    task_id: UUID
