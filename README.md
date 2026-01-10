# Multi-User Todo Web Application

A production-ready, full-stack todo application with secure authentication, user isolation, and responsive design.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15+ (App Router), TypeScript, React 19+ |
| Backend | Python FastAPI 0.115+ |
| ORM | SQLModel 0.0.24+ |
| Database | Neon Serverless PostgreSQL |
| Auth | Better Auth 1.0+ with JWT plugin |

## Features

- **Secure Authentication**: JWT-based auth with Better Auth (24-hour sessions)
- **User Isolation**: All tasks scoped to authenticated users with cryptographic verification
- **Full CRUD Operations**: Create, read, update, delete, and toggle task completion
- **Responsive Design**: Mobile-first (320px+), tablet (768px+), desktop (1024px+)
- **Type-Safe**: TypeScript frontend + Python type hints backend
- **Auto-Documentation**: OpenAPI/Swagger UI at `/docs`

## Prerequisites

- Node.js 18+
- Python 3.13+
- Neon PostgreSQL database (or any PostgreSQL 12+)

## Quick Start

### 1. Clone and Setup Environment

```bash
# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt

# Frontend
cd ../frontend
cp .env.local.example .env.local
npm install
```

### 2. Configure Environment Variables

**Backend `.env`**:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_URL=http://localhost:3000
```

**Frontend `.env.local`**:
```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
DATABASE_URL=your-neon-postgres-url
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the Application

```bash
# Terminal 1 - Backend (port 8000)
cd backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
todo-app/
├── frontend/                 # Next.js 15+ App Router
│   ├── app/                  # Pages and routes
│   │   ├── auth/             # Sign-in, sign-up, sign-out
│   │   ├── tasks/            # Task management page
│   │   └── api/auth/         # Better Auth API routes
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Auth config, API client
│   └── services/             # Task CRUD methods
│
├── backend/                  # FastAPI REST API
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── auth.py           # JWT verification with JWKS
│   │   ├── database.py       # Database connection
│   │   ├── models/           # SQLModel definitions
│   │   ├── schemas/          # Pydantic schemas
│   │   └── routers/          # API endpoints
│   └── tests/                # Pytest test suite
│
└── specs/                    # Feature specifications
```

## API Endpoints

All endpoints require JWT token in `Authorization: Bearer <token>` header.

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/{user_id}/tasks` | List user's tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{id}` | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

## Authentication Flow

1. User signs up or signs in via Better Auth
2. Better Auth issues JWT token (EdDSA signed, 24-hour expiry)
3. Frontend attaches token to all API requests
4. Backend verifies JWT using JWKS endpoint (`/api/auth/jwks`)
5. Backend enforces ownership: token user must match URL `{user_id}`

## Security

- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **403 Forbidden**: Valid token but accessing another user's resources
- **User Isolation**: All queries filtered by authenticated `user_id`
- **SQL Injection**: SQLModel uses parameterized queries
- **Input Validation**: Pydantic schemas validate all inputs

## Development

```bash
# Backend
cd backend
uvicorn app.main:app --reload    # Dev server
pytest                            # Run tests
pytest --cov=app                  # Coverage report

# Frontend
cd frontend
npm run dev                       # Dev server
npm run build                     # Production build
npm run type-check                # TypeScript check
```

## Detailed Documentation

- [Frontend README](./frontend/README.md) - Next.js setup, components, responsive design
- [Backend README](./backend/README.md) - FastAPI setup, API details, testing

## License

See project root for license information.
