from typing import Optional
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict

class DailyReviewBase(BaseModel):
    review_date: date
    summary: str

class DailyReviewCreate(DailyReviewBase):
    pass

class DailyReviewResponse(DailyReviewBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WeeklyReviewBase(BaseModel):
    weekly_plan_id: UUID
    summary: str

class WeeklyReviewCreate(WeeklyReviewBase):
    pass

class WeeklyReviewResponse(WeeklyReviewBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
