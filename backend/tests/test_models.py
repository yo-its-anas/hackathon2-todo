"""
Unit tests for database models.

Tests Task model validation and constraints.
"""
from datetime import datetime

import pytest
from pydantic import ValidationError
from sqlmodel import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def test_task_model_requires_user_id(session: Session):
    """Test that Task model requires user_id field."""
    with pytest.raises(ValidationError):
        Task(title="Test task")  # Missing user_id should raise error


def test_task_model_sets_timestamps_automatically(session: Session):
    """Test that Task model sets created_at and updated_at automatically."""
    task = Task(title="Test task", user_id="user1")

    # Timestamps should be set automatically
    assert task.created_at is not None
    assert task.updated_at is not None
    assert isinstance(task.created_at, datetime)
    assert isinstance(task.updated_at, datetime)


def test_task_model_defaults_is_completed_to_false(session: Session):
    """Test that Task model defaults is_completed to False."""
    task = Task(title="Test task", user_id="user1")

    assert task.is_completed is False


def test_task_create_schema_validates_empty_title():
    """Test that TaskCreate schema rejects empty or whitespace-only titles."""
    # Empty string should fail
    with pytest.raises(ValidationError):
        TaskCreate(title="")

    # Whitespace-only should fail
    with pytest.raises(ValidationError):
        TaskCreate(title="   ")

    # Valid title should succeed
    valid_task = TaskCreate(title="Valid title")
    assert valid_task.title == "Valid title"


def test_task_create_schema_strips_whitespace():
    """Test that TaskCreate schema strips leading/trailing whitespace from title."""
    task_data = TaskCreate(title="  Valid title  ")
    assert task_data.title == "Valid title"


def test_task_create_schema_allows_optional_description():
    """Test that TaskCreate schema allows description to be None."""
    task_data = TaskCreate(title="Test")
    assert task_data.description is None

    task_data_with_desc = TaskCreate(title="Test", description="Description")
    assert task_data_with_desc.description == "Description"


def test_task_update_schema_all_fields_optional():
    """Test that TaskUpdate schema allows all fields to be optional."""
    # Empty update should be valid
    update_data = TaskUpdate()
    assert update_data.title is None
    assert update_data.description is None
    assert update_data.is_completed is None

    # Partial update should be valid
    partial_update = TaskUpdate(title="New title")
    assert partial_update.title == "New title"
    assert partial_update.description is None


def test_task_update_schema_validates_empty_title():
    """Test that TaskUpdate schema rejects empty or whitespace-only titles."""
    # Empty string should fail
    with pytest.raises(ValidationError):
        TaskUpdate(title="")

    # Whitespace-only should fail
    with pytest.raises(ValidationError):
        TaskUpdate(title="   ")

    # None should be allowed (means no update)
    update_data = TaskUpdate(title=None)
    assert update_data.title is None
