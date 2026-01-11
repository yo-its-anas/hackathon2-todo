# Quickstart: UI/UX Motion Polish

**Feature**: 003-ui-ux-polish
**Prerequisites**: Existing 002-web-app implementation running

## Quick Setup

### 1. Install Motion Library

```bash
cd frontend
npm install motion
```

### 2. Verify Installation

```bash
npm run build
npm run dev
```

### 3. Test Motion Import

Create a test in any client component:
```tsx
import { motion } from "motion/react"
// Should compile without errors
```

## Development Workflow

### Running the Application

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Testing Animations

1. Open http://localhost:3000
2. Sign in with test account
3. Create/complete/delete tasks to test animations
4. Enable "Reduce motion" in OS settings to test accessibility

### Reduced Motion Testing

**macOS**: System Preferences → Accessibility → Display → Reduce motion
**Windows**: Settings → Ease of Access → Display → Show animations
**Chrome DevTools**: Rendering → Emulate CSS media feature prefers-reduced-motion

## File Structure After Implementation

```
frontend/
├── app/
│   ├── layout.tsx              # + MotionConfig wrapper
│   ├── globals.css             # + reduced-motion fallback
│   ├── page.tsx                # + fade-in animation
│   ├── auth/
│   │   ├── signin/page.tsx     # + form animations
│   │   └── signup/page.tsx     # + form animations
│   └── tasks/
│       ├── page.tsx            # + AnimatePresence for list
│       └── tasks.module.css    # + animation classes
├── components/
│   ├── motion/                 # NEW: Motion utilities
│   │   ├── AnimatedList.tsx
│   │   └── FadeIn.tsx
│   ├── Toast.tsx               # NEW: Success/error toast
│   ├── LoadingSpinner.tsx      # + enhanced animation
│   ├── EmptyState.tsx          # + fade-in
│   └── ErrorMessage.tsx        # + enter/exit
└── lib/
    └── motion-config.ts        # NEW: Shared presets
```

## Validation Checklist

Before considering implementation complete:

- [ ] All task CRUD operations have visible animations
- [ ] Loading states animate smoothly
- [ ] Empty state fades in
- [ ] Error messages animate in/out
- [ ] Success toasts appear and auto-dismiss
- [ ] Page transitions feel smooth
- [ ] Reduced motion setting disables transforms
- [ ] No animation jank on task list scroll
- [ ] Touch targets remain 44px minimum
- [ ] Focus states are clearly visible

## Common Issues

### Motion import error
```
Module not found: Can't resolve 'motion/react'
```
**Fix**: Run `npm install motion` in frontend directory

### Hydration mismatch with AnimatePresence
**Fix**: Ensure AnimatePresence is only in client components with `"use client"`

### Animations don't respect reduced motion
**Fix**: Wrap app in `<MotionConfig reducedMotion="user">`

### Exit animations not working
**Fix**: Each child of AnimatePresence needs unique `key` prop

## Next Steps

After quickstart verification:
1. Run `/sp.tasks` to generate implementation tasks
2. Execute `/sp.implement` to apply polish incrementally
3. Review each screen after implementation
