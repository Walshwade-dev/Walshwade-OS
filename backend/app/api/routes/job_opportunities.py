from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.job_opportunity import JobOpportunityRepository
from app.repositories.skill import SkillRepository
from app.schemas.job_opportunity import JobOpportunityCreate, JobOpportunityResponse, JobOpportunityStatusUpdate, SkillGapResponse
from app.services.skill_gap_service import compare_job_skills
from app.core.security import verify_api_key

router = APIRouter(prefix="/job-opportunities", tags=["job opportunities"], dependencies=[Depends(verify_api_key)])


@router.post("/", response_model=JobOpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_job_opportunity(job: JobOpportunityCreate, db: Session = Depends(get_db)):
    repo = JobOpportunityRepository(db)
    return repo.create(job)


@router.get("/", response_model=List[JobOpportunityResponse])
def get_job_opportunities(db: Session = Depends(get_db)):
    repo = JobOpportunityRepository(db)
    return repo.get_all()


@router.get("/{job_id}", response_model=JobOpportunityResponse)
def get_job_opportunity(job_id: UUID, db: Session = Depends(get_db)):
    repo = JobOpportunityRepository(db)
    job = repo.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found")
    return job


@router.patch("/{job_id}/status", response_model=JobOpportunityResponse)
def update_job_opportunity_status(job_id: UUID, payload: JobOpportunityStatusUpdate, db: Session = Depends(get_db)):
    repo = JobOpportunityRepository(db)
    job = repo.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found")
    return repo.update_status(job, payload.status)


@router.get("/{job_id}/skill-gap", response_model=SkillGapResponse)
def get_job_skill_gap(job_id: UUID, db: Session = Depends(get_db)):
    repo = JobOpportunityRepository(db)
    job = repo.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found")

    skills_repo = SkillRepository(db)
    skills = skills_repo.get_all()
    return compare_job_skills(job, skills)
