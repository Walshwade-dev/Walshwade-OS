from datetime import date
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.review import DailyReview, WeeklyReview
from app.schemas.review import DailyReviewCreate, WeeklyReviewCreate

class DailyReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert(self, schema: DailyReviewCreate) -> DailyReview:
        existing = self.db.query(DailyReview).filter(DailyReview.review_date == schema.review_date).first()
        if existing:
            existing.summary = schema.summary
            self.db.commit()
            self.db.refresh(existing)
            return existing
            
        db_obj = DailyReview(**schema.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_by_date(self, target_date: date) -> DailyReview | None:
        return self.db.query(DailyReview).filter(DailyReview.review_date == target_date).first()

    def get_all(self) -> list[DailyReview]:
        return self.db.query(DailyReview).order_by(DailyReview.review_date.desc()).all()


class WeeklyReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert(self, schema: WeeklyReviewCreate) -> WeeklyReview:
        existing = self.db.query(WeeklyReview).filter(WeeklyReview.weekly_plan_id == schema.weekly_plan_id).first()
        if existing:
            existing.summary = schema.summary
            self.db.commit()
            self.db.refresh(existing)
            return existing
            
        db_obj = WeeklyReview(**schema.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get(self, id: UUID) -> WeeklyReview | None:
        return self.db.query(WeeklyReview).filter(WeeklyReview.id == id).first()

    def get_all(self) -> list[WeeklyReview]:
        return self.db.query(WeeklyReview).order_by(WeeklyReview.created_at.desc()).all()
