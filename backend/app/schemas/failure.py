from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.failure import FailureTypeEnum

class FailureBase(BaseModel):
    task_id: UUID
    session_id: Optional[UUID] = None
    failure_type: FailureTypeEnum
    description: str
    root_cause: Optional[str] = None
    impact: Optional[str] = None

class FailureCreate(FailureBase):
    pass

class FailureResponse(FailureBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
