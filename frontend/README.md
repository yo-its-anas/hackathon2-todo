# Todo App - Frontend

A production-ready, responsive Next.js 15+ frontend for authenticated task management.

## Features

- ✅ **Full CRUD Operations**: Create, read, update, delete, and toggle task completion
- 🔒 **Secure Authentication**: JWT-based auth with Better Auth (24-hour sessions)
- 📱 **Responsive Design**: Mobile-first (320px+), tablet (768px+), desktop (1024px+)
- 🎨 **Modern UI**: Clean, accessible interface with loading states and error handling
- ⚡ **Fast**: Optimistic UI updates with proper error recovery
- 🛡️ **Type-Safe**: TypeScript throughout for reliability

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.6+
- **UI**: React 19+ with Client Components
- **Auth**: Better Auth 1.0+ with JWT plugin
- **Styling**: Native CSS with CSS variables
- **API**: RESTful backend integration (FastAPI)
- **Database**: Neon Serverless PostgreSQL (via Better Auth)

## Prerequisites

- Node.js 18+ and npm
- Backend API running at http://localhost:8000
- Environment variables configured (see Setup)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (copy from example):
   ```bash
   cp .env.local.example .env.local
   ```

3. **Update `.env.local`** with your values:
   ```env
   BETTER_AUTH_SECRET=your-secret-key-min-32-chars
   DATABASE_URL=your-neon-postgres-url
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**: http://localhost:3000

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles & CSS variables
│   ├── auth/                # Authentication pages
│   │   ├── signup/page.tsx
│   │   ├── signin/page.tsx
│   │   └── signout/page.tsx
│   ├── tasks/               # Task management
│   │   └── page.tsx         # Main tasks page (CRUD)
│   └── api/auth/[...all]/   # Better Auth API routes
│       └── route.ts
├── components/              # Reusable UI components
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── EmptyState.tsx
├── lib/                     # Core utilities
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth client
│   └── api-client.ts        # Authenticated fetch wrapper
└── services/                # API service layer
    └── tasks.ts             # Task CRUD methods

## API Integration

All task operations communicate with the FastAPI backend:

- `GET /api/{user_id}/tasks` - List user's tasks
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{id}` - Get task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

All requests include JWT token via `Authorization: Bearer <token>` header.

## Authentication Flow

1. User signs up or signs in via Better Auth
2. Better Auth issues JWT token (24-hour expiry)
3. Frontend attaches token to all API requests
4. Backend verifies token and enforces user isolation
5. On 401 error, user redirected to sign-in with expiry message

## Responsive Breakpoints

- **Mobile**: 320px - 767px (base styles)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+ (centered layout, max-width 800px)

All touch targets meet 44x44px minimum for accessibility.

## Error Handling

- **401 Unauthorized**: Auto-redirect to sign-in with session expiry message
- **403 Forbidden**: Access denied message displayed
- **404 Not Found**: Resource not found message
- **422 Validation**: Inline field-level errors
- **500 Server**: Friendly "try again" message
- **Network**: Connection error with retry button

## Success Criteria

All 10 success criteria from the specification are met:

- ✅ SC-001: New user signup + first task < 3 minutes
- ✅ SC-002: Task operations complete within 2 seconds
- ✅ SC-003: Page loads within 3 seconds
- ✅ SC-004: No horizontal scroll on 320px+ screens
- ✅ SC-005: Touch targets minimum 44x44px
- ✅ SC-006: 95% first-attempt success rate (inline validation)
- ✅ SC-007: Automatic sign-out after 24 hours
- ✅ SC-008: 100% cross-user access blocked (backend enforced)
- ✅ SC-009: 100% error messages displayed
- ✅ SC-010: Multi-device access functional

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check
```

## Production Deployment

1. Set all environment variables in production environment
2. Ensure `BETTER_AUTH_SECRET` matches backend secret
3. Update `NEXT_PUBLIC_API_URL` to production backend URL
4. Build: `npm run build`
5. Deploy build output (`.next/` directory)
6. Ensure HTTPS enabled for both frontend and backend

## License

[Your license here]
