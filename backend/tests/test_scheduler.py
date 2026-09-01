import uuid
from datetime import date, time
from app.services.scheduler import generate_daily_schedule

class MockTask:
    def __init__(self, priority, estimated_duration_minutes=None, deadline=None):
        self.id = uuid.uuid4()
        self.priority = priority
        self.estimated_duration_minutes = estimated_duration_minutes
        self.deadline = deadline

def test_scheduler_normal_day():
    tasks = [
        MockTask(priority="high", estimated_duration_minutes=60),
        MockTask(priority="medium", estimated_duration_minutes=120)
    ]
    result = generate_daily_schedule(date(2026, 8, 20), 360, tasks)
    
    assert result["overcommitted"] is False
    assert len(result["unscheduled_task_ids"]) == 0
    assert len(result["time_blocks"]) == 2
    assert result["time_blocks"][0]["planned_duration_minutes"] == 60
    assert result["time_blocks"][0]["start_time"] == time(8, 0)
    assert result["time_blocks"][0]["end_time"] == time(9, 0)
    assert result["time_blocks"][1]["start_time"] == time(9, 0)
    assert result["time_blocks"][1]["end_time"] == time(11, 0)

def test_scheduler_overcommitted():
    tasks = [
        MockTask(priority="critical", estimated_duration_minutes=180),
        MockTask(priority="high", estimated_duration_minutes=120),
        MockTask(priority="medium", estimated_duration_minutes=120)  # Total 420, exceeds 360
    ]
    result = generate_daily_schedule(date(2026, 8, 20), 360, tasks)
    
    assert result["overcommitted"] is True
    assert len(result["time_blocks"]) == 2
    assert len(result["unscheduled_task_ids"]) == 1
    assert result["unscheduled_task_ids"][0] == str(tasks[2].id)

def test_scheduler_missing_estimate():
    tasks = [
        MockTask(priority="low")  # No estimate, should default to 30
    ]
    result = generate_daily_schedule(date(2026, 8, 20), 360, tasks)
    
    assert len(result["time_blocks"]) == 1
    assert result["time_blocks"][0]["planned_duration_minutes"] == 30

def test_scheduler_sorting():
    tasks = [
        MockTask(priority="low", deadline=date(2026, 8, 25), estimated_duration_minutes=60),
        MockTask(priority="high", deadline=date(2026, 8, 20), estimated_duration_minutes=60), # Should be first (early deadline)
        MockTask(priority="critical", deadline=None, estimated_duration_minutes=60), # Should be second (no deadline, highest priority)
    ]
    
    result = generate_daily_schedule(date(2026, 8, 20), 360, tasks)
    blocks = result["time_blocks"]
    
    assert blocks[0]["task_id"] == str(tasks[1].id)
    assert blocks[1]["task_id"] == str(tasks[0].id)
    assert blocks[2]["task_id"] == str(tasks[2].id)

def test_scheduler_with_offset_and_reduced_capacity():
    # 90 minutes already spent (e.g. 1h30m completed task), remaining capacity = 270 mins
    # offset start_time = 9:30 AM
    tasks = [
        MockTask(priority="high", estimated_duration_minutes=60)
    ]
    result = generate_daily_schedule(
        date(2026, 8, 20), 
        270, 
        tasks, 
        start_time_offset=time(9, 30)
    )
    
    assert result["overcommitted"] is False
    assert len(result["time_blocks"]) == 1
    assert result["time_blocks"][0]["start_time"] == time(9, 30)
    assert result["time_blocks"][0]["end_time"] == time(10, 30)

