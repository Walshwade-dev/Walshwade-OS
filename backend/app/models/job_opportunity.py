import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class JobOpportunityStatusEnum(str, enum.Enum):
    interested = "interested"
    applied = "applied"
    interviewing = "interviewing"
    rejected = "rejected"
    offer = "offer"
    withdrawn = "withdrawn"


class JobOpportunity(Base):
    __tablename__ = "job_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    url = Column(String, nullable=True)
    required_skills = Column(ARRAY(String), nullable=False, default=list)
    status = Column(Enum(JobOpportunityStatusEnum), default=JobOpportunityStatusEnum.interested, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
