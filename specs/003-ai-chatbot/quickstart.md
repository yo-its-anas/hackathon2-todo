# Quickstart: Todo AI Chatbot

**Feature**: 003-ai-chatbot
**Prerequisites**: Existing Todo app running with Better Auth configured

## 1. Install Dependencies

### Backend
```bash
cd backend
pip install mcp openai-agents "openai-agents[litellm]" litellm
```

### Frontend
```bash
cd frontend
npm install
# No additional dependencies needed - uses custom React chat UI
```

## 2. Configure Environment

Add to `backend/.env`:
```env
# AI Chatbot Configuration
GEMINI_API_KEY=your-gemini-api-key
MCP_SERVER_URL=http://localhost:8001/mcp
CHAT_CONTEXT_LIMIT=50
RATE_LIMIT_PER_MINUTE=60
```

## 3. Run Database Migration

```bash
cd backend
python -c "
from app.database import engine
from app.models.conversation import Conversation
from app.models.message import Message
from sqlmodel import SQLModel
SQLModel.metadata.create_all(engine)
"
```

## 4. Start Services

### Terminal 1: MCP Server
```bash
cd backend
python -m app.mcp.server
# Runs on http://localhost:8001/mcp
```

### Terminal 2: FastAPI Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
# Opens on http://localhost:3000
```

## 5. Test Chat Endpoint

```bash
# Get a JWT token (from your auth flow)
TOKEN="your-jwt-token"
USER_ID="your-user-id"

# Send a chat message
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to test the chatbot"}'
```

## 6. Expected Response

```json
{
  "conversation_id": 1,
  "message": "Done! I've added 'test the chatbot' to your tasks.",
  "tool_results": [
    {
      "tool": "add_task",
      "success": true,
      "result": {
        "id": 1,
        "title": "test the chatbot",
        "is_completed": false
      }
    }
  ]
}
```

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Chat    │────▶│   FastAPI       │────▶│   AI Agent      │
│   (Frontend)    │     │   /api/chat     │     │   (Gemini)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌─────────────────┐              │
                        │   PostgreSQL    │◀─────────────┤
                        │   (Neon)        │              │ MCP Tools
                        └─────────────────┘              │
                                                         │
                        ┌─────────────────┐              │
                        │   MCP Server    │◀─────────────┘
                        │   /mcp          │
                        └─────────────────┘
```

## Key Files Created

```
backend/
├── app/
│   ├── models/
│   │   ├── conversation.py   # NEW: Conversation model
│   │   └── message.py        # NEW: Message model
│   ├── routers/
│   │   └── chat.py           # NEW: Chat endpoint
│   ├── services/
│   │   ├── agent.py          # NEW: AI agent setup
│   │   └── conversation.py   # NEW: Conversation service
│   └── mcp/
│       ├── server.py         # NEW: MCP server setup
│       └── tools.py          # NEW: MCP task tools

frontend/
├── app/
│   └── chat/
│       └── page.tsx          # NEW: Chat page
├── components/
│   └── chat/
│       └── ChatInterface.tsx # NEW: Custom React chat UI
```

## Common Issues

### "GEMINI_API_KEY not set"
Ensure your `.env` file has a valid Gemini API key.

### "MCP server connection refused"
Start the MCP server first (port 8001), then the FastAPI backend.

### "Unauthorized" errors
Ensure your JWT token is valid and matches the user_id in the URL.
