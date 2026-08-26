from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.goal import DomainEnum, GoalStatusEnum

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    domain: DomainEnum = DomainEnum.general
    status: GoalStatusEnum = GoalStatusEnum.active

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[DomainEnum] = None
    status: Optional[GoalStatusEnum] = None

class GoalResponse(GoalBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
