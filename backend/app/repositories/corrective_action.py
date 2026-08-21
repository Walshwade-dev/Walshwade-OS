from uuid import UUID
from sqlalchemy.orm import Session
from app.models.corrective_action import CorrectiveAction
from app.schemas.corrective_action import CorrectiveActionCreate

class CorrectiveActionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, failure_id: UUID, schema: CorrectiveActionCreate) -> CorrectiveAction:
        db_obj = CorrectiveAction(failure_id=failure_id, **schema.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get(self, id: UUID) -> CorrectiveAction | None:
        return self.db.query(CorrectiveAction).filter(CorrectiveAction.id == id).first()
