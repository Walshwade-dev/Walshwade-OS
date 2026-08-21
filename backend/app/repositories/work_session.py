from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.work_session import WorkSession, WorkSessionStatusEnum
from app.schemas.work_session import WorkSessionCreate, WorkSessionUpdate

class WorkSessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, session_id: UUID) -> Optional[WorkSession]:
        return self.db.query(WorkSession).filter(WorkSession.id == session_id).first()

    def get_active(self) -> Optional[WorkSession]:
        return self.db.query(WorkSession).filter(
            WorkSession.status.in_([WorkSessionStatusEnum.started, WorkSessionStatusEnum.paused])
        ).first()

    def create(self, session: WorkSessionCreate) -> WorkSession:
        db_session = WorkSession(**session.model_dump())
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)
        return db_session

    def update(self, session_id: UUID, session_update: WorkSessionUpdate) -> Optional[WorkSession]:
        db_session = self.get(session_id)
        if not db_session:
            return None
        
        update_data = session_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_session, key, value)
            
        self.db.commit()
        self.db.refresh(db_session)
        return db_session
