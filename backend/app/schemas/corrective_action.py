from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CorrectiveActionBase(BaseModel):
    description: str
    new_plan: Optional[str] = None

class CorrectiveActionCreate(CorrectiveActionBase):
    pass

class CorrectiveActionResponse(CorrectiveActionBase):
    id: UUID
    failure_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
