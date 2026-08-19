from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.goal import Goal
from app.schemas.goal import GoalCreate

class GoalRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, goal_id: UUID) -> Goal:
        return self.db.query(Goal).filter(Goal.id == goal_id).first()

    def get_all(self) -> List[Goal]:
        return self.db.query(Goal).order_by(Goal.created_at.desc()).all()

    def create(self, goal: GoalCreate) -> Goal:
        db_goal = Goal(**goal.model_dump())
        self.db.add(db_goal)
        self.db.commit()
        self.db.refresh(db_goal)
        return db_goal
