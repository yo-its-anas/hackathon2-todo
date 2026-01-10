"""
JWT authentication module for FastAPI.

Provides JWT token verification and user identity extraction using
Better Auth's JWKS endpoint for EdDSA token verification.
"""
import os
from typing import Optional

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Initialize HTTPBearer security scheme for extracting tokens from Authorization header
security = HTTPBearer()

# Better Auth JWKS endpoint URL
BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
JWKS_URL = f"{BETTER_AUTH_URL}/api/auth/jwks"

# Cache for JWKS to avoid fetching on every request
_jwks_cache: Dict[str, Any] = {
    "keys": None,
    "last_fetch": 0,
    "ttl": 300,  # Cache for 5 minutes
}


def get_jwks_client() -> PyJWKClient:
    """
    Get a PyJWKClient for the Better Auth JWKS endpoint.
    Uses caching to avoid fetching keys on every request.
    """
    return PyJWKClient(JWKS_URL, cache_keys=True, lifespan=300)


# Global JWKS client instance
_jwks_client: Optional[PyJWKClient] = None


def get_signing_key(token: str):
    """
    Get the signing key for a JWT token from the JWKS endpoint.

    Args:
        token: The JWT token to get the signing key for

    Returns:
        The signing key for verifying the token
    """
    global _jwks_client

    if _jwks_client is None:
        _jwks_client = get_jwks_client()

    try:
        return _jwks_client.get_signing_key_from_jwt(token)
    except Exception:
        # If cache is stale, create a new client
        _jwks_client = get_jwks_client()
        return _jwks_client.get_signing_key_from_jwt(token)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    FastAPI dependency that extracts and verifies JWT from Authorization header.

    Uses Better Auth's JWKS endpoint to verify EdDSA-signed tokens.

    Args:
        credentials: HTTPBearer credentials containing the JWT token

    Returns:
        str: The user_id extracted from the JWT 'sub' (subject) claim

    Raises:
        HTTPException: 401 Unauthorized if token is missing, invalid, expired, or malformed
    """
    token = credentials.credentials

    try:
        # Get the signing key from JWKS
        signing_key = get_signing_key(token)

        # Decode and verify JWT signature with public key from JWKS
        # Skip audience verification since Better Auth sets custom audience
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "ES256", "RS256"],  # Support multiple algorithms
            options={"verify_aud": False},  # Skip audience verification
        )

        # Extract user_id from 'sub' (subject) claim
        user_id: Optional[str] = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing 'sub' claim",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
