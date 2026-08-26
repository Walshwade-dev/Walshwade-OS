from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.project import ProjectStatusEnum

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: ProjectStatusEnum = ProjectStatusEnum.active

class ProjectCreate(ProjectBase):
    goal_id: UUID

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatusEnum] = None

class ProjectResponse(ProjectBase):
    id: UUID
    goal_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
