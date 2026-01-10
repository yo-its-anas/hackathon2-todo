"""
Tests for JWT authentication functionality.

Tests the get_current_user dependency with various token scenarios.
"""
import os
from datetime import datetime, timedelta

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.auth import get_current_user


# Test secret (same as used in conftest.py fixture)
TEST_SECRET = "test-secret-key-min-32-chars-for-testing-purposes-only"


def test_get_current_user_with_valid_token():
    """Test that valid JWT token returns user_id."""
    # Create valid JWT token
    payload = {
        "sub": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")

    # Create credentials object
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # Mock environment variable
    os.environ["BETTER_AUTH_SECRET"] = TEST_SECRET

    # Should return user_id without raising exception
    # Note: get_current_user is async, but in tests we can call it synchronously
    # In real scenario, we'd use pytest-asyncio
    try:
        import asyncio

        user_id = asyncio.run(get_current_user(credentials))
        assert user_id == "test_user_123"
    except RuntimeError:
        # If event loop is already running, use different approach
        import concurrent.futures

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(asyncio.run, get_current_user(credentials))
            user_id = future.result()
            assert user_id == "test_user_123"


def test_get_current_user_with_expired_token():
    """Test that expired JWT token raises 401 Unauthorized."""
    # Create expired JWT token
    payload = {
        "sub": "test_user_123",
        "exp": datetime.utcnow() - timedelta(hours=1),  # Expired 1 hour ago
    }
    token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")

    # Create credentials object
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # Mock environment variable
    os.environ["BETTER_AUTH_SECRET"] = TEST_SECRET

    # Should raise HTTPException 401
    with pytest.raises(HTTPException) as exc_info:
        import asyncio

        try:
            asyncio.run(get_current_user(credentials))
        except RuntimeError:
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, get_current_user(credentials))
                future.result()

    assert exc_info.value.status_code == 401
    assert "expired" in exc_info.value.detail.lower()


def test_get_current_user_with_invalid_signature():
    """Test that JWT with invalid signature raises 401 Unauthorized."""
    # Create JWT signed with wrong secret
    payload = {
        "sub": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    token = jwt.encode(payload, "wrong-secret-key", algorithm="HS256")

    # Create credentials object
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # Mock environment variable with correct secret
    os.environ["BETTER_AUTH_SECRET"] = TEST_SECRET

    # Should raise HTTPException 401
    with pytest.raises(HTTPException) as exc_info:
        import asyncio

        try:
            asyncio.run(get_current_user(credentials))
        except RuntimeError:
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, get_current_user(credentials))
                future.result()

    assert exc_info.value.status_code == 401
    assert "invalid" in exc_info.value.detail.lower()


def test_get_current_user_with_missing_sub_claim():
    """Test that JWT without 'sub' claim raises 401 Unauthorized."""
    # Create JWT without sub claim
    payload = {
        "email": "test@example.com",  # Wrong claim
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")

    # Create credentials object
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # Mock environment variable
    os.environ["BETTER_AUTH_SECRET"] = TEST_SECRET

    # Should raise HTTPException 401
    with pytest.raises(HTTPException) as exc_info:
        import asyncio

        try:
            asyncio.run(get_current_user(credentials))
        except RuntimeError:
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, get_current_user(credentials))
                future.result()

    assert exc_info.value.status_code == 401
    assert "sub" in exc_info.value.detail.lower()
