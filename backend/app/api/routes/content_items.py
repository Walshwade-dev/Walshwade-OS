from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.content_item import ContentItemRepository
from app.schemas.content_item import ContentItemCreate, ContentItemResponse, ContentItemStatusUpdate
from app.core.security import verify_api_key

router = APIRouter(prefix="/content-items", tags=["content items"], dependencies=[Depends(verify_api_key)])


@router.post("/", response_model=ContentItemResponse, status_code=status.HTTP_201_CREATED)
def create_content_item(item: ContentItemCreate, db: Session = Depends(get_db)):
    repo = ContentItemRepository(db)
    return repo.create(item)


@router.get("/", response_model=List[ContentItemResponse])
def get_content_items(status: Optional[str] = None, db: Session = Depends(get_db)):
    repo = ContentItemRepository(db)
    return repo.get_all(status=status)


@router.get("/{content_id}", response_model=ContentItemResponse)
def get_content_item(content_id: UUID, db: Session = Depends(get_db)):
    repo = ContentItemRepository(db)
    item = repo.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")
    return item


@router.patch("/{content_id}/status", response_model=ContentItemResponse)
def update_content_item_status(content_id: UUID, payload: ContentItemStatusUpdate, db: Session = Depends(get_db)):
    repo = ContentItemRepository(db)
    item = repo.get(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")
    return repo.update_status(item, payload.status)
