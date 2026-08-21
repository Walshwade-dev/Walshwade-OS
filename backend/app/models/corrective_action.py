import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    failure_id = Column(UUID(as_uuid=True), ForeignKey("failures.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    new_plan = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    failure = relationship("Failure", back_populates="corrective_actions")
