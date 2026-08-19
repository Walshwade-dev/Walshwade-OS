from typing import Optional
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from app.models.task import TaskPriorityEnum, TaskStatusEnum

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriorityEnum = TaskPriorityEnum.medium
    estimated_duration_minutes: Optional[int] = None
    deadline: Optional[date] = None
    status: TaskStatusEnum = TaskStatusEnum.backlog

class TaskCreate(TaskBase):
    project_id: UUID

class TaskResponse(TaskBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
