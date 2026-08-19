from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, project_id: UUID) -> Project:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_all(self, goal_id: Optional[UUID] = None) -> List[Project]:
        query = self.db.query(Project)
        if goal_id:
            query = query.filter(Project.goal_id == goal_id)
        return query.order_by(Project.created_at.desc()).all()

    def create(self, project: ProjectCreate) -> Project:
        db_project = Project(**project.model_dump())
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project
