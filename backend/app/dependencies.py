"""
FastAPI dependencies for dependency injection.

Provides reusable type annotations for common dependencies.
"""
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.database import get_session

# Type alias for database session dependency
# Use as: def endpoint(session: SessionDep)
SessionDep = Annotated[Session, Depends(get_session)]
