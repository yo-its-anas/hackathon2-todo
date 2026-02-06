# Deployment Guide

Complete deployment instructions for the AI Todo Application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js Frontend                            │    │
│  │  - Authentication (Better Auth)                          │    │
│  │  - Task UI                                               │    │
│  │  - Chat Interface                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS API calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  HUGGING FACE SPACES                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           Docker Container                               │    │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐   │    │
│  │  │   FastAPI (7860)    │  │   MCP Server (8001)     │   │    │
│  │  │   - REST API        │◄─│   - Tool execution      │   │    │
│  │  │   - JWT Auth        │  │   - Task CRUD tools     │   │    │
│  │  │   - Agent runner    │  │   - Internal only       │   │    │
│  │  └─────────────────────┘  └─────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEON POSTGRESQL                               │
│                    (Serverless Database)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Backend (Hugging Face Spaces)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | Yes | JWT secret (min 32 chars, must match frontend) | `openssl rand -base64 32` |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI chatbot | `sk-...` |
| `LLM_MODEL` | No | OpenAI model (default: gpt-4o-mini) | `gpt-4o-mini` |
| `MCP_SERVER_PORT` | No | Internal MCP port (default: 8001) | `8001` |
| `PORT` | No | FastAPI port (HF injects 7860) | `7860` |
| `RATE_LIMIT_PER_MINUTE` | No | Chat rate limit per user (default: 60) | `60` |
| `CHAT_CONTEXT_LIMIT` | No | Max messages for context (default: 50) | `50` |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL (same as backend) | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | Yes | JWT secret (must match backend) | Same as backend |
| `BETTER_AUTH_URL` | Yes | Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Yes | Same as BETTER_AUTH_URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Yes | HF Spaces backend URL | `https://your-space.hf.space` |

---

## Step-by-Step Deployment

### Prerequisites

1. **Neon PostgreSQL Database**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project and database
   - Copy the connection string (with `?sslmode=require`)

2. **OpenAI API Key**
   - Get from [platform.openai.com](https://platform.openai.com/api-keys)

3. **Generate JWT Secret**
   ```bash
   openssl rand -base64 32
   ```
   Save this - you'll use the SAME secret for both backend and frontend.

---

### Step 1: Deploy Backend to Hugging Face Spaces

#### 1.1 Create a New Space

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Choose:
   - **Space name**: `todo-backend` (or your preference)
   - **License**: Choose appropriate license
   - **SDK**: Select **Docker**
   - **Visibility**: Public or Private

#### 1.2 Push Backend Code

```bash
# Clone your HF Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/todo-backend
cd todo-backend

# Copy backend files
cp -r /path/to/todo-app/backend/* .

# Ensure these files exist:
# - Dockerfile
# - start.sh
# - requirements.txt
# - app/ directory

# Commit and push
git add .
git commit -m "Initial backend deployment"
git push
```

#### 1.3 Configure Secrets in HF Spaces

1. Go to your Space → **Settings** → **Repository secrets**
2. Add each secret:

| Secret Name | Value |
|-------------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `BETTER_AUTH_SECRET` | Your generated JWT secret |
| `OPENAI_API_KEY` | Your OpenAI API key |

#### 1.4 Verify Deployment

1. Wait for the build to complete (check **Logs** tab)
2. Once running, visit: `https://YOUR_USERNAME-todo-backend.hf.space/`
3. You should see: `{"status": "ok", "message": "Todo REST API is running"}`
4. Check API docs: `https://YOUR_USERNAME-todo-backend.hf.space/docs`

---

### Step 2: Deploy Frontend to Vercel

#### 2.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Select the `frontend` directory as root

#### 2.2 Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Same Neon connection string |
| `BETTER_AUTH_SECRET` | Same JWT secret as backend |
| `BETTER_AUTH_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `https://YOUR_USERNAME-todo-backend.hf.space` |

**Important**: After first deployment, update `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` with the actual Vercel URL.

#### 2.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Visit your deployment URL

#### 2.4 Update Auth URLs (Post-Deployment)

After getting your Vercel URL:
1. Go to Vercel → Project Settings → Environment Variables
2. Update `BETTER_AUTH_URL` to your actual URL
3. Update `NEXT_PUBLIC_BETTER_AUTH_URL` to your actual URL
4. Redeploy for changes to take effect

---

### Step 3: Verify Full Stack

1. **Health Check Backend**
   ```bash
   curl https://YOUR_USERNAME-todo-backend.hf.space/
   ```

2. **Test Authentication**
   - Visit your Vercel frontend
   - Sign up for a new account
   - Verify redirect to tasks page

3. **Test Task Operations**
   - Create a task manually
   - Use the chat: "Add a task called test"
   - Verify both methods work

4. **Test AI Chat**
   - Open chat panel
   - Say "Show my tasks"
   - Verify AI responds with task list

---

## Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| "MCP server failed to start" | Check `OPENAI_API_KEY` is set correctly |
| "Database connection failed" | Verify `DATABASE_URL` format and Neon status |
| 401 errors on all requests | Check `BETTER_AUTH_SECRET` matches frontend |
| Container keeps restarting | Check Logs tab for startup errors |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| "Network error" on login | Check `DATABASE_URL` is set in Vercel |
| API calls failing | Verify `NEXT_PUBLIC_API_URL` points to HF Space |
| CORS errors | Backend allows all origins by default |
| Auth redirect loops | Ensure `BETTER_AUTH_URL` matches deployment URL |

### Common Fixes

```bash
# Regenerate JWT secret (update in BOTH places)
openssl rand -base64 32

# Test backend locally with Docker
cd backend
docker build -t todo-backend .
docker run -p 7860:7860 -p 8001:8001 \
  -e DATABASE_URL="your-db-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e OPENAI_API_KEY="your-key" \
  todo-backend
```

---

## Local Development

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Terminal 1: MCP Server
python -m app.mcp.server

# Terminal 2: FastAPI
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Security Checklist

- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] `BETTER_AUTH_SECRET` is identical on backend and frontend
- [ ] `DATABASE_URL` uses `?sslmode=require`
- [ ] HF Space secrets are set (not in Dockerfile)
- [ ] Vercel env vars are set (not in .env.local)
- [ ] OpenAI API key has appropriate usage limits
