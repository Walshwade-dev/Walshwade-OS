from typing import List, Optional
from uuid import UUID
from datetime import date
from sqlalchemy.orm import Session, joinedload
from app.models.time_block import TimeBlock
from app.schemas.time_block import TimeBlockCreate

class TimeBlockRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, time_block_id: UUID) -> Optional[TimeBlock]:
        return self.db.query(TimeBlock).options(joinedload(TimeBlock.task), joinedload(TimeBlock.work_sessions)).filter(TimeBlock.id == time_block_id).first()

    def get_by_date(self, target_date: date) -> List[TimeBlock]:
        return self.db.query(TimeBlock).options(joinedload(TimeBlock.task), joinedload(TimeBlock.work_sessions)).filter(TimeBlock.date == target_date).order_by(TimeBlock.start_time.asc()).all()

    def create(self, time_block: TimeBlockCreate) -> TimeBlock:
        db_tb = TimeBlock(**time_block.model_dump())
        self.db.add(db_tb)
        self.db.commit()
        self.db.refresh(db_tb)
        return db_tb

    def create_many(self, time_blocks: List[TimeBlockCreate]) -> List[TimeBlock]:
        db_tbs = [TimeBlock(**tb.model_dump()) for tb in time_blocks]
        self.db.add_all(db_tbs)
        self.db.commit()
        for tb in db_tbs:
            self.db.refresh(tb)
        return db_tbs

    def delete_by_date(self, target_date: date) -> None:
        self.db.query(TimeBlock).filter(TimeBlock.date == target_date).delete()
        self.db.commit()

    def delete_pending_blocks(self, target_date: date, preserve_ids: List[UUID]) -> None:
        query = self.db.query(TimeBlock).filter(TimeBlock.date == target_date)
        if preserve_ids:
            query = query.filter(TimeBlock.id.notin_(preserve_ids))
        query.delete(synchronize_session=False)
        self.db.commit()
