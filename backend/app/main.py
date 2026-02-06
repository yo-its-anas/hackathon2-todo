"""
FastAPI application entry point.

Main application instance with router registration and database initialization.
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

# Configure logging
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.database import engine
from app.routers import tasks, chat
# Import models to register them with SQLModel metadata
from app.models import Conversation, Message  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan event handler.

    Creates database tables on startup.
    """
    # Startup: Create all database tables
    logger.info("Starting Todo REST API...")
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables created/verified")

    logger.info(f"MCP Server expected at: http://localhost:{os.getenv('MCP_SERVER_PORT', '8001')}/mcp")
    yield
    # Shutdown: Add cleanup logic here if needed
    logger.info("Shutting down Todo REST API...")


# Create FastAPI application instance
app = FastAPI(
    title="Todo REST API",
    description="Multi-user todo application with persistent storage",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS - credentials require explicit origins (not "*")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Must be explicit when allow_credentials=True
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Register routers
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(chat.router, prefix="/api", tags=["chat"])


@app.get("/")
def root() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo REST API is running"}
