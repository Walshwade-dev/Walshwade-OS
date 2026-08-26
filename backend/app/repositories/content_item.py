from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.content_item import ContentItem
from app.schemas.content_item import ContentItemCreate


class ContentItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, content_id: UUID) -> ContentItem:
        return self.db.query(ContentItem).filter(ContentItem.id == content_id).first()

    def get_all(self, status: Optional[str] = None) -> List[ContentItem]:
        query = self.db.query(ContentItem)
        if status:
            query = query.filter(ContentItem.status == status)
        return query.order_by(ContentItem.created_at.desc()).all()

    def create(self, item: ContentItemCreate) -> ContentItem:
        db_item = ContentItem(**item.model_dump())
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def update_status(self, item: ContentItem, status: str) -> ContentItem:
        item.status = status
        self.db.commit()
        self.db.refresh(item)
        return item
