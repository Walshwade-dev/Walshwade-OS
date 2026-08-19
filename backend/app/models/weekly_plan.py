import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    week_start_date = Column(Date, nullable=False, unique=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    tasks = relationship("WeeklyPlanTask", back_populates="weekly_plan", cascade="all, delete-orphan")

class WeeklyPlanTask(Base):
    __tablename__ = "weekly_plan_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    weekly_plan_id = Column(UUID(as_uuid=True), ForeignKey("weekly_plans.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    
    weekly_plan = relationship("WeeklyPlan", back_populates="tasks")
    task = relationship("Task", back_populates="weekly_plans")
