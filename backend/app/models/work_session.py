import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class WorkSessionStatusEnum(str, enum.Enum):
    scheduled = "scheduled"
    ready = "ready"
    started = "started"
    paused = "paused"
    completed = "completed"
    failed = "failed"
    rescheduled = "rescheduled"
    abandoned = "abandoned"

class WorkSession(Base):
    __tablename__ = "work_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    time_block_id = Column(UUID(as_uuid=True), ForeignKey("time_blocks.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(WorkSessionStatusEnum), default=WorkSessionStatusEnum.scheduled, nullable=False)
    planned_duration_minutes = Column(Integer, nullable=False)
    actual_duration_minutes = Column(Integer, nullable=True)
    started_at = Column(DateTime, nullable=True)
    paused_total_seconds = Column(Integer, default=0, nullable=False)
    last_paused_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task", back_populates="work_sessions")
    time_block = relationship("TimeBlock", back_populates="work_sessions")
