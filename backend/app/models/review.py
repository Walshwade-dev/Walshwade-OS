import uuid
from datetime import datetime

from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class DailyReview(Base):
    __tablename__ = "daily_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    review_date = Column(Date, nullable=False, unique=True, index=True)
    summary = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    weekly_plan_id = Column(UUID(as_uuid=True), ForeignKey("weekly_plans.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
