# Research: Frontend Implementation & System Integration

**Feature**: 002-web-app (Frontend Completion)
**Created**: 2026-01-08
**Research Phase**: Phase 0

## Research Questions & Findings

### Q1: How to implement Next.js App Router with client-side interactivity for task management?

**Decision**: Use "use client" directive for interactive pages with React hooks for state management

**Findings**:
- Next.js App Router defaults to Server Components for better performance
- Client Components required for: useState, useEffect, event handlers, browser APIs
- Use "use client" directive at file/component level to enable client-side features
- Server Components can pass data to Client Components as props
- Authentication checks can be performed in both Server and Client Components

**Implementation Pattern**:
```typescript
// Client Component for interactive task list
"use client"

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { getAllTasks, createTask } from '@/services/tasks'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch tasks on mount
    authClient.useSession().then(session => {
      if (session.data?.user?.id) {
        getAllTasks(session.data.user.id).then(setTasks)
      }
    })
  }, [])

  // ... rest of implementation
}
```

**Rationale**: Client Components provide necessary interactivity for form submissions, loading states, and dynamic UI updates. Server Components are unnecessary for this feature since all pages require user interaction and session state.

**Alternatives Considered**:
- Server Components only - Rejected: Cannot use React hooks or handle events
- Pages Router - Rejected: Specification requires App Router
- Full client-side app (no SSR) - Rejected: App Router provides better initial load

**Source**: Next.js 15 App Router documentation

---

### Q2: How to implement route protection to prevent unauthenticated access?

**Decision**: Use Better Auth session checks with redirect logic in page components

**Findings**:
- Next.js App Router supports middleware for route protection
- Better Auth provides `useSession()` hook for client-side session checks
- Can check auth in middleware (server-side) or component (client-side)
- Middleware runs before page loads, components run after
- Better Auth session persists in cookies managed by the library

**Implementation Pattern**:
```typescript
"use client"

import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function TasksPage() {
  const router = useRouter()

  useEffect(() => {
    authClient.useSession().then(session => {
      if (!session.data?.user) {
        // Not authenticated - redirect to sign-in
        router.push('/auth/signin')
      }
    })
  }, [router])

  // ... rest of page
}
```

**Rationale**: Component-level auth checks are simpler and more explicit than middleware. Better Auth handles session persistence automatically, we just need to verify it exists and redirect if missing.

**Alternatives Considered**:
- Next.js Middleware - Rejected: More complex setup, harder to debug
- Layout-based guards - Rejected: Less granular control per page
- Server-side auth checks - Rejected: Requires Server Components which can't be interactive

**Source**: Better Auth documentation, Next.js App Router auth patterns

---

### Q3: How to implement responsive CSS without external frameworks?

**Decision**: Use CSS media queries with flexbox and grid for responsive layouts

**Findings**:
- Modern CSS provides robust responsive capabilities without frameworks
- CSS Grid for 2D layouts (task list grid)
- Flexbox for 1D layouts (form fields, buttons)
- Media queries for breakpoint-specific styles
- CSS custom properties (variables) for consistent spacing/colors

**Implementation Pattern**:
```css
/* Mobile-first approach */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.task-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Tablet breakpoint */
@media (min-width: 768px) {
  .task-list {
    padding: 2rem;
    gap: 1.5rem;
  }

  .task-item {
    flex-direction: row;
    align-items: center;
  }
}

/* Desktop breakpoint */
@media (min-width: 1024px) {
  .task-list {
    max-width: 800px;
    margin: 0 auto;
  }
}
```

**Rationale**: Native CSS is sufficient for responsive layouts without adding Tailwind dependency. Keeps bundle size smaller and avoids learning curve for utility classes.

**Alternatives Considered**:
- Tailwind CSS - Rejected: Specification says "Tailwind optional but not required", native CSS preferred
- CSS-in-JS (styled-components) - Rejected: Adds unnecessary complexity and bundle size
- Inline styles only - Rejected: Cannot use media queries, harder to maintain

**Breakpoints**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Source**: MDN Web Docs CSS Grid and Flexbox guides

---

### Q4: How to handle form validation and error states in React?

**Decision**: Use controlled components with useState for validation and error display

**Findings**:
- React controlled components keep form state in sync with component state
- Validation can be performed on change (real-time) or on submit
- Error messages should be displayed inline near the invalid field
- Native HTML5 validation provides baseline (required, minlength, type)
- Custom validation logic in event handlers for complex rules

**Implementation Pattern**:
```typescript
const [title, setTitle] = useState('')
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')

  // Validation
  if (!title.trim()) {
    setError('Title is required')
    return
  }

  if (title.length > 255) {
    setError('Title must be less than 255 characters')
    return
  }

  // Submit
  try {
    await createTask(userId, { title, description })
    setTitle('')
  } catch (err) {
    setError('Failed to create task. Please try again.')
  }
}

return (
  <form onSubmit={handleSubmit}>
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />
    {error && <div className="error">{error}</div>}
    <button type="submit">Create Task</button>
  </form>
)
```

**Rationale**: Controlled components provide full control over validation timing and error display. Native HTML5 validation provides baseline browser support.

**Alternatives Considered**:
- Uncontrolled components (refs) - Rejected: Less control, harder to validate
- Form libraries (React Hook Form, Formik) - Rejected: Unnecessary complexity for simple forms
- Schema validation (Yup, Zod) - Rejected: Overkill for basic string validation

