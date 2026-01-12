"""
Database connection and session management.

Uses SQLModel engine with pooled Neon PostgreSQL connection.
"""
import os
from typing import Generator

from sqlmodel import Session, create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# SQL echo configuration (disable in production for performance)
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() in ("true", "1", "yes")

# Create engine with connection pooling
# Neon PostgreSQL requires pooled connections for serverless
engine = create_engine(
    DATABASE_URL,
    echo=SQL_ECHO,  # Log SQL queries (controlled via SQL_ECHO env var)
    pool_pre_ping=True,  # Verify connections before using
)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.

    Yields a session and ensures proper cleanup after request.
    Use with FastAPI's Depends() for dependency injection.
    """
    with Session(engine) as session:
        yield session
