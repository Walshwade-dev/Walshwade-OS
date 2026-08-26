from unittest.mock import MagicMock

import pytest
from pydantic import ValidationError

from app.models.goal import Goal
from app.models.project import Project
from app.models.task import Task
from app.repositories.goal import GoalRepository
from app.repositories.project import ProjectRepository
from app.repositories.task import TaskRepository
from app.schemas.goal import GoalUpdate
from app.schemas.project import ProjectUpdate
from app.schemas.task import TaskUpdate


def test_goal_repository_update_and_delete():
    db = MagicMock()
    repo = GoalRepository(db)
    goal = Goal(
        title='Original Goal',
        description='Old description',
        domain='general',
        status='active',
    )
    goal.id = '11111111-1111-4111-8111-111111111111'

    db.query.return_value.filter.return_value.first.return_value = goal
    updated = repo.update(goal.id, GoalUpdate(title='Updated Goal', description='New description', domain='ai', status='paused'))

    assert updated.title == 'Updated Goal'
    assert updated.status == 'paused'
    assert updated.description == 'New description'

    repo.delete(goal.id)
    db.delete.assert_called_once_with(goal)
    db.commit.assert_called()


def test_project_repository_update_and_delete():
    db = MagicMock()
    repo = ProjectRepository(db)
    project = Project(goal_id='22222222-2222-4222-8222-222222222222', title='Original project', description='Old', status='active')
    project.id = '33333333-3333-4333-8333-333333333333'

    db.query.return_value.filter.return_value.first.return_value = project
    updated = repo.update(project.id, ProjectUpdate(title='Updated Project', description='Fresh', status='paused'))

    assert updated.title == 'Updated Project'
    assert updated.status == 'paused'
    assert updated.description == 'Fresh'

    repo.delete(project.id)
    db.delete.assert_called_once_with(project)
    db.commit.assert_called()


def test_task_repository_update_and_delete():
    db = MagicMock()
    repo = TaskRepository(db)
    task = Task(project_id='44444444-4444-4444-8444-444444444444', title='Original task', description='Old task', priority='medium', status='backlog')
    task.id = '55555555-5555-4555-8555-555555555555'

    db.query.return_value.filter.return_value.first.return_value = task
    updated = repo.update(task.id, TaskUpdate(title='Updated task', description='Fresh task', priority='high'))

    assert updated.title == 'Updated task'
    assert updated.status == 'backlog'
    assert updated.priority == 'high'

    repo.delete(task.id)
    db.delete.assert_called_once_with(task)
    db.commit.assert_called()


def test_task_update_rejects_status_field():
    with pytest.raises(ValidationError, match='Extra inputs are not permitted'):
        TaskUpdate.model_validate({
            'title': 'Updated task',
            'status': 'completed',
        })
