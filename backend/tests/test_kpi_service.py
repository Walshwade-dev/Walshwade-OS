import pytest
from datetime import date
from unittest.mock import MagicMock
from app.services.kpi_service import KPIService
from app.models.task import TaskStatusEnum
from app.models.work_session import WorkSessionStatusEnum

# We use simple mock objects to test the pure logic without hitting the DB.
# A more robust test would use an in-memory SQLite DB.

class MockTask:
    def __init__(self, status):
        self.status = status

class MockSession:
    def __init__(self, status, planned, actual):
        self.status = status
        self.planned_duration_minutes = planned
        self.actual_duration_minutes = actual

def test_execution_kpis():
    db = MagicMock()
    # Mock task query
    db.query().filter().subquery.return_value = MagicMock()
    # For tasks: query().filter().all()
    # For sessions: query().join().filter().all()
    db.query().filter().all.return_value = [MockTask(TaskStatusEnum.completed), MockTask(TaskStatusEnum.failed), MockTask(TaskStatusEnum.rescheduled)]
    db.query().join().filter().all.return_value = [MockSession(WorkSessionStatusEnum.completed, 30, 30), MockSession(WorkSessionStatusEnum.abandoned, 30, 0)]


    service = KPIService(db)
    res = service.get_execution_kpis(date(2026, 1, 1), date(2026, 1, 7))

    assert res["total_terminal_tasks"] == 3
    # completion rate: 1 completed / 3 total = 0.33
    assert res["completion_rate"] == 0.33
    # reliability: (1 completed + 1 rescheduled) / 3 total = 0.67
    assert res["execution_reliability"] == 0.67
    # schedule adherence: 1 completed session / 2 total = 0.5
    assert res["schedule_adherence"] == 0.5

def test_time_kpis():
    db = MagicMock()
    db.query().join().filter().all.return_value = [
        # (planned, actual)
        (30, 45), # +15 variance, 1.5 ratio
        (60, 60), # 0 variance, 1.0 ratio
    ]

    service = KPIService(db)
    res = service.get_time_kpis(date(2026, 1, 1), date(2026, 1, 7))

    # variance: (15 + 0) / 2 = 7.5
    assert res["estimated_vs_actual_variance_minutes"] == 7.5
    # overrun: (1.5 + 1.0) / 2 = 1.25
    assert res["average_task_overrun_ratio"] == 1.25
