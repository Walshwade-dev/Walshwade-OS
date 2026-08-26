from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.job_opportunity import JobOpportunity
from app.schemas.job_opportunity import JobOpportunityCreate


class JobOpportunityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, job_id: UUID) -> JobOpportunity:
        return self.db.query(JobOpportunity).filter(JobOpportunity.id == job_id).first()

    def get_all(self) -> List[JobOpportunity]:
        return self.db.query(JobOpportunity).order_by(JobOpportunity.created_at.desc()).all()

    def create(self, job: JobOpportunityCreate) -> JobOpportunity:
        db_job = JobOpportunity(**job.model_dump())
        self.db.add(db_job)
        self.db.commit()
        self.db.refresh(db_job)
        return db_job

    def update_status(self, job: JobOpportunity, status: str) -> JobOpportunity:
        job.status = status
        self.db.commit()
        self.db.refresh(job)
        return job
