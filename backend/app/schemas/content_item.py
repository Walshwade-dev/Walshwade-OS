from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.content_item import ContentItemStatusEnum


class ContentItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    source_task_id: Optional[UUID] = None
    status: ContentItemStatusEnum = ContentItemStatusEnum.idea


class ContentItemCreate(ContentItemBase):
    pass


class ContentItemResponse(ContentItemBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentItemStatusUpdate(BaseModel):
    status: ContentItemStatusEnum
