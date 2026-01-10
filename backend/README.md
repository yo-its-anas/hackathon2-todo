# Todo REST API - Backend

Multi-user todo application with persistent storage using FastAPI, SQLModel, and Neon PostgreSQL.

## Features

- **JWT Authentication**: Secure token-based authentication with Better Auth integration
- **User Isolation**: All tasks are scoped to authenticated users with cryptographic verification
- **Full CRUD Operations**: Create, Read, Update, Delete tasks
- **Data Validation**: Automatic validation with Pydantic schemas
- **Persistent Storage**: PostgreSQL database with SQLModel ORM
- **RESTful API**: OpenAPI-compliant endpoints with automatic documentation
- **Ownership Enforcement**: Backend verifies JWT signatures and prevents cross-user access

## Tech Stack

- **FastAPI** 0.115+ - Modern Python web framework
- **SQLModel** 0.0.24+ - Type-safe ORM combining SQLAlchemy and Pydantic
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Pydantic** 2.0+ - Data validation using Python type hints
- **Uvicorn** - ASGI server for running the application

## Setup

### Prerequisites

- Python 3.13+
- Neon PostgreSQL database (or any PostgreSQL 12+)

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
# Copy example env file
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Format: postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
```

3. Run the server:
```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Database Setup

The database tables are created automatically on application startup using SQLModel's `metadata.create_all()` function.

## API Endpoints

All endpoints are prefixed with `/api`.

### View All Tasks

**GET** `/api/{user_id}/tasks`

Returns all tasks for the specified user.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "is_completed": false,
    "created_at": "2026-01-08T10:00:00",
    "updated_at": "2026-01-08T10:00:00",
    "user_id": "user1"
  }
]
```

### View Single Task

**GET** `/api/{user_id}/tasks/{id}`

Returns a specific task by ID.

**Response**: `200 OK` or `404 Not Found`

### Create Task

**POST** `/api/{user_id}/tasks`

Creates a new task for the specified user.

**Request Body**:
```json
{
  "title": "Task title (required)",
  "description": "Optional description"
}
```

**Response**: `201 Created`

### Update Task

**PUT** `/api/{user_id}/tasks/{id}`

Updates an existing task. All fields are optional.

**Request Body**:
```json
{
  "title": "New title",
  "description": "New description",
  "is_completed": true
}
```

**Response**: `200 OK` or `404 Not Found`

### Toggle Task Completion

**PATCH** `/api/{user_id}/tasks/{id}/complete`

Toggles the completion status of a task (true ↔ false).

**Response**: `200 OK` or `404 Not Found`

### Delete Task

**DELETE** `/api/{user_id}/tasks/{id}`

Permanently deletes a task.

**Response**: `204 No Content` or `404 Not Found`

## JWT Authentication

All API endpoints now require JWT authentication. The backend verifies JWT tokens issued by Better Auth.

### Authentication Setup

1. **Generate Secret** (minimum 32 characters):
```bash
openssl rand -base64 32
```

2. **Configure Environment**:
Add `BETTER_AUTH_SECRET` to your `.env` file (must match frontend secret):
```bash
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-replace-this-in-production
```

3. **Token Verification Process**:
- Frontend (Better Auth) issues JWT tokens signed with `BETTER_AUTH_SECRET`
- Backend extracts token from `Authorization: Bearer <token>` header
- Backend verifies signature using same `BETTER_AUTH_SECRET`
- Backend extracts `user_id` from JWT `sub` (subject) claim
- Backend enforces ownership: authenticated user must match URL `user_id`

### Making Authenticated Requests

All API requests must include JWT token in Authorization header:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \\
     http://localhost:8000/api/user123/tasks
```

### Authentication Errors

- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **403 Forbidden**: Valid token but user trying to access another user's resources

Example authenticated request:
```python
import requests

headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "http://localhost:8000/api/user123/tasks",
    headers=headers
)
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | JWT signing/verification secret (min 32 chars) | Generated with `openssl rand -base64 32` |

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Testing

Run tests with pytest:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_tasks.py

# Run with verbose output
pytest -v
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database connection and session management
│   ├── dependencies.py      # FastAPI dependencies (SessionDep)
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel definition
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic schemas (TaskCreate, TaskUpdate, TaskResponse)
│   └── routers/
│       ├── __init__.py
│       └── tasks.py         # Task API endpoints
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_models.py       # Model validation tests
│   └── test_tasks.py        # API integration tests
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variable template
└── README.md               # This file
```

## Security Considerations

- **User Isolation**: All queries filter by `user_id` to prevent data leakage
- **Input Validation**: Pydantic automatically validates all inputs
- **SQL Injection**: SQLModel uses parameterized queries
- **Environment Variables**: Sensitive data (DATABASE_URL) stored in `.env` (never committed)

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `404 Not Found` - Resource doesn't exist or belongs to different user
- `422 Unprocessable Entity` - Validation error (invalid input)
- `500 Internal Server Error` - Server error

## Development

### Code Quality

The codebase follows:
- Type hints for all function signatures
- Docstrings for all public functions
- Pydantic validation for all inputs
- User isolation in all database queries

### Adding New Endpoints

1. Define Pydantic schemas in `app/schemas/`
2. Create SQLModel models in `app/models/`
3. Implement endpoint in `app/routers/`
4. Add tests in `tests/`

## License

See project root for license information.
