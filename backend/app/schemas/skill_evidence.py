from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SkillEvidenceBase(BaseModel):
    skill_id: UUID
    title: str
    description: Optional[str] = None
    evidence_url: Optional[str] = None
    task_id: Optional[UUID] = None


class SkillEvidenceCreate(SkillEvidenceBase):
    pass


class SkillEvidenceResponse(SkillEvidenceBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
