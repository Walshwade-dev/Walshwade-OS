from datetime import date, datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.task import Task, TaskStatusEnum
from app.models.work_session import WorkSession, WorkSessionStatusEnum
from app.models.time_block import TimeBlock
from app.models.weekly_plan import WeeklyPlan, WeeklyPlanTask

class KPIService:
    def __init__(self, db: Session):
        self.db = db

    def get_execution_kpis(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """
        execution_reliability = (completed + rescheduled) / (completed + failed + rescheduled) tasks.
        completion_rate = completed / (completed + failed + rescheduled) tasks.
        schedule_adherence = completed sessions / total sessions in period.
        """
        # We define "tasks in period" as tasks that were created in or updated in this period, 
        # but a simpler proxy is tasks linked to time blocks in this period.
        # Note: This intentionally excludes tasks failed straight from the queue (without being scheduled).
        # Reliability measures adherence to COMMITMENTS (things you scheduled), not backlog housekeeping.
        tb_query = self.db.query(TimeBlock.task_id).filter(
            TimeBlock.date >= start_date, TimeBlock.date <= end_date
        ).subquery()

        tasks = self.db.query(Task.status).filter(Task.id.in_(tb_query)).all()
        
        completed_tasks = sum(1 for t in tasks if t.status == TaskStatusEnum.completed)
        rescheduled_tasks = sum(1 for t in tasks if t.status == TaskStatusEnum.rescheduled)
        failed_tasks = sum(1 for t in tasks if t.status == TaskStatusEnum.failed)
        
        total_terminal_tasks = completed_tasks + rescheduled_tasks + failed_tasks

        completion_rate = 0.0
        execution_reliability = 0.0
        
        if total_terminal_tasks > 0:
            completion_rate = round(completed_tasks / total_terminal_tasks, 2)
            execution_reliability = round((completed_tasks + rescheduled_tasks) / total_terminal_tasks, 2)

        # Schedule adherence
        sessions = self.db.query(WorkSession.status).join(TimeBlock).filter(
            TimeBlock.date >= start_date, TimeBlock.date <= end_date
        ).all()
        
        total_sessions = len(sessions)
        completed_sessions = sum(1 for s in sessions if s.status == WorkSessionStatusEnum.completed)
        
        schedule_adherence = 0.0
        if total_sessions > 0:
            schedule_adherence = round(completed_sessions / total_sessions, 2)

        return {
            "completion_rate": completion_rate,
            "schedule_adherence": schedule_adherence,
            "execution_reliability": execution_reliability,
            "total_terminal_tasks": total_terminal_tasks
        }

    def get_time_kpis(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """
        estimated_vs_actual = avg(actual_duration - estimated_duration) across completed sessions
        average_task_overrun = avg(actual_duration / estimated_duration) where estimated_duration is not null
        """
        sessions = self.db.query(WorkSession.planned_duration_minutes, WorkSession.actual_duration_minutes).join(TimeBlock).filter(
            TimeBlock.date >= start_date, 
            TimeBlock.date <= end_date,
            WorkSession.status == WorkSessionStatusEnum.completed
        ).all()

        if not sessions:
            return {
                "estimated_vs_actual_variance_minutes": 0.0,
                "average_task_overrun_ratio": 1.0
            }

        total_variance = 0
        total_ratio = 0.0
        valid_ratio_count = 0

        for planned, actual in sessions:
            if actual is None:
                continue
            total_variance += (actual - planned)
            if planned > 0:
                total_ratio += (actual / planned)
                valid_ratio_count += 1

        avg_variance = round(total_variance / len(sessions), 2)
        avg_overrun = round(total_ratio / valid_ratio_count, 2) if valid_ratio_count > 0 else 1.0

        return {
            "estimated_vs_actual_variance_minutes": avg_variance,
            "average_task_overrun_ratio": avg_overrun
        }

    def get_planning_kpis(self, weekly_plan_id: str, available_capacity_per_day: int = 360) -> Dict[str, Any]:
        """
        weekly_planned_capacity = sum of estimated_duration for tasks in a WeeklyPlan
        weekly_used_capacity = sum of actual_duration for completed sessions in that week
        overcommitment = planned_capacity > available_capacity (7 days * capacity)
        """
        plan = self.db.query(WeeklyPlan).filter(WeeklyPlan.id == weekly_plan_id).first()
        if not plan:
            return {}

        tasks = self.db.query(Task.estimated_duration_minutes).join(WeeklyPlanTask).filter(
            WeeklyPlanTask.weekly_plan_id == weekly_plan_id
        ).all()

        weekly_planned_capacity = sum((t.estimated_duration_minutes or 30) for t in tasks)
        
        # Approximate the week bounds
        # (For exact bounds, we would add 7 days to plan.week_start_date)
        
        sessions = self.db.query(WorkSession.actual_duration_minutes).join(TimeBlock).join(Task).join(WeeklyPlanTask).filter(
            WeeklyPlanTask.weekly_plan_id == weekly_plan_id,
            WorkSession.status == WorkSessionStatusEnum.completed
        ).all()

        weekly_used_capacity = sum((s.actual_duration_minutes or 0) for s in sessions)
        
        weekly_available = available_capacity_per_day * 7
        overcommitment = weekly_planned_capacity > weekly_available

        return {
            "weekly_planned_capacity": weekly_planned_capacity,
            "weekly_used_capacity": weekly_used_capacity,
            "weekly_available_capacity": weekly_available,
            "overcommitment": overcommitment
        }
