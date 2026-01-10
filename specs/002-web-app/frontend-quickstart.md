# Frontend Quick Start Guide

**Feature**: 002-web-app (Frontend Completion)
**Created**: 2026-01-08
**Purpose**: Step-by-step guide for frontend development and testing

## Prerequisites

- ✅ Backend API running at http://localhost:8000 (Phase 1 complete)
- ✅ Better Auth configured with JWT plugin (Phase 1 complete)
- ✅ BETTER_AUTH_SECRET environment variable set (matching backend)
- ✅ Node.js 18+ and npm installed
- ✅ TypeScript configured

## Current State

### Already Implemented (Phase 1 - Authentication)

✅ **Authentication Infrastructure**:
- `/frontend/lib/auth.ts` - Better Auth server configuration
- `/frontend/lib/auth-client.ts` - Better Auth client with JWT plugin
- `/frontend/lib/api-client.ts` - Authenticated fetch wrapper
- `/frontend/app/auth/signup/page.tsx` - Sign-up UI
- `/frontend/app/auth/signin/page.tsx` - Sign-in UI
- `/frontend/app/api/auth/[...all]/route.ts` - Better Auth API routes
- `/frontend/services/tasks.ts` - Task API service methods

✅ **Basic Task Page**:
- `/frontend/app/tasks/page.tsx` - Basic task list (needs enhancement)

### Remaining Work (This Phase - Frontend Completion)

🔲 **Enhanced Task UI**:
- Edit task functionality
- Delete confirmation dialogs
- Responsive CSS for mobile/tablet/desktop
- Form validation and error messages
- Loading states for all operations
- Empty state UI
- Touch-friendly buttons (44x44px minimum)

🔲 **Session Management**:
- Route protection (redirect to sign-in if unauthenticated)
- Sign-out functionality
- Session expiry handling

🔲 **Error Handling**:
- Network failure recovery
- 401/403 error display
- Form validation errors
- Retry mechanisms

## Development Setup

### 1. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

Verify backend at: http://localhost:8000/docs

### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:3000

### 3. Verify Environment Variables

Check `frontend/.env.local`:
```bash
BETTER_AUTH_SECRET=<same-as-backend>
DATABASE_URL=postgresql://...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing End-to-End Flow

### Test 1: New User Onboarding (US1 - P1)

1. Navigate to http://localhost:3000
2. Click "Sign Up" link
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Sign Up"
5. **Expected**: Redirected to `/tasks`, logged in automatically
6. Enter task title: "My First Task"
7. Click "Add Task"
8. **Expected**: Task appears in list immediately
9. Close browser
10. Reopen http://localhost:3000/tasks
11. Sign in with same credentials
12. **Expected**: Task still visible

✅ **Pass Criteria**: User can complete signup → create task → logout → login → see task

### Test 2: Task Management Workflow (US2 - P1)

**Prerequisites**: Logged in with existing tasks

1. View task list
   - **Expected**: All tasks visible, newest first
2. Click "Edit" on a task
   - **Expected**: Form appears with current title/description
3. Modify title and description
4. Click "Save"
   - **Expected**: Changes saved and visible immediately
5. Click "Complete" on an incomplete task
   - **Expected**: Task marked complete with strikethrough
6. Click "Undo" on the completed task
   - **Expected**: Task returns to incomplete status
7. Click "Delete" on a task
   - **Expected**: Confirmation dialog appears
8. Confirm deletion
   - **Expected**: Task removed from list permanently
9. Create several tasks until list is empty
10. Delete all tasks
11. **Expected**: Empty state message appears

✅ **Pass Criteria**: All CRUD operations work correctly

### Test 3: Responsive Mobile Experience (US3 - P2)

1. Open browser DevTools
2. Toggle device emulation (iPhone SE, iPad, etc.)
3. Navigate through app
4. **Expected**: All UI elements visible without horizontal scroll
5. Try tapping buttons
6. **Expected**: Buttons easy to tap (no mis-taps)
7. Fill out task creation form
8. **Expected**: No zooming or awkward scrolling needed
9. Scroll through task list
10. **Expected**: Layout stable and readable

✅ **Pass Criteria**: App usable on 320px+ screens

### Test 4: Session Management (US4 - P2)

1. While logged in, wait 24 hours (or manipulate token expiry in code)
2. Perform any action
3. **Expected**: Redirected to sign-in with session expiry message
4. Try accessing `/tasks` without logging in (new incognito window)
5. **Expected**: Redirected to sign-in immediately
6. Sign in as user1
7. Copy URL for user1's task
8. Sign out
9. Sign in as user2
10. Try to access user1's task URL
11. **Expected**: 403 Forbidden error displayed
12. Click "Sign Out"
13. **Expected**: Redirected to sign-in, session cleared

✅ **Pass Criteria**: Unauthorized access blocked, expired sessions handled

### Test 5: Error Handling (US5 - P3)

1. Turn off internet connection
2. Try to create a task
3. **Expected**: Clear error message, form data retained
4. Reconnect internet
5. Click "Try Again"
6. **Expected**: Task created successfully
7. Enter empty task title
8. Click "Add Task"
9. **Expected**: Inline validation error displayed
10. Stop backend server
11. Try to fetch tasks
12. **Expected**: Friendly error message with retry option
13. Restart backend
14. Click retry
15. **Expected**: Tasks load successfully

✅ **Pass Criteria**: All errors handled gracefully

## Development Workflow

### Adding a New UI Feature

1. **Plan**: Document feature in frontend-spec.md
2. **Design**: Update data model if needed
3. **Implement**: Add component with TypeScript types
4. **Style**: Add responsive CSS (mobile-first)
5. **Test**: Verify on mobile/tablet/desktop
6. **Validate**: Check against acceptance scenarios

### Component Development Pattern

```typescript
// 1. Import dependencies
"use client"
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { getTasks } from '@/services/tasks'

