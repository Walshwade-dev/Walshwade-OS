from datetime import date
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.kpi_service import KPIService

router = APIRouter(prefix="/kpis", tags=["KPIs"])

@router.get("/execution")
def get_execution_kpis(start_date: date, end_date: date, db: Session = Depends(get_db)) -> Dict[str, Any]:
    service = KPIService(db)
    return service.get_execution_kpis(start_date, end_date)

@router.get("/time")
def get_time_kpis(start_date: date, end_date: date, db: Session = Depends(get_db)) -> Dict[str, Any]:
    service = KPIService(db)
    return service.get_time_kpis(start_date, end_date)

@router.get("/planning")
def get_planning_kpis(weekly_plan_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    service = KPIService(db)
    return service.get_planning_kpis(weekly_plan_id)

@router.get("/dashboard")
def get_dashboard_kpis(start_date: date, end_date: date, weekly_plan_id: str = None, db: Session = Depends(get_db)) -> Dict[str, Any]:
    service = KPIService(db)
    exec_kpis = service.get_execution_kpis(start_date, end_date)
    time_kpis = service.get_time_kpis(start_date, end_date)
    
    plan_kpis = {}
    if weekly_plan_id:
        plan_kpis = service.get_planning_kpis(weekly_plan_id)
        
    return {
        "execution": exec_kpis,
        "time": time_kpis,
        "planning": plan_kpis
    }
