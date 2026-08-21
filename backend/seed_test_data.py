import sys
import os
from datetime import datetime, date, timedelta

# Add the app directory to the sys path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.goal import Goal
from app.models.project import Project
from app.models.task import Task, TaskPriorityEnum, TaskStatusEnum
from app.models.weekly_plan import WeeklyPlan, WeeklyPlanTask

def seed_data():
    db = SessionLocal()
    try:
        # 1. Create a dummy goal and project
        goal = Goal(
            title="System Stability & Polish",
            description="Ensure the application is robust and reliable.",
            status="active"
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

        project = Project(
            goal_id=goal.id,
            title="Backend Optimization Phase 1",
            description="Refactoring critical paths.",
            status="active"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 2. Create a Weekly Plan
        # Calculate start and end dates for the current week
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        weekly_plan = WeeklyPlan(
            week_start_date=start_of_week,
            notes="Finalize scheduling engine and test edge cases."
        )
        db.add(weekly_plan)
        db.commit()
        db.refresh(weekly_plan)

        # 3. Create 4 Tasks with status 'planned'
        # One task deliberately missing an estimate
        tasks_data = [
            {
                "title": "Refactor Authentication Flow",
                "priority": TaskPriorityEnum.critical,
                "estimated_duration_minutes": 180,
                "status": TaskStatusEnum.planned
            },
            {
                "title": "Optimize Database Queries",
                "priority": TaskPriorityEnum.high,
                "estimated_duration_minutes": 120,
                "status": TaskStatusEnum.planned
            },
            {
                "title": "Update API Documentation",
                "priority": TaskPriorityEnum.low,
                "estimated_duration_minutes": 60,
                "status": TaskStatusEnum.planned
            },
            {
                "title": "Investigate Memory Leak Edge Case",
                "priority": TaskPriorityEnum.high,
                "estimated_duration_minutes": None,  # Deliberately missing
                "status": TaskStatusEnum.planned
            }
        ]

        created_tasks = []
        for t_data in tasks_data:
            task = Task(
                project_id=project.id,
                **t_data
            )
            db.add(task)
            created_tasks.append(task)
        
        db.commit()
        for t in created_tasks:
            db.refresh(t)

        # 4. Attach tasks to Weekly Plan
        for task in created_tasks:
            wpt = WeeklyPlanTask(
                weekly_plan_id=weekly_plan.id,
                task_id=task.id
            )
            db.add(wpt)
        
        db.commit()

        print("Test data successfully seeded!")
        print(f"Goal: {goal.title}")
        print(f"Project: {project.title}")
        print(f"Weekly Plan starting on: {weekly_plan.week_start_date}")
        print("Tasks created and attached:")
        for t in created_tasks:
            print(f"- [{t.priority.upper()}] {t.title} ({t.estimated_duration_minutes}m)")

    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
