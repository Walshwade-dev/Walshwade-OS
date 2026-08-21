import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class FailureTypeEnum(str, enum.Enum):
    poor_estimation = "poor_estimation"
    lack_of_knowledge = "lack_of_knowledge"
    task_too_difficult = "task_too_difficult"
    task_unclear = "task_unclear"
    distraction = "distraction"
    fatigue = "fatigue"
    unexpected_responsibility = "unexpected_responsibility"
    procrastination = "procrastination"
    technical_problem = "technical_problem"
    emotional_resistance = "emotional_resistance"
    scheduling_problem = "scheduling_problem"
    missing_dependency = "missing_dependency"
    other = "other"

class Failure(Base):
    __tablename__ = "failures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("work_sessions.id", ondelete="SET NULL"), nullable=True)
    failure_type = Column(Enum(FailureTypeEnum), nullable=False)
    description = Column(String, nullable=False)
    root_cause = Column(String, nullable=True)
    impact = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task")
    session = relationship("WorkSession")
    corrective_actions = relationship("CorrectiveAction", back_populates="failure", cascade="all, delete-orphan")
