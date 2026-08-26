from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.schemas.skill import SkillCreate


class SkillRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, skill_id: UUID) -> Skill:
        return self.db.query(Skill).filter(Skill.id == skill_id).first()

    def get_all(self) -> List[Skill]:
        return self.db.query(Skill).order_by(Skill.created_at.desc()).all()

    def create(self, skill: SkillCreate) -> Skill:
        db_skill = Skill(**skill.model_dump())
        self.db.add(db_skill)
        self.db.commit()
        self.db.refresh(db_skill)
        return db_skill
