from uuid import UUID
from sqlalchemy.orm import Session
from app.models.failure import Failure
from app.schemas.failure import FailureCreate

class FailureRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, schema: FailureCreate) -> Failure:
        db_obj = Failure(**schema.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get(self, id: UUID) -> Failure | None:
        return self.db.query(Failure).filter(Failure.id == id).first()

    def get_all(self, task_id: UUID = None, failure_type: str = None) -> list[Failure]:
        query = self.db.query(Failure)
        if task_id:
            query = query.filter(Failure.task_id == task_id)
        if failure_type:
            query = query.filter(Failure.failure_type == failure_type)
        return query.order_by(Failure.created_at.desc()).all()
