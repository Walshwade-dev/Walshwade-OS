from datetime import date
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.review import DailyReviewCreate, DailyReviewResponse, WeeklyReviewCreate, WeeklyReviewResponse
from app.repositories.review import DailyReviewRepository, WeeklyReviewRepository
from app.core.security import verify_api_key

router = APIRouter(prefix="/reviews", tags=["Reviews"], dependencies=[Depends(verify_api_key)])

@router.post("/daily", response_model=DailyReviewResponse, status_code=status.HTTP_200_OK)
def create_daily_review(review_in: DailyReviewCreate, db: Session = Depends(get_db)):
    repo = DailyReviewRepository(db)
    return repo.upsert(review_in)

@router.get("/daily", response_model=List[DailyReviewResponse])
def get_daily_reviews(db: Session = Depends(get_db)):
    repo = DailyReviewRepository(db)
    return repo.get_all()

@router.get("/daily/{target_date}", response_model=DailyReviewResponse)
def get_daily_review(target_date: date, db: Session = Depends(get_db)):
    repo = DailyReviewRepository(db)
    review = repo.get_by_date(target_date)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.post("/weekly", response_model=WeeklyReviewResponse, status_code=status.HTTP_200_OK)
def create_weekly_review(review_in: WeeklyReviewCreate, db: Session = Depends(get_db)):
    repo = WeeklyReviewRepository(db)
    return repo.upsert(review_in)

@router.get("/weekly", response_model=List[WeeklyReviewResponse])
def get_weekly_reviews(db: Session = Depends(get_db)):
    repo = WeeklyReviewRepository(db)
    return repo.get_all()

@router.get("/weekly/{id}", response_model=WeeklyReviewResponse)
def get_weekly_review(id: UUID, db: Session = Depends(get_db)):
    repo = WeeklyReviewRepository(db)
    review = repo.get(id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
