from typing import List
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from app.models.weekly_plan import WeeklyPlan, WeeklyPlanTask
from app.schemas.weekly_plan import WeeklyPlanCreate
from app.models.task import Task

class WeeklyPlanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, weekly_plan_id: UUID) -> WeeklyPlan:
        # Load the weekly plan and eagerly load its tasks through the join table
        return self.db.query(WeeklyPlan)\
            .options(joinedload(WeeklyPlan.tasks).joinedload(WeeklyPlanTask.task))\
            .filter(WeeklyPlan.id == weekly_plan_id)\
            .first()

    def get_all(self) -> List[WeeklyPlan]:
        return self.db.query(WeeklyPlan).order_by(WeeklyPlan.created_at.desc()).all()

    def create(self, weekly_plan: WeeklyPlanCreate) -> WeeklyPlan:
        db_weekly_plan = WeeklyPlan(**weekly_plan.model_dump())
        self.db.add(db_weekly_plan)
        self.db.commit()
        self.db.refresh(db_weekly_plan)
        return db_weekly_plan

    def attach_task(self, weekly_plan_id: UUID, task_id: UUID) -> WeeklyPlanTask:
        db_weekly_plan_task = WeeklyPlanTask(weekly_plan_id=weekly_plan_id, task_id=task_id)
        self.db.add(db_weekly_plan_task)
        self.db.commit()
        self.db.refresh(db_weekly_plan_task)
        return db_weekly_plan_task
