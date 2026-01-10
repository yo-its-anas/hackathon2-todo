"""
Pytest fixtures for testing.

Provides test database, test client, test session, and JWT token fixtures.
"""
import os
from datetime import datetime, timedelta
from typing import Callable

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.auth import get_current_user
from app.database import get_session
from app.main import app

# Test secret for JWT signing
TEST_SECRET = "test-secret-key-min-32-chars-for-testing-purposes-only"


@pytest.fixture(name="session")
def session_fixture():
    """
    Create a test database session.

    Uses an in-memory SQLite database for fast, isolated tests.
    """
    # Create in-memory SQLite database
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create all tables
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Create a test client with overridden database session.

    Args:
        session: Test database session (injected by pytest)

    Returns:
        TestClient configured to use test database
    """

    def get_session_override():
        return session

    # Override the database session dependency
    app.dependency_overrides[get_session] = get_session_override

    # Create test client
    client = TestClient(app)

    yield client

    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture(name="create_test_jwt")
def create_test_jwt_fixture() -> Callable[[str], str]:
    """
    Fixture that returns a function to create valid test JWT tokens.

    Returns:
        Function that takes user_id and returns a signed JWT token

    Usage:
        def test_something(create_test_jwt):
            token = create_test_jwt("user123")
            headers = {"Authorization": f"Bearer {token}"}
            response = client.get("/api/user123/tasks", headers=headers)
    """
    # Set test secret in environment
    os.environ["BETTER_AUTH_SECRET"] = TEST_SECRET

    def _create_jwt(user_id: str, expires_in_hours: int = 24) -> str:
        """
        Create a valid JWT token for testing.

        Args:
            user_id: The user ID to include in the 'sub' claim
            expires_in_hours: Token expiry time (default 24 hours)

        Returns:
            Signed JWT token string
        """
        payload = {
            "sub": user_id,
            "exp": datetime.utcnow() + timedelta(hours=expires_in_hours),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, TEST_SECRET, algorithm="HS256")

    return _create_jwt


@pytest.fixture(name="auth_client")
def auth_client_fixture(client: TestClient, create_test_jwt: Callable[[str], str]):
    """
    Test client with authentication helper for protected endpoints.

    Returns a client with helper methods to make authenticated requests.

    Usage:
        def test_something(auth_client):
            response = auth_client.get_as("user123", "/api/user123/tasks")
    """

    class AuthenticatedClient:
        def __init__(self, client: TestClient, jwt_factory: Callable[[str], str]):
            self.client = client
            self.jwt_factory = jwt_factory

        def get_as(self, user_id: str, url: str, **kwargs):
            """Make authenticated GET request."""
            token = self.jwt_factory(user_id)
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = f"Bearer {token}"
            return self.client.get(url, headers=headers, **kwargs)

        def post_as(self, user_id: str, url: str, **kwargs):
            """Make authenticated POST request."""
            token = self.jwt_factory(user_id)
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = f"Bearer {token}"
            return self.client.post(url, headers=headers, **kwargs)

        def put_as(self, user_id: str, url: str, **kwargs):
            """Make authenticated PUT request."""
            token = self.jwt_factory(user_id)
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = f"Bearer {token}"
            return self.client.put(url, headers=headers, **kwargs)

        def patch_as(self, user_id: str, url: str, **kwargs):
            """Make authenticated PATCH request."""
            token = self.jwt_factory(user_id)
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = f"Bearer {token}"
            return self.client.patch(url, headers=headers, **kwargs)

        def delete_as(self, user_id: str, url: str, **kwargs):
            """Make authenticated DELETE request."""
            token = self.jwt_factory(user_id)
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = f"Bearer {token}"
            return self.client.delete(url, headers=headers, **kwargs)

    # Override get_current_user to bypass actual JWT verification in integration tests
    # and use the test secret instead
    async def mock_get_current_user_override():
        # This will be overridden per-test by the auth_client helpers
        pass

    return AuthenticatedClient(client, create_test_jwt)
