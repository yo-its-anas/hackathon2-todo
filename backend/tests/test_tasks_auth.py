"""
Integration tests for authenticated task API endpoints.

Tests all 6 user stories with JWT authentication and new auth-specific scenarios.
"""
from datetime import datetime, timedelta

import jwt

# Import TEST_SECRET from conftest
from conftest import TEST_SECRET


# =============================================================================
# NEW AUTH TESTS (T029)
# =============================================================================


def test_request_without_token_returns_401(client):
    """Test that request without JWT token returns 401 Unauthorized."""
    response = client.get("/api/user1/tasks")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_request_with_invalid_token_returns_401(client):
    """Test that request with invalid JWT signature returns 401 Unauthorized."""
    # Create token signed with wrong secret
    payload = {"sub": "user1", "exp": datetime.utcnow() + timedelta(hours=1)}
    invalid_token = jwt.encode(payload, "wrong-secret", algorithm="HS256")

    response = client.get(
        "/api/user1/tasks", headers={"Authorization": f"Bearer {invalid_token}"}
    )
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_request_with_expired_token_returns_401(client):
    """Test that request with expired JWT token returns 401 Unauthorized."""
    # Create expired token
    payload = {"sub": "user1", "exp": datetime.utcnow() - timedelta(hours=1)}
    expired_token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")

    response = client.get(
        "/api/user1/tasks", headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_cross_user_access_returns_403(auth_client):
    """Test that User1 cannot access User2's tasks with valid JWT (403 Forbidden)."""
    # User2 creates a task
    response = auth_client.post_as(
        "user2", "/api/user2/tasks", json={"title": "User2 Task"}
    )
    assert response.status_code == 201
    task_id = response.json()["id"]

    # User1 tries to access User2's tasks with valid JWT
    response = auth_client.get_as("user1", "/api/user2/tasks")
    assert response.status_code == 403
    assert "Cannot access resources" in response.json()["detail"]

    # User1 tries to access specific task of User2
    response = auth_client.get_as("user1", f"/api/user2/tasks/{task_id}")
    assert response.status_code == 403


def test_valid_token_with_correct_user_returns_200(auth_client):
    """Test that valid JWT for correct user returns 200 OK."""
    # User1 creates tasks
    auth_client.post_as("user1", "/api/user1/tasks", json={"title": "Task 1"})
    auth_client.post_as("user1", "/api/user1/tasks", json={"title": "Task 2"})

    # User1 accesses their own tasks
    response = auth_client.get_as("user1", "/api/user1/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    assert all(task["user_id"] == "user1" for task in tasks)


def test_authenticated_endpoints_enforce_ownership(auth_client):
    """Test that all CRUD operations enforce ownership validation."""
    # User1 creates a task
    response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "User1 Task"}
    )
    assert response.status_code == 201
    task_id = response.json()["id"]

    # User2 tries to GET User1's task - 403
    response = auth_client.get_as("user2", f"/api/user1/tasks/{task_id}")
    assert response.status_code == 403

    # User2 tries to PUT User1's task - 403
    response = auth_client.put_as(
        "user2", f"/api/user1/tasks/{task_id}", json={"title": "Hacked"}
    )
    assert response.status_code == 403

    # User2 tries to PATCH User1's task - 403
    response = auth_client.patch_as("user2", f"/api/user1/tasks/{task_id}/complete")
    assert response.status_code == 403

    # User2 tries to DELETE User1's task - 403
    response = auth_client.delete_as("user2", f"/api/user1/tasks/{task_id}")
    assert response.status_code == 403

    # Verify User1 can still access their task
    response = auth_client.get_as("user1", f"/api/user1/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "User1 Task"


# =============================================================================
# UPDATED EXISTING TESTS WITH AUTHENTICATION (T028)
# =============================================================================

# User Story 1: View All Tasks [P1]


def test_get_all_tasks_returns_all_user_tasks(auth_client):
    """Test that GET /api/{user_id}/tasks returns all tasks for authenticated user."""
    # Create 5 tasks for user1
    for i in range(5):
        response = auth_client.post_as(
            "user1",
            "/api/user1/tasks",
            json={"title": f"Task {i+1}", "description": f"Description {i+1}"},
        )
        assert response.status_code == 201

    # Get all tasks
    response = auth_client.get_as("user1", "/api/user1/tasks")
    assert response.status_code == 200

    tasks = response.json()
    assert len(tasks) == 5
    assert all(task["user_id"] == "user1" for task in tasks)
    assert all("id" in task for task in tasks)
    assert all("created_at" in task for task in tasks)


def test_get_all_tasks_empty_list(auth_client):
    """Test that GET /api/{user_id}/tasks returns empty array when no tasks exist."""
    response = auth_client.get_as("user_no_tasks", "/api/user_no_tasks/tasks")
    assert response.status_code == 200
    assert response.json() == []


def test_get_all_tasks_user_isolation(auth_client):
    """Test that users can only see their own tasks (no data leakage)."""
    # Create tasks for user1
    auth_client.post_as("user1", "/api/user1/tasks", json={"title": "User1 Task 1"})
    auth_client.post_as("user1", "/api/user1/tasks", json={"title": "User1 Task 2"})

    # Create tasks for user2
    auth_client.post_as("user2", "/api/user2/tasks", json={"title": "User2 Task 1"})

    # User1 should only see their tasks
    response = auth_client.get_as("user1", "/api/user1/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    assert all(task["user_id"] == "user1" for task in tasks)
    assert all("User1" in task["title"] for task in tasks)


# User Story 2: Create New Task [P1]


def test_create_task_with_title_and_description(auth_client):
    """Test creating a task with title and description."""
    response = auth_client.post_as(
        "user1",
        "/api/user1/tasks",
        json={"title": "New Task", "description": "Task description"},
    )

    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "New Task"
    assert task["description"] == "Task description"
    assert task["is_completed"] is False
    assert task["user_id"] == "user1"
    assert "id" in task
    assert "created_at" in task
    assert "updated_at" in task


def test_create_task_with_title_only(auth_client):
    """Test creating a task with only title (description optional)."""
    response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Title Only"}
    )

    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "Title Only"
    assert task["description"] is None


def test_create_task_empty_title_fails(auth_client):
    """Test that creating a task with empty title returns 422."""
    response = auth_client.post_as("user1", "/api/user1/tasks", json={"title": ""})
    assert response.status_code == 422


def test_create_task_isolation(auth_client):
    """Test that task created by user1 doesn't appear for user2."""
    # User1 creates a task
    response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "User1 Task"}
    )
    assert response.status_code == 201

    # User2 should not see it
    response = auth_client.get_as("user2", "/api/user2/tasks")
    assert response.status_code == 200
    assert len(response.json()) == 0


