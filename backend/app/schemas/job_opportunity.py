from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.job_opportunity import JobOpportunityStatusEnum


class JobOpportunityBase(BaseModel):
    title: str
    company: str
    url: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    status: JobOpportunityStatusEnum = JobOpportunityStatusEnum.interested


class JobOpportunityCreate(JobOpportunityBase):
    pass


class JobOpportunityResponse(JobOpportunityBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobOpportunityStatusUpdate(BaseModel):
    status: JobOpportunityStatusEnum


class SkillGapResponse(BaseModel):
    matched: List[str]
    missing: List[str]
    match_percentage: float
