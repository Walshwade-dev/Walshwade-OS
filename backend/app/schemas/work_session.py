from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.work_session import WorkSessionStatusEnum
from app.schemas.task import TaskResponse

class WorkSessionBase(BaseModel):
    task_id: UUID
    time_block_id: UUID
    planned_duration_minutes: int
    notes: Optional[str] = None

class WorkSessionCreate(WorkSessionBase):
    pass

class WorkSessionUpdate(BaseModel):
    status: Optional[WorkSessionStatusEnum] = None
    actual_duration_minutes: Optional[int] = None
    started_at: Optional[datetime] = None
    paused_total_seconds: Optional[int] = None
    last_paused_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

class WorkSessionResponse(WorkSessionBase):
    id: UUID
    status: WorkSessionStatusEnum
    actual_duration_minutes: Optional[int] = None
    started_at: Optional[datetime] = None
    paused_total_seconds: int
    last_paused_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    task: Optional[TaskResponse] = None

    model_config = ConfigDict(from_attributes=True)
