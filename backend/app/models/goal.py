import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class DomainEnum(str, enum.Enum):
    software = "software"
    ai = "ai"
    networking = "networking"
    cybersecurity = "cybersecurity"
    business = "business"
    finance = "finance"
    communication = "communication"
    confidence = "confidence"
    brand = "brand"
    career = "career"
    general = "general"

class GoalStatusEnum(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"
    abandoned = "abandoned"

class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    domain = Column(Enum(DomainEnum), default=DomainEnum.general, nullable=False)
    status = Column(Enum(GoalStatusEnum), default=GoalStatusEnum.active, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    projects = relationship("Project", back_populates="goal", cascade="all, delete-orphan")
