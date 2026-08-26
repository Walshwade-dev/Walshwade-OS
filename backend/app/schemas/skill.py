from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.goal import DomainEnum
from app.models.skill import SkillProficiencyLevelEnum


class SkillBase(BaseModel):
    name: str
    domain: DomainEnum = DomainEnum.general
    proficiency_level: SkillProficiencyLevelEnum = SkillProficiencyLevelEnum.developing


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