# User Story 6: Toggle Completion [P1]


def test_toggle_task_completion_incomplete_to_complete(auth_client):
    """Test toggling incomplete task to complete."""
    # Create task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]
    original_updated_at = create_response.json()["updated_at"]

    # Toggle to complete
    response = auth_client.patch_as("user1", f"/api/user1/tasks/{task_id}/complete")
    assert response.status_code == 200
    task = response.json()
    assert task["is_completed"] is True
    assert task["updated_at"] != original_updated_at


def test_toggle_task_completion_complete_to_incomplete(auth_client):
    """Test toggling complete task to incomplete."""
    # Create and toggle task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]
    auth_client.patch_as("user1", f"/api/user1/tasks/{task_id}/complete")

    # Toggle back to incomplete
    response = auth_client.patch_as("user1", f"/api/user1/tasks/{task_id}/complete")
    assert response.status_code == 200
    assert response.json()["is_completed"] is False


def test_toggle_completion_wrong_user(auth_client):
    """Test that toggling task belonging to different user returns 403."""
    # User1 creates task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]

    # User2 tries to toggle it - now returns 403 instead of 404
    response = auth_client.patch_as("user2", f"/api/user2/tasks/{task_id}/complete")
    assert response.status_code == 403


def test_toggle_completion_nonexistent_task(auth_client):
    """Test that toggling nonexistent task returns 404."""
    response = auth_client.patch_as("user1", "/api/user1/tasks/9999/complete")
    assert response.status_code == 404


# User Story 3: View Single Task [P2]


