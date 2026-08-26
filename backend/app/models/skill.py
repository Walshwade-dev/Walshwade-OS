import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.goal import DomainEnum


class SkillProficiencyLevelEnum(str, enum.Enum):
    novice = "novice"
    developing = "developing"
    competent = "competent"
    proficient = "proficient"
    expert = "expert"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    domain = Column(Enum(DomainEnum), default=DomainEnum.general, nullable=False)
    proficiency_level = Column(Enum(SkillProficiencyLevelEnum), default=SkillProficiencyLevelEnum.developing, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    evidence = relationship("SkillEvidence", back_populates="skill", cascade="all, delete-orphan")
