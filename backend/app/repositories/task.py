from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

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

    def update(self, task_id: UUID, task_update: TaskUpdate) -> Optional[Task]:
        db_task = self.get(task_id)
        if not db_task:
            return None

        for field, value in task_update.model_dump(exclude_unset=True).items():
            setattr(db_task, field, value)

        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def delete(self, task_id: UUID) -> bool:
        db_task = self.get(task_id)
        if not db_task:
            return False
        self.db.delete(db_task)
        self.db.commit()
        return True
