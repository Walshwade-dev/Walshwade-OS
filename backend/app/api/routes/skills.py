from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.skill import SkillRepository
from app.repositories.skill_evidence import SkillEvidenceRepository
from app.schemas.skill import SkillCreate, SkillResponse
from app.schemas.skill_evidence import SkillEvidenceCreate, SkillEvidenceResponse
from app.core.security import verify_api_key

router = APIRouter(prefix="/skills", tags=["skills"], dependencies=[Depends(verify_api_key)])


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    repo = SkillRepository(db)
    return repo.create(skill)


@router.get("/", response_model=List[SkillResponse])
def get_skills(db: Session = Depends(get_db)):
    repo = SkillRepository(db)
    return repo.get_all()


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: UUID, db: Session = Depends(get_db)):
    repo = SkillRepository(db)
    skill = repo.get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.post("/evidence", response_model=SkillEvidenceResponse, status_code=status.HTTP_201_CREATED)
def create_skill_evidence(evidence: SkillEvidenceCreate, db: Session = Depends(get_db)):
    repo = SkillEvidenceRepository(db)
    return repo.create(evidence)


@router.get("/evidence", response_model=List[SkillEvidenceResponse])
def get_skill_evidence(skill_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    repo = SkillEvidenceRepository(db)
    return repo.get_all(skill_id=skill_id)


@router.post("/skill-evidence", response_model=SkillEvidenceResponse, status_code=status.HTTP_201_CREATED)
def create_skill_evidence_alias(evidence: SkillEvidenceCreate, db: Session = Depends(get_db)):
    return create_skill_evidence(evidence, db)


@router.get("/skill-evidence", response_model=List[SkillEvidenceResponse])
def get_skill_evidence_alias(skill_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    return get_skill_evidence(skill_id=skill_id, db=db)