def test_get_task_by_id(auth_client):
    """Test getting a specific task by ID."""
    # Create task
    create_response = auth_client.post_as(
        "user1",
        "/api/user1/tasks",
        json={"title": "Test Task", "description": "Description"},
    )
    task_id = create_response.json()["id"]

    # Get task by ID
    response = auth_client.get_as("user1", f"/api/user1/tasks/{task_id}")
    assert response.status_code == 200
    task = response.json()
    assert task["id"] == task_id
    assert task["title"] == "Test Task"
    assert task["description"] == "Description"


def test_get_task_nonexistent(auth_client):
    """Test that getting nonexistent task returns 404."""
    response = auth_client.get_as("user1", "/api/user1/tasks/9999")
    assert response.status_code == 404


def test_get_task_wrong_user(auth_client):
    """Test that getting task belonging to different user returns 403."""
    # User1 creates task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]

    # User2 tries to access it - now returns 403 instead of 404
    response = auth_client.get_as("user2", f"/api/user2/tasks/{task_id}")
    assert response.status_code == 403


# User Story 4: Update Task [P2]


def test_update_task_title(auth_client):
    """Test updating task title."""
    # Create task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Old"}
    )
    task_id = create_response.json()["id"]
    original_created_at = create_response.json()["created_at"]

    # Update title
    response = auth_client.put_as(
        "user1", f"/api/user1/tasks/{task_id}", json={"title": "New Title"}
    )
    assert response.status_code == 200
    task = response.json()
    assert task["title"] == "New Title"
    assert task["created_at"] == original_created_at  # Should not change


def test_update_task_empty_title_fails(auth_client):
    """Test that updating task with empty title returns 422."""
    # Create task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]

    # Update with empty title
    response = auth_client.put_as(
        "user1", f"/api/user1/tasks/{task_id}", json={"title": ""}
    )
    assert response.status_code == 422


def test_update_task_wrong_user(auth_client):
    """Test that updating task belonging to different user returns 403."""
    # User1 creates task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]

    # User2 tries to update it - now returns 403 instead of 404
    response = auth_client.put_as(
        "user2", f"/api/user2/tasks/{task_id}", json={"title": "New"}
    )
    assert response.status_code == 403


def test_update_task_partial(auth_client):
    """Test partial update (only some fields)."""
    # Create task
    create_response = auth_client.post_as(
        "user1",
        "/api/user1/tasks",
        json={"title": "Original", "description": "Original description"},
    )
    task_id = create_response.json()["id"]

    # Update only description
    response = auth_client.put_as(
        "user1",
        f"/api/user1/tasks/{task_id}",
        json={"description": "New description"},
    )
    assert response.status_code == 200
    task = response.json()
    assert task["title"] == "Original"  # Should not change
    assert task["description"] == "New description"


# User Story 5: Delete Task [P3]


def test_delete_task(auth_client):
    """Test deleting a task."""
    # Create task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]

    # Delete task
    response = auth_client.delete_as("user1", f"/api/user1/tasks/{task_id}")
    assert response.status_code == 204

    # Verify task is deleted
    get_response = auth_client.get_as("user1", f"/api/user1/tasks/{task_id}")
    assert get_response.status_code == 404


def test_delete_task_nonexistent(auth_client):
    """Test that deleting nonexistent task returns 404."""
    response = auth_client.delete_as("user1", "/api/user1/tasks/9999")
    assert response.status_code == 404


def test_delete_task_wrong_user(auth_client):
    """Test that deleting task belonging to different user returns 403."""
    # User1 creates task
    create_response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": "Task"}
    )
    task_id = create_response.json()["id"]

    # User2 tries to delete it - now returns 403 instead of 404
    response = auth_client.delete_as("user2", f"/api/user2/tasks/{task_id}")
    assert response.status_code == 403


# Negative tests


def test_malformed_task_id(auth_client):
    """Test that malformed task ID returns 422."""
    response = auth_client.get_as("user1", "/api/user1/tasks/not_a_number")
    assert response.status_code == 422


def test_extremely_long_title(auth_client):
    """Test that extremely long title (>255 chars) returns 422."""
    long_title = "a" * 300
    response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"title": long_title}
    )
    assert response.status_code == 422


def test_missing_required_field(auth_client):
    """Test that creating task without title returns 422."""
    response = auth_client.post_as(
        "user1", "/api/user1/tasks", json={"description": "No title"}
    )
    assert response.status_code == 422
