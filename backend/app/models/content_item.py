import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ContentItemStatusEnum(str, enum.Enum):
    idea = "idea"
    draft = "draft"
    published = "published"


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    source_task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(ContentItemStatusEnum), default=ContentItemStatusEnum.idea, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source_task = relationship("Task")
