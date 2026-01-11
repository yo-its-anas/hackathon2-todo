# Research: UI/UX Motion Polish

**Feature**: 003-ui-ux-polish
**Date**: 2026-01-11
**Status**: Complete

## Decision Summary

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Motion Library | Motion for React (motion/react) | Official successor to Framer Motion, built-in reduced motion, AnimatePresence for list animations |
| Animation Orchestration | Local component-level with shared config | MotionConfig provider for global defaults, component-specific animations |
| Server/Client Boundaries | Motion components as Client Components | Animation requires client-side JavaScript; wrap motion in 'use client' files |
| Reduced Motion | MotionConfig with reducedMotion="user" | Automatic system preference respect, disables transforms but preserves opacity |
| Performance Strategy | CSS transforms + opacity only | GPU-accelerated properties, 60fps target, layout animations via Motion |

---

## 1. Motion Library Choice

### Options Evaluated

| Library | Bundle Size | Features | Reduced Motion | Verdict |
|---------|-------------|----------|----------------|---------|
| CSS-only | 0kb | Limited list animations | Manual media query | Insufficient for list exit animations |
| Motion for React | ~18kb | Full AnimatePresence, layout | Built-in MotionConfig | **Selected** |
| React Spring | ~22kb | Physics-based | Manual | More complex API |
| GSAP | ~60kb | Powerful timeline | Manual | Overkill for this scope |

### Decision: Motion for React

**Rationale**:
1. **AnimatePresence** solves the core challenge of animating list items on exit (task deletion)
2. **Built-in accessibility** via `MotionConfig reducedMotion="user"`
3. **Layout animations** handle reordering when tasks complete/uncomplete
4. Lightweight at ~18kb gzipped
5. React 19 compatible, actively maintained by Motion.dev team

**Installation**:
```bash
npm install motion
```

**Import pattern**:
```tsx
import { motion, AnimatePresence, MotionConfig } from "motion/react"
```

---

## 2. Animation Orchestration Strategy

### Decision: Local with Shared Config

**Architecture**:
```
frontend/
├── app/
│   └── layout.tsx          # MotionConfig provider wrapping children
├── components/
│   ├── motion/             # Motion-wrapped base components
│   │   ├── AnimatedList.tsx
│   │   └── FadeIn.tsx
│   └── tasks/
│       └── TaskCard.tsx    # Uses motion components directly
└── lib/
    └── motion-config.ts    # Shared animation presets
```

**Rationale**:
- Global MotionConfig sets defaults (duration, easing, reducedMotion)
- Individual components define specific animations
- No complex orchestration needed for this scope
- Easy to extend without refactoring

**Shared Config Pattern**:
```tsx
// lib/motion-config.ts
export const transitions = {
  fast: { duration: 0.15, ease: "easeOut" },
  base: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.35, ease: "easeInOut" },
}

export const variants = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  slideUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  // ...
}
```

---

## 3. Server vs Client Component Boundaries

### Decision: Client Components for Motion

**Next.js App Router Constraint**: Motion animations require JavaScript and must run in Client Components.

**Strategy**:
1. Keep page-level data fetching in Server Components where possible
2. Wrap motion-enabled UI in Client Component boundaries
3. Use `"use client"` directive at component level, not page level

**Example Pattern**:
```tsx
// app/tasks/page.tsx - Already "use client" (has state management)
// No change needed - motion components work here

// components/motion/AnimatedList.tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
// Client component wrapper for list animations
```

**Existing State**: All interactive pages (tasks, auth) already use `"use client"` due to useState/useEffect usage. No additional boundaries needed.

---

## 4. Reduced Motion Accessibility

### Decision: MotionConfig with reducedMotion="user"

**Implementation**:
```tsx
// app/layout.tsx
import { MotionConfig } from "motion/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MotionConfig reducedMotion="user">
          {children}
        </MotionConfig>
      </body>
    </html>
  )
}
```

**Behavior**:
- When user has `prefers-reduced-motion: reduce` enabled:
  - Transform animations (x, y, scale, rotate) → disabled
  - Layout animations → disabled
  - Opacity and color animations → preserved (still provide feedback)
- Automatic detection, no manual media queries needed

**Fallback for Non-Motion UI**:
```css
/* globals.css - for non-motion CSS transitions */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Performance Constraints

### Requirements from Spec
- NFR-001: Animations complete within 300ms
- NFR-002: Maintain 60fps on mid-range devices
- NFR-003: <100ms page load impact
- NFR-004: Use GPU-accelerated properties only

### Strategy

**GPU-Accelerated Properties Only**:
- `opacity` - Always GPU accelerated
- `transform` (translate, scale, rotate) - Always GPU accelerated
- Avoid: `width`, `height`, `top`, `left`, `margin`, `padding`

**Motion Configuration**:
```tsx
// All animations use transform and opacity only
const taskVariants = {
  initial: { opacity: 0, y: 20 },      // transform: translateY
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },   // transform: scale
}
```

**Duration Budget**:
| Animation Type | Max Duration |
|----------------|--------------|
| Micro-interaction (hover, focus) | 150ms |
| State change (toggle, save) | 200ms |
| Enter/exit (list items) | 250ms |
| Page transition | 300ms |

**Bundle Impact**:
- Motion library: ~18kb gzipped
- Within 100ms load budget at 3G speeds

---

## 6. Animation Patterns Catalog

### Task List Animations

```tsx
<AnimatePresence mode="popLayout">
  {tasks.map(task => (
    <motion.li
      key={task.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
    />
  ))}
</AnimatePresence>
```

### Task Completion Toggle

```tsx
<motion.div
  animate={{
    opacity: task.is_completed ? 0.6 : 1,
    scale: task.is_completed ? 0.98 : 1
  }}
  transition={{ duration: 0.15 }}
/>
```

### Success Toast

```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
/>
```

### Page Fade-In

```tsx
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.25 }}
/>
```

---

## 7. Existing Code Integration Points

### Files to Modify

| File | Changes |
|------|---------|
| `frontend/package.json` | Add `motion` dependency |
| `frontend/app/layout.tsx` | Wrap with MotionConfig |
| `frontend/app/globals.css` | Add reduced-motion fallback |
| `frontend/app/tasks/page.tsx` | AnimatePresence for task list |
| `frontend/components/LoadingSpinner.tsx` | Enhanced animation |
| `frontend/components/EmptyState.tsx` | Fade-in animation |
| `frontend/components/ErrorMessage.tsx` | Enter/exit animation |

### New Files to Create

| File | Purpose |
|------|---------|
| `frontend/lib/motion-config.ts` | Shared animation presets |
| `frontend/components/motion/AnimatedList.tsx` | Reusable list wrapper |
| `frontend/components/motion/FadeIn.tsx` | Fade wrapper component |
| `frontend/components/Toast.tsx` | Success/error toast component |

---

## 8. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Bundle size increase | Motion is 18kb; within budget |
| Animation jank on low-end devices | GPU-only properties, duration limits |
| Accessibility regression | MotionConfig reducedMotion="user" |
| Server component conflicts | Motion only in existing client components |
| React 19 compatibility | Motion for React tested with React 19 |

---

## References

- Motion for React Docs: https://motion.dev/docs/react
- AnimatePresence: https://motion.dev/docs/react/animate-presence
- Accessibility: https://motion.dev/docs/react/accessibility
- Next.js App Router: https://nextjs.org/docs/app
