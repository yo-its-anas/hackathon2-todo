---
title: Todo App Backend API
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Todo Backend API

Multi-user todo application with AI chatbot, powered by FastAPI, OpenAI Agents SDK, and Neon PostgreSQL.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start MCP Server (Terminal 1)
python -m app.mcp.server

# 4. Start FastAPI (Terminal 2)
uvicorn app.main:app --reload --port 8000
```

## Docker Deployment

The Dockerfile runs both FastAPI and MCP server in a single container.

```bash
# Build
docker build -t todo-backend .

# Run locally
docker run -p 7860:7860 \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e OPENAI_API_KEY="sk-..." \
  todo-backend

# Test
curl http://localhost:7860/
```

## Hugging Face Spaces Deployment

1. Create a new Docker Space at [huggingface.co/new-space](https://huggingface.co/new-space)
2. Push this repository to the Space
3. Add secrets in Space Settings:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `OPENAI_API_KEY`

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete instructions.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | - | JWT secret (min 32 chars) |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `LLM_MODEL` | No | `gpt-4o-mini` | OpenAI model |
| `MCP_SERVER_PORT` | No | `8001` | Internal MCP server port |
| `PORT` | No | `7860` | FastAPI port (HF injects this) |

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/{user_id}/tasks` | List all tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{id}` | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |
| POST | `/api/{user_id}/chat` | Send chat message |

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Container                    │
│  ┌─────────────────┐    ┌─────────────────────┐ │
│  │  FastAPI (:7860)│◄──►│  MCP Server (:8001) │ │
│  │  - REST API     │    │  - AI Tool Server   │ │
│  │  - JWT Auth     │    │  - Task Operations  │ │
│  │  - Agent Runner │    │  - Internal Only    │ │
│  └────────┬────────┘    └─────────────────────┘ │
└───────────┼─────────────────────────────────────┘
            │
            ▼
    ┌───────────────┐      ┌─────────────────┐
    │ Neon PostgreSQL│      │   OpenAI API    │
    │   (Database)  │      │   (LLM Model)   │
    └───────────────┘      └─────────────────┘
```

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI application
│   ├── auth.py           # JWT verification
│   ├── database.py       # Database connection
│   ├── dependencies.py   # FastAPI dependencies
│   ├── models/           # SQLModel definitions
│   ├── schemas/          # Pydantic schemas
│   ├── routers/          # API endpoints
│   ├── services/         # Business logic
│   └── mcp/
│       ├── server.py     # MCP server setup
│       └── tools.py      # MCP tool definitions
├── Dockerfile            # Production container
├── start.sh              # Entrypoint script
├── requirements.txt      # Python dependencies
└── .env.example          # Environment template
```

## AI Chatbot

Natural language task management via MCP tools:

- **list_tasks** - View all tasks
- **add_task** - Create a new task
- **complete_task** - Mark task as done
- **delete_task** - Remove a task
- **update_task** - Modify a task

Example chat:
```
User: "Add a task to buy groceries"
AI: "✅ Added 'buy groceries' to your tasks!"

User: "Show my tasks"
AI: "Here are your 3 tasks:
  ○ buy groceries
  ✓ finish report
  ○ call mom"
```

## Security

- JWT token verification on all endpoints
- User isolation (users only see their own tasks)
- Ownership enforcement at database query level
- Non-root container user
- Secrets via environment variables (never in code)

## License

See project root for license information.
