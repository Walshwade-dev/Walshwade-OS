import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Date, Enum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class TaskPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class TaskStatusEnum(str, enum.Enum):
    backlog = "backlog"
    planned = "planned"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"
    rescheduled = "rescheduled"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium, nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.backlog, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="tasks")
    weekly_plans = relationship("WeeklyPlanTask", back_populates="task", cascade="all, delete-orphan")
    time_blocks = relationship("TimeBlock", back_populates="task", cascade="all, delete-orphan")
    work_sessions = relationship("WorkSession", back_populates="task", cascade="all, delete-orphan")