// 2. Define component
export default function MyComponent() {
  // 3. Define state
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 4. Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  // 5. Define handlers
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getTasks(userId)
      setData(result)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // 6. Render UI
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {/* ... rest of UI */}
    </div>
  )
}
```

### CSS Development Pattern

```css
/* Mobile-first approach */
.container {
  padding: 1rem;
}

.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
}
```

## Common Issues & Solutions

### Issue: 401 Unauthorized on API Calls

**Symptom**: All API requests fail with 401
**Cause**: JWT not being attached to requests
**Fix**: Verify `api-client.ts` retrieves token via `authClient.token()`

### Issue: CORS Errors

**Symptom**: API requests blocked by browser
**Cause**: Backend CORS not configured for frontend origin
**Fix**: Verify backend `app/main.py` includes frontend URL in `allow_origins`

### Issue: Session Not Persisting

**Symptom**: User logged out after page refresh
**Cause**: Better Auth cookies not being set/read
**Fix**: Verify `BETTER_AUTH_SECRET` matches between frontend and backend

### Issue: Mobile Layout Broken

**Symptom**: Horizontal scrolling on mobile
**Cause**: Fixed-width elements exceeding viewport
**Fix**: Use max-width: 100% and flexible layouts (flexbox/grid)

### Issue: Buttons Too Small on Mobile

**Symptom**: Users miss-tap buttons
**Cause**: Touch targets smaller than 44x44px
**Fix**: Add min-height and min-width to button CSS

## Performance Checklist

- [ ] Minimize re-renders (use React.memo if needed)
- [ ] Debounce input handlers (if needed)
- [ ] Load tasks only once on mount
- [ ] Disable buttons during API calls
- [ ] Show loading indicators for operations >500ms
- [ ] Handle rapid clicks (disable submit buttons)

## Accessibility Checklist

- [ ] All form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Error messages clearly explain issues
- [ ] Keyboard navigation works
- [ ] Touch targets minimum 44x44px
- [ ] Color contrast sufficient (WCAG AA)

## Deployment Preparation

Before deploying to production:

1. [ ] Generate production `BETTER_AUTH_SECRET`
2. [ ] Set production `DATABASE_URL`
3. [ ] Configure production `NEXT_PUBLIC_API_URL`
4. [ ] Test on real mobile devices
5. [ ] Verify HTTPS enabled
6. [ ] Test with slow 3G network simulation
7. [ ] Verify all error scenarios handled
8. [ ] Test token expiry (wait 24 hours or manipulate)

## Next Steps

After completing this phase:

1. Run end-to-end tests (all 5 user stories)
2. Validate against success criteria (SC-001 through SC-010)
3. Document any deviations from spec
4. Create pull request with implementation
5. Deploy to staging environment for user testing

This completes the transformation from CLI Todo app to full-stack web application! 🎉
