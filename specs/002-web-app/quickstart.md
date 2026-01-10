# Quickstart Guide: Backend REST API

**Feature**: 002-web-app (Backend REST API & Persistent Data Layer)
**Date**: 2026-01-08

## Overview

This guide helps developers set up and run the Todo API backend locally.

## Prerequisites

- Python 3.13+
- PostgreSQL database (Neon Serverless recommended)
- Git
- pip (Python package manager)

## Project Structure

```
todo-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app instance
│   │   ├── database.py          # Database engine and session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── task.py          # SQLModel Task table
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── task.py          # Request/response schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── tasks.py         # Task API endpoints
│   │   └── dependencies.py      # Shared dependencies
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_tasks.py        # Task endpoint tests
│   │   └── conftest.py          # pytest fixtures
│   ├── .env                     # Environment variables (not in git)
│   ├── .env.example             # Environment template
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # Backend documentation
├── specs/
│   └── 002-web-app/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md        # This file
│       └── contracts/
│           └── openapi.yaml
└── README.md                    # Project root documentation
```

## Setup Instructions

### 1. Database Setup (Neon)

1. **Create Neon Account**: Sign up at https://neon.tech
2. **Create Project**: Name it "todo-app" or similar
3. **Get Connection String**:
   - Navigate to your project dashboard
   - Find the "Connection Details" section
   - Copy the **pooled connection string** (contains `-pooler` in hostname)
   - Format: `postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require`

4. **Save Connection String**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your connection string:
   # DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Python Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3.13 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Required Dependencies** (requirements.txt):
```
fastapi>=0.115.0
sqlmodel>=0.0.24
uvicorn[standard]>=0.30.0
psycopg2-binary>=2.9.9
python-dotenv>=1.0.0
pydantic>=2.0.0
httpx>=0.27.0  # for testing
pytest>=8.0.0  # for testing
pytest-asyncio>=0.23.0  # for testing
```

### 3. Database Initialization

The database tables will be created automatically on first startup:

```python
# backend/app/main.py
from app.database import create_db_and_tables

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
```

### 4. Run the Server

```bash
# From backend/ directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5. Verify Installation

**Health Check**:
```bash
curl http://localhost:8000/docs
# Should open interactive API documentation (Swagger UI)
```

**Test API Endpoint**:
```bash
# Create a task
curl -X POST "http://localhost:8000/api/1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "description": "Testing the API"}'

# Expected response (201 Created):
{
  "id": 1,
  "title": "Test task",
  "description": "Testing the API",
  "is_completed": false,
  "created_at": "2026-01-08T12:00:00Z",
  "updated_at": "2026-01-08T12:00:00Z",
  "user_id": 1
}

# List tasks for user 1
curl http://localhost:8000/api/1/tasks

# Expected response (200 OK):
[
  {
    "id": 1,
    "title": "Test task",
    "description": "Testing the API",
    "is_completed": false,
    "created_at": "2026-01-08T12:00:00Z",
    "updated_at": "2026-01-08T12:00:00Z",
    "user_id": 1
  }
]
```

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Running Tests

```bash
# From backend/ directory with venv activated
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_tasks.py

# Run specific test
pytest tests/test_tasks.py::test_create_task
```

## Environment Variables

Required environment variables (`.env` file):

```env
# Database connection (Neon pooled connection string)
DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require

# Optional: Enable SQL query logging (development only)
DATABASE_ECHO=true

# Optional: Server configuration
HOST=0.0.0.0
PORT=8000
```

## Common Issues & Troubleshooting

### Issue: "Connection refused" when connecting to database

**Solution**:
- Verify DATABASE_URL is correct in `.env`
- Check that Neon project is running (not suspended)
- Ensure network connectivity to Neon servers
- Verify SSL mode is `require` in connection string

### Issue: "Module not found" errors

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Table already exists" error

**Solution**:
```bash
# Drop and recreate tables (WARNING: deletes all data)
# Connect to Neon console and run:
DROP TABLE IF EXISTS task CASCADE;

# Restart the server to recreate tables
```

### Issue: Port 8000 already in use

**Solution**:
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001

# Or kill the process using port 8000
# Linux/macOS:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## Development Workflow

1. **Make Code Changes**: Edit files in `backend/app/`
2. **Auto-Reload**: Uvicorn with `--reload` automatically restarts on file changes
3. **Test Changes**: Use Swagger UI or curl to test endpoints
4. **Run Tests**: `pytest` before committing
5. **Commit**: Follow Spec-Driven Development workflow

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks for user |
| POST | `/api/{user_id}/tasks` | Create new task |
| GET | `/api/{user_id}/tasks/{id}` | Get task details |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle task completion |

## User ID Note

In this phase, `user_id` is a URL path parameter without authentication.

**Current Behavior**: Any client can specify any `user_id` in the URL.

**Future Enhancement**: In Phase 2 (Authentication), the `user_id` will be extracted from a JWT token, ensuring users can only access their own tasks.

## Data Isolation Testing

To verify data isolation:

```bash
# Create task for user 1
curl -X POST "http://localhost:8000/api/1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "User 1 task"}'

# Create task for user 2
curl -X POST "http://localhost:8000/api/2/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "User 2 task"}'

# List user 1 tasks (should only show user 1 task)
curl http://localhost:8000/api/1/tasks

# List user 2 tasks (should only show user 2 task)
curl http://localhost:8000/api/2/tasks

# Try to access user 2's task as user 1 (should return 404)
curl http://localhost:8000/api/1/tasks/2
```

## Next Steps

1. **Complete Implementation**: Use `/sp.implement` to generate code from tasks.md
2. **Add Authentication**: Phase 2 - JWT-based user authentication
3. **Frontend Integration**: Phase 3 - Next.js frontend consuming this API
4. **Deployment**: Deploy to production environment with proper secrets management

## Support

- **Documentation**: See `specs/002-web-app/` for full specification
- **API Contract**: See `specs/002-web-app/contracts/openapi.yaml`
- **Data Model**: See `specs/002-web-app/data-model.md`
- **Issues**: Report bugs in project issue tracker
