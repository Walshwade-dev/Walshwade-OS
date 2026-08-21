from datetime import date, time, datetime, timedelta
from typing import List, Dict, Any

def get_priority_weight(priority: str) -> int:
    weights = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1
    }
    return weights.get(priority, 0)

def generate_daily_schedule(target_date: date, daily_capacity_minutes: int, tasks: List[Any]) -> Dict[str, Any]:
    """
    Pure function to generate a daily schedule deterministically.
    """
    DEFAULT_DURATION = 30
    START_HOUR = 8
    START_MINUTE = 0

    # Sort tasks: deadline ascending (None is far future), then priority descending
    # Using a high date for None deadlines so they sort last
    FAR_FUTURE = date(9999, 12, 31)
    
    sorted_tasks = sorted(
        tasks,
        key=lambda t: (
            t.deadline if t.deadline else FAR_FUTURE,
            -get_priority_weight(t.priority)
        )
    )

    time_blocks = []
    unscheduled_task_ids = []
    
    current_dt = datetime.combine(target_date, time(START_HOUR, START_MINUTE))
    used_minutes = 0

    for task in sorted_tasks:
        duration = task.estimated_duration_minutes if task.estimated_duration_minutes else DEFAULT_DURATION

        if used_minutes + duration <= daily_capacity_minutes:
            end_dt = current_dt + timedelta(minutes=duration)
            
            time_blocks.append({
                "task_id": str(task.id),
                "date": target_date,
                "start_time": current_dt.time(),
                "end_time": end_dt.time(),
                "planned_duration_minutes": duration
            })
            
            current_dt = end_dt
            used_minutes += duration
        else:
            unscheduled_task_ids.append(str(task.id))

    return {
        "time_blocks": time_blocks,
        "unscheduled_task_ids": unscheduled_task_ids,
        "overcommitted": len(unscheduled_task_ids) > 0
    }