**Source**: React documentation on forms and controlled components

---

### Q5: How to implement loading states during API operations?

**Decision**: Use useState loading flag with disabled buttons and visual indicators

**Findings**:
- Loading states prevent duplicate submissions and provide user feedback
- Disable form buttons during submission to prevent double-clicks
- Show loading indicator (text, spinner, or skeleton) during fetch
- Reset loading state on success or error
- Consider optimistic UI updates for better perceived performance

**Implementation Pattern**:
```typescript
const [loading, setLoading] = useState(false)

const handleDelete = async (taskId: number) => {
  setLoading(true)
  try {
    await deleteTask(userId, taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
  } catch (err) {
    setError('Failed to delete task')
  } finally {
    setLoading(false)
  }
}

return (
  <button
    onClick={() => handleDelete(task.id)}
    disabled={loading}
  >
    {loading ? 'Deleting...' : 'Delete'}
  </button>
)
```

**Rationale**: Simple boolean flag is sufficient for loading states. Disabled buttons prevent duplicate requests. Loading text provides immediate feedback.

**Alternatives Considered**:
- Global loading state (context) - Rejected: Unnecessary for independent operations
- Loading component library - Rejected: Can implement simple loading text without dependency
- Optimistic UI updates - Considered: Could implement for better UX, but adds complexity

**Source**: React patterns documentation

---

### Q6: How to implement responsive touch targets for mobile?

**Decision**: Use minimum 44x44px for all interactive elements with padding for visual size

**Findings**:
- WCAG 2.1 guidelines recommend minimum 44x44px for touch targets
- iOS Human Interface Guidelines recommend 44x44pt minimum
- Android Material Design recommends 48x48dp minimum
- Can use padding to create larger touch areas while maintaining visual size
- Ensure adequate spacing between adjacent touch targets

**Implementation Pattern**:
```css
.button {
  /* Visual styling */
  font-size: 16px;
  border-radius: 4px;

  /* Touch target sizing */
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;

  /* Spacing from adjacent elements */
  margin: 8px;
}

/* Mobile-specific touch improvements */
@media (max-width: 767px) {
  .button {
    min-height: 48px;
    padding: 14px 28px;
  }
}
```

**Rationale**: Meeting accessibility guidelines ensures mobile users can reliably tap buttons and links. Larger targets reduce user frustration and mis-taps.

**Alternatives Considered**:
- Platform-specific sizes only - Rejected: Web should accommodate all platforms
- Smaller targets - Rejected: Violates accessibility guidelines
- Touch-only media query - Rejected: Not reliably detectable in CSS

**Source**: WCAG 2.1 Success Criterion 2.5.5, iOS HIG, Material Design Guidelines

---

## Research Summary

### Key Decisions

1. **Client Components**: Use "use client" directive for all interactive pages
2. **Route Protection**: Component-level session checks with redirect logic
3. **Responsive Design**: Native CSS with flexbox/grid and media queries
4. **Form Handling**: Controlled components with useState for validation
5. **Loading States**: Boolean flags with disabled buttons and loading text
6. **Mobile Touch Targets**: Minimum 44x44px for all interactive elements

### Dependencies Identified

**Already Installed** (from authentication phase):
- Next.js 15+
- React 19+
- Better Auth (with JWT plugin)
- TypeScript

**No Additional Dependencies Required**: All functionality can be implemented with existing packages

### Integration Points

- **Better Auth Integration**: Already configured, just need to use `useSession()` hook
- **API Client**: Already implemented in `lib/api-client.ts` with JWT attachment
- **Task Service**: Already implemented in `services/tasks.ts` with all CRUD operations
- **Auth Pages**: Already implemented (sign-up, sign-in)

**Work Remaining**:
1. Enhance existing task page with full CRUD UI
2. Add responsive CSS for mobile/tablet layouts
3. Implement form validation and error handling
4. Add loading states to all async operations
5. Create empty state UI for zero tasks
6. Add confirmation dialogs for destructive actions (delete)
7. Implement edit task functionality (currently only create/delete/toggle)
8. Add proper session checks with redirect logic

### Technical Architecture

```
Frontend Layer (Next.js App Router)
├── /app/page.tsx              → Landing/redirect to tasks
├── /app/auth/                 → Auth pages (DONE)
│   ├── signup/page.tsx        → Better Auth signup (DONE)
│   └── signin/page.tsx        → Better Auth signin (DONE)
├── /app/tasks/page.tsx        → Main task management UI (NEEDS ENHANCEMENT)
├── /lib/                      → Utilities (DONE)
│   ├── auth.ts                → Better Auth server config (DONE)
│   ├── auth-client.ts         → Better Auth client (DONE)
│   └── api-client.ts          → Authenticated fetch wrapper (DONE)
└── /services/tasks.ts         → Task API methods (DONE)

Backend Layer (FastAPI)
└── Already implemented with JWT auth (Phase 1 complete)

Authentication Flow (Already Working)
1. User signs up/in via Better Auth UI
2. Better Auth issues JWT with sub claim (user_id)
3. JWT stored in Better Auth session (cookies)
4. api-client.ts retrieves JWT and attaches to requests
5. Backend verifies JWT signature and enforces ownership
```

### Open Questions

None. All technical unknowns resolved through research.

### Next Phase

Proceed to Phase 1 (Design & Contracts) to create:
- Data model documentation (frontend state shape)
- Component contracts (props interfaces)
- UI flow documentation
- Implementation quickstart guide
