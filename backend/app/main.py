"""
FastAPI application entry point.

Main application instance with router registration and database initialization.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.database import engine
from app.routers import tasks


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan event handler.

    Creates database tables on startup.
    """
    # Startup: Create all database tables
    SQLModel.metadata.create_all(engine)
    yield
    # Shutdown: Add cleanup logic here if needed


# Create FastAPI application instance
app = FastAPI(
    title="Todo REST API",
    description="Multi-user todo application with persistent storage",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for future frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Register routers
app.include_router(tasks.router, prefix="/api", tags=["tasks"])


@app.get("/")
def root() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo REST API is running"}
