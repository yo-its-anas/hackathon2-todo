"""
Integration tests for task API endpoints.

Tests all 6 user stories with acceptance criteria from spec.md.
"""
from fastapi.testclient import TestClient


# User Story 1: View All Tasks [P1]


def test_get_all_tasks_returns_all_user_tasks(client: TestClient):
    """Test that GET /api/{user_id}/tasks returns all tasks for a user."""
    # Create 5 tasks for user1
    for i in range(5):
        response = client.post(
            "/api/user1/tasks",
            json={"title": f"Task {i+1}", "description": f"Description {i+1}"},
        )
        assert response.status_code == 201

    # Get all tasks
    response = client.get("/api/user1/tasks")
    assert response.status_code == 200

    tasks = response.json()
    assert len(tasks) == 5
    assert all(task["user_id"] == "user1" for task in tasks)
    assert all("id" in task for task in tasks)
    assert all("created_at" in task for task in tasks)


def test_get_all_tasks_empty_list(client: TestClient):
    """Test that GET /api/{user_id}/tasks returns empty array when no tasks exist."""
    response = client.get("/api/user_no_tasks/tasks")
    assert response.status_code == 200
    assert response.json() == []


def test_get_all_tasks_user_isolation(client: TestClient):
    """Test that users can only see their own tasks (no data leakage)."""
    # Create tasks for user1
    client.post("/api/user1/tasks", json={"title": "User1 Task 1"})
    client.post("/api/user1/tasks", json={"title": "User1 Task 2"})

    # Create tasks for user2
    client.post("/api/user2/tasks", json={"title": "User2 Task 1"})

    # User1 should only see their tasks
    response = client.get("/api/user1/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    assert all(task["user_id"] == "user1" for task in tasks)
    assert all("User1" in task["title"] for task in tasks)


# User Story 2: Create New Task [P1]


def test_create_task_with_title_and_description(client: TestClient):
    """Test creating a task with title and description."""
    response = client.post(
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


def test_create_task_with_title_only(client: TestClient):
    """Test creating a task with only title (description optional)."""
    response = client.post("/api/user1/tasks", json={"title": "Title Only"})

    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "Title Only"
    assert task["description"] is None


def test_create_task_empty_title_fails(client: TestClient):
    """Test that creating a task with empty title returns 422."""
    response = client.post("/api/user1/tasks", json={"title": ""})

    assert response.status_code == 422


def test_create_task_isolation(client: TestClient):
    """Test that task created by user1 doesn't appear for user2."""
    # User1 creates a task
    response = client.post("/api/user1/tasks", json={"title": "User1 Task"})
    assert response.status_code == 201

    # User2 should not see it
    response = client.get("/api/user2/tasks")
    assert response.status_code == 200
    assert len(response.json()) == 0


# User Story 6: Toggle Completion [P1]


def test_toggle_task_completion_incomplete_to_complete(client: TestClient):
    """Test toggling incomplete task to complete."""
    # Create task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]
    original_updated_at = create_response.json()["updated_at"]

    # Toggle to complete
    response = client.patch(f"/api/user1/tasks/{task_id}/complete")
    assert response.status_code == 200
    task = response.json()
    assert task["is_completed"] is True
    assert task["updated_at"] != original_updated_at


def test_toggle_task_completion_complete_to_incomplete(client: TestClient):
    """Test toggling complete task to incomplete."""
    # Create and toggle task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]
    client.patch(f"/api/user1/tasks/{task_id}/complete")

    # Toggle back to incomplete
    response = client.patch(f"/api/user1/tasks/{task_id}/complete")
    assert response.status_code == 200
    assert response.json()["is_completed"] is False


def test_toggle_completion_wrong_user(client: TestClient):
    """Test that toggling task belonging to different user returns 404."""
    # User1 creates task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]

    # User2 tries to toggle it
    response = client.patch(f"/api/user2/tasks/{task_id}/complete")
    assert response.status_code == 404


def test_toggle_completion_nonexistent_task(client: TestClient):
    """Test that toggling nonexistent task returns 404."""
    response = client.patch("/api/user1/tasks/9999/complete")
    assert response.status_code == 404


# User Story 3: View Single Task [P2]


def test_get_task_by_id(client: TestClient):
    """Test getting a specific task by ID."""
    # Create task
    create_response = client.post(
        "/api/user1/tasks",
        json={"title": "Test Task", "description": "Description"},
    )
    task_id = create_response.json()["id"]

    # Get task by ID
    response = client.get(f"/api/user1/tasks/{task_id}")
    assert response.status_code == 200
    task = response.json()
    assert task["id"] == task_id
    assert task["title"] == "Test Task"
    assert task["description"] == "Description"


def test_get_task_nonexistent(client: TestClient):
    """Test that getting nonexistent task returns 404."""
    response = client.get("/api/user1/tasks/9999")
    assert response.status_code == 404


def test_get_task_wrong_user(client: TestClient):
    """Test that getting task belonging to different user returns 404."""
    # User1 creates task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]

    # User2 tries to access it
    response = client.get(f"/api/user2/tasks/{task_id}")
    assert response.status_code == 404


# User Story 4: Update Task [P2]


def test_update_task_title(client: TestClient):
    """Test updating task title."""
    # Create task
    create_response = client.post("/api/user1/tasks", json={"title": "Old"})
    task_id = create_response.json()["id"]
    original_created_at = create_response.json()["created_at"]

    # Update title
    response = client.put(
        f"/api/user1/tasks/{task_id}", json={"title": "New Title"}
    )
    assert response.status_code == 200
    task = response.json()
    assert task["title"] == "New Title"
    assert task["created_at"] == original_created_at  # Should not change


def test_update_task_empty_title_fails(client: TestClient):
    """Test that updating task with empty title returns 422."""
    # Create task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]

    # Update with empty title
    response = client.put(f"/api/user1/tasks/{task_id}", json={"title": ""})
    assert response.status_code == 422


def test_update_task_wrong_user(client: TestClient):
    """Test that updating task belonging to different user returns 404."""
    # User1 creates task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]

    # User2 tries to update it
    response = client.put(
        f"/api/user2/tasks/{task_id}", json={"title": "New"}
    )
    assert response.status_code == 404


def test_update_task_partial(client: TestClient):
    """Test partial update (only some fields)."""
    # Create task
    create_response = client.post(
        "/api/user1/tasks",
        json={"title": "Original", "description": "Original description"},
    )
    task_id = create_response.json()["id"]

    # Update only description
    response = client.put(
        f"/api/user1/tasks/{task_id}",
        json={"description": "New description"},
    )
    assert response.status_code == 200
    task = response.json()
    assert task["title"] == "Original"  # Should not change
    assert task["description"] == "New description"


# User Story 5: Delete Task [P3]


def test_delete_task(client: TestClient):
    """Test deleting a task."""
    # Create task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]

    # Delete task
    response = client.delete(f"/api/user1/tasks/{task_id}")
    assert response.status_code == 204

    # Verify task is deleted
    get_response = client.get(f"/api/user1/tasks/{task_id}")
    assert get_response.status_code == 404


def test_delete_task_nonexistent(client: TestClient):
    """Test that deleting nonexistent task returns 404."""
    response = client.delete("/api/user1/tasks/9999")
    assert response.status_code == 404


def test_delete_task_wrong_user(client: TestClient):
    """Test that deleting task belonging to different user returns 404."""
    # User1 creates task
    create_response = client.post("/api/user1/tasks", json={"title": "Task"})
    task_id = create_response.json()["id"]

    # User2 tries to delete it
    response = client.delete(f"/api/user2/tasks/{task_id}")
    assert response.status_code == 404


# Negative tests (T035)


def test_malformed_task_id(client: TestClient):
    """Test that malformed task ID returns 422."""
    response = client.get("/api/user1/tasks/not_a_number")
    assert response.status_code == 422


def test_extremely_long_title(client: TestClient):
    """Test that extremely long title (>255 chars) returns 422."""
    long_title = "a" * 300
    response = client.post("/api/user1/tasks", json={"title": long_title})
    assert response.status_code == 422


def test_missing_required_field(client: TestClient):
    """Test that creating task without title returns 422."""
    response = client.post("/api/user1/tasks", json={"description": "No title"})
    assert response.status_code == 422
