from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate

class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, task_id: UUID) -> Task:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_all(self, project_id: Optional[UUID] = None) -> List[Task]:
        query = self.db.query(Task)
        if project_id:
            query = query.filter(Task.project_id == project_id)
        return query.order_by(Task.created_at.desc()).all()

    def create(self, task: TaskCreate) -> Task:
        db_task = Task(**task.model_dump())
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task
