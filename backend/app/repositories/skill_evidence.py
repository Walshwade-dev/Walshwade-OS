from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.skill_evidence import SkillEvidence
from app.schemas.skill_evidence import SkillEvidenceCreate


class SkillEvidenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skill_id: Optional[UUID] = None) -> List[SkillEvidence]:
        query = self.db.query(SkillEvidence)
        if skill_id:
            query = query.filter(SkillEvidence.skill_id == skill_id)
        return query.order_by(SkillEvidence.created_at.desc()).all()

    def create(self, evidence: SkillEvidenceCreate) -> SkillEvidence:
        db_evidence = SkillEvidence(**evidence.model_dump())
        self.db.add(db_evidence)
        self.db.commit()
        self.db.refresh(db_evidence)
        return db_evidence
