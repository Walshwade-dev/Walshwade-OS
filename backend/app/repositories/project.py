from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

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

    def update(self, project_id: UUID, project_update: ProjectUpdate) -> Optional[Project]:
        db_project = self.get(project_id)
        if not db_project:
            return None

        for field, value in project_update.model_dump(exclude_unset=True).items():
            setattr(db_project, field, value)

        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def delete(self, project_id: UUID) -> bool:
        db_project = self.get(project_id)
        if not db_project:
            return False
        self.db.delete(db_project)
        self.db.commit()
        return True
