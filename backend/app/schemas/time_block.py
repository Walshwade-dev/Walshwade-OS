from typing import Optional
from uuid import UUID
from datetime import datetime, date, time
from pydantic import BaseModel, ConfigDict
from app.schemas.task import TaskResponse
from app.schemas.work_session import WorkSessionResponse
from typing import List

class TimeBlockBase(BaseModel):
    task_id: UUID
    date: date
    start_time: time
    end_time: time
    planned_duration_minutes: int

class TimeBlockCreate(TimeBlockBase):
    pass

class TimeBlockResponse(TimeBlockBase):
    id: UUID
    created_at: datetime
    task: Optional[TaskResponse] = None
    work_sessions: List[WorkSessionResponse] = []

    model_config = ConfigDict(from_attributes=True)
