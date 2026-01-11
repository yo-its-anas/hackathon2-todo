# Tasks: UI/UX Motion Cinematic Polish Pass

**Input**: Design documents from `/specs/003-ui-ux-polish/`
**Prerequisites**: plan.md (required), spec.md (required), research.md
**Branch**: `003-ui-ux-polish`
**Constraints**: NO backend changes, NO business logic changes, UI/styling only

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- All file paths are relative to repository root

## User Stories Summary

| Story | Priority | Description | Independent Test |
|-------|----------|-------------|------------------|
| US1 | P1 | Visual Feedback on Task Actions | Perform CRUD ops, observe animations |
| US2 | P1 | Clear State Communication | Force each state, verify visual treatment |
| US3 | P2 | Polished Navigation & Page Transitions | Navigate all routes, observe smoothness |
| US4 | P2 | Refined Visual Hierarchy & Spacing | Visual inspection, action prominence |
| US5 | P2 | Responsive & Accessible Polish | Multi-viewport, keyboard nav, screen reader |
| US6 | P3 | Micro-interactions & Button States | Interact with all buttons/inputs |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Motion library, configure global settings, establish animation primitives

- [ ] T001 Install motion package in frontend/package.json
- [ ] T002 Create shared animation config in frontend/lib/motion-config.ts
- [ ] T003 Add MotionConfig wrapper with reducedMotion="user" in frontend/app/layout.tsx
- [ ] T004 [P] Add reduced-motion CSS fallback in frontend/app/globals.css
- [ ] T005 [P] Create FadeIn utility component in frontend/components/motion/FadeIn.tsx
- [ ] T006 [P] Create AnimatedList wrapper in frontend/components/motion/AnimatedList.tsx
- [ ] T007 Create barrel export in frontend/components/motion/index.ts

**Acceptance**:
- `npm run build` succeeds with motion installed
- MotionConfig wraps entire app
- FadeIn and AnimatedList export correctly

**Checkpoint**: Foundation ready - animation primitives available for all user stories

---

## Phase 2: User Story 1 - Visual Feedback on Task Actions (Priority: P1)

**Goal**: Users receive immediate, clear visual feedback when performing task CRUD operations

**Independent Test**: Create, complete, edit, and delete tasks - observe animations at each step

**Implements**: FR-001, FR-002, FR-003, FR-007, SC-001, SC-006

### Implementation

- [ ] T008 [US1] Create Toast notification component in frontend/components/Toast.tsx
- [ ] T009 [US1] Import AnimatePresence and motion in frontend/app/tasks/page.tsx
- [ ] T010 [US1] Wrap task list with AnimatePresence in frontend/app/tasks/page.tsx
- [ ] T011 [US1] Add slide-up entry animation for new tasks in frontend/app/tasks/page.tsx
- [ ] T012 [US1] Add fade-out + collapse exit animation for deleted tasks in frontend/app/tasks/page.tsx
- [ ] T013 [US1] Add completion toggle animation (opacity, strikethrough) in frontend/app/tasks/page.tsx
- [ ] T014 [US1] Add edit mode expand/collapse transition in frontend/app/tasks/page.tsx
- [ ] T015 [US1] Integrate Toast component for success feedback in frontend/app/tasks/page.tsx
- [ ] T016 [US1] Add layout animation for list reordering in frontend/app/tasks/page.tsx
- [ ] T017 [US1] Add CSS keyframes for task card transitions in frontend/app/tasks/tasks.module.css

**Acceptance**:
- New tasks animate into list (slide-up + fade-in)
- Deleted tasks animate out (fade + collapse)
- Completed tasks transition smoothly (opacity + strikethrough)
- Edit mode has smooth enter/exit
- Success toast appears after operations
- All animations complete within 300ms

**Checkpoint**: Task CRUD operations have full animation feedback

---

## Phase 3: User Story 2 - Clear State Communication (Priority: P1)

**Goal**: All application states (loading, empty, error, success) have distinct, polished visual treatments

**Independent Test**: Force loading, empty, error states and verify each has dedicated UI

**Implements**: FR-004, FR-005, FR-006, FR-007, SC-002

### Implementation

- [ ] T018 [US2] Enhance LoadingSpinner with smoother animation in frontend/components/LoadingSpinner.tsx
- [ ] T019 [US2] Add size variants to LoadingSpinner in frontend/components/LoadingSpinner.tsx
- [ ] T020 [US2] Add motion fade-in to EmptyState in frontend/components/EmptyState.tsx
- [ ] T021 [US2] Enhance EmptyState visual design in frontend/components/EmptyState.tsx
- [ ] T022 [US2] Add enter/exit animations to ErrorMessage in frontend/components/ErrorMessage.tsx
- [ ] T023 [US2] Add AnimatePresence wrapper for ErrorMessage in frontend/components/ErrorMessage.tsx
- [ ] T024 [US2] Add loading state to submit buttons in frontend/app/tasks/page.tsx
- [ ] T025 [US2] Add ARIA live regions for state announcements in frontend/app/tasks/page.tsx
- [ ] T026 [P] [US2] Add slide-in animation to OfflineWarning in frontend/components/OfflineWarning.tsx

**Acceptance**:
- Loading spinner has refined, smooth animation
- Empty state fades in when displayed
- Error messages animate in/out
- Buttons show loading state during operations
- All states have ARIA announcements
- 100% of states have dedicated visual treatment

**Checkpoint**: All application states are clearly communicated visually

---

## Phase 4: User Story 3 - Polished Navigation & Page Transitions (Priority: P2)

**Goal**: Smooth transitions when navigating between pages create a cohesive, professional feel

**Independent Test**: Navigate through all routes, observe transition smoothness

**Implements**: FR-008, SC-007

### Implementation

- [ ] T027 [US3] Add fade-in animation to landing page hero in frontend/app/page.tsx
- [ ] T028 [US3] Add stagger animation to feature list in frontend/app/page.tsx
- [ ] T029 [US3] Add form entry animation to sign-in page in frontend/app/auth/signin/page.tsx
- [ ] T030 [US3] Add form entry animation to sign-up page in frontend/app/auth/signup/page.tsx
- [ ] T031 [US3] Add smooth hamburger menu transition in frontend/app/Navigation.tsx
- [ ] T032 [US3] Add menu open/close animation CSS in frontend/app/layout.module.css
- [ ] T033 [US3] Ensure no layout shift during page animations in frontend/app/globals.css

**Acceptance**:
- Landing page content fades in on load
- Auth forms animate in smoothly
- Mobile menu has smooth open/close
- No layout shift during transitions
- Page transitions complete within 300ms

**Checkpoint**: Navigation feels intentional and professional

---

## Phase 5: User Story 4 - Refined Visual Hierarchy & Spacing (Priority: P2)

**Goal**: Clean, uncluttered interface with clear visual hierarchy for quick action identification

**Independent Test**: Visual inspection - primary actions should be prominent, content well-spaced

**Implements**: SC-003 (partial)

### Implementation

- [ ] T034 [P] [US4] Add animation timing CSS custom properties in frontend/app/globals.css
- [ ] T035 [P] [US4] Enhance button base styles with improved hierarchy in frontend/app/globals.css
- [ ] T036 [US4] Improve task card shadow and depth in frontend/app/tasks/tasks.module.css
- [ ] T037 [US4] Refine typography contrast and hierarchy in frontend/app/tasks/tasks.module.css
- [ ] T038 [US4] Enhance form layout consistency in frontend/app/auth/auth.module.css
- [ ] T039 [US4] Ensure primary actions (Create, Complete) are visually prominent in frontend/app/tasks/tasks.module.css

**Acceptance**:
- Primary actions visually prominent over secondary
- Task cards have appropriate visual depth
- Typography has clear hierarchy
- Forms have consistent spacing and alignment

**Checkpoint**: Visual hierarchy is immediately clear

---

## Phase 6: User Story 5 - Responsive & Accessible Polish (Priority: P2)

**Goal**: Polished experience works across all devices and accessibility contexts

**Independent Test**: Test on mobile/tablet/desktop, enable reduced motion, use keyboard navigation

**Implements**: FR-009, FR-011, FR-013, FR-014, SC-004

### Implementation

- [ ] T040 [US5] Verify touch targets maintain 44px minimum in frontend/app/globals.css
- [ ] T041 [US5] Add visible focus ring styles for all interactive elements in frontend/app/globals.css
- [ ] T042 [US5] Add keyboard focus indicators to task buttons in frontend/app/tasks/tasks.module.css
- [ ] T043 [US5] Add keyboard focus indicators to auth forms in frontend/app/auth/auth.module.css
- [ ] T044 [US5] Verify reduced-motion disables transforms in MotionConfig in frontend/app/layout.tsx
- [ ] T045 [US5] Add ARIA labels for icon-only buttons in frontend/app/tasks/page.tsx
- [ ] T046 [US5] Ensure animations perform smoothly on mobile in frontend/app/tasks/tasks.module.css

**Acceptance**:
- Touch targets are 44x44px minimum on mobile
- Focus states clearly visible on keyboard navigation
- Reduced motion preference disables transforms
- ARIA announcements work for state changes
- No animation jank on mobile devices

**Checkpoint**: Accessibility and responsiveness validated

---

## Phase 7: User Story 6 - Micro-interactions & Button States (Priority: P3)

**Goal**: Interactive elements respond with subtle feedback making the interface feel alive

**Independent Test**: Hover, focus, click each button/input and observe state changes

**Implements**: FR-011, FR-012, SC-003

### Implementation

- [ ] T047 [P] [US6] Add hover state transitions to all buttons in frontend/app/globals.css
- [ ] T048 [P] [US6] Add focus state transitions to all inputs in frontend/app/globals.css
- [ ] T049 [US6] Add active/press effect to buttons in frontend/app/globals.css
- [ ] T050 [US6] Add hover elevation to task cards in frontend/app/tasks/tasks.module.css
- [ ] T051 [US6] Add hover states to navigation links in frontend/app/layout.module.css
- [ ] T052 [US6] Add subtle scale on button press in frontend/app/tasks/tasks.module.css

**Acceptance**:
- All buttons have hover, focus, active states
- Inputs have clear focus indication
- Task cards elevate on hover
- Buttons have subtle press feedback
- Interactions feel responsive and tactile

**Checkpoint**: Micro-interactions complete - UI feels polished and alive

---

## Phase 8: Validation & Hardening

**Purpose**: Cross-screen consistency, performance verification, accessibility audit, regression testing

- [ ] T053 Verify animation consistency across all screens
- [ ] T054 Test task list with 50+ items for performance (no frame drops)
- [ ] T055 Test with prefers-reduced-motion enabled
- [ ] T056 Verify keyboard navigation through entire app
- [ ] T057 Run accessibility audit (focus visibility, ARIA, contrast)
- [ ] T058 Regression test all CRUD operations (create, read, update, delete tasks)
- [ ] T059 Verify auth flow works unchanged (sign-in, sign-up, sign-out)
- [ ] T060 Run npm run build and verify no errors
- [ ] T061 Update quickstart.md validation checklist

**Acceptance**:
- Animations consistent across all screens
- 50-task list animates at 60fps
- Reduced motion disables transforms, preserves opacity
- Keyboard navigation works throughout
- All ARIA live regions announce state changes
- All CRUD operations work as before (no regressions)
- Auth flow unchanged
- Build succeeds

**Checkpoint**: Spec 003 complete and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──┐
                  ├──► All User Stories can begin
                  │
Phase 2 (US1: Task Feedback) ──► Highest impact, start first
Phase 3 (US2: State Communication) ──► Can parallel with US1
Phase 4 (US3: Page Transitions) ──► After Toast component (T008)
Phase 5 (US4: Visual Hierarchy) ──► Can parallel with any
Phase 6 (US5: Accessibility) ──► After animations exist
Phase 7 (US6: Micro-interactions) ──► Lowest priority, last
                  │
                  ▼
Phase 8 (Validation) ──► All user stories complete
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Task Feedback) | Phase 1 Setup | US2, US4 |
| US2 (State Comm) | Phase 1 Setup | US1, US4 |
| US3 (Page Transitions) | Phase 1 Setup, T008 (Toast) | US4, US5 |
| US4 (Visual Hierarchy) | Phase 1 Setup | Any |
| US5 (Accessibility) | US1-US4 animations exist | US6 |
| US6 (Micro-interactions) | Phase 1 Setup | US5 |

### Within Each User Story

1. Create/modify utility components first (Toast, motion wrappers)
2. Apply to page components second
3. CSS refinements last
4. Each story independently testable at completion

---

## Parallel Execution Examples

### Example 1: Phase 1 Setup (All Parallel)

```bash
# Launch together after T001-T003:
Task: "Add reduced-motion CSS fallback in frontend/app/globals.css"
Task: "Create FadeIn utility component in frontend/components/motion/FadeIn.tsx"
Task: "Create AnimatedList wrapper in frontend/components/motion/AnimatedList.tsx"
```

### Example 2: US1 + US2 in Parallel

```bash
# US1 Team:
Task: "Create Toast notification component in frontend/components/Toast.tsx"
Task: "Wrap task list with AnimatePresence in frontend/app/tasks/page.tsx"

# US2 Team (parallel):
Task: "Enhance LoadingSpinner with smoother animation in frontend/components/LoadingSpinner.tsx"
Task: "Add motion fade-in to EmptyState in frontend/components/EmptyState.tsx"
```

### Example 3: CSS Tasks in Parallel

```bash
# All touch different files:
Task: "Add animation timing CSS custom properties in frontend/app/globals.css"
Task: "Improve task card shadow and depth in frontend/app/tasks/tasks.module.css"
Task: "Enhance form layout consistency in frontend/app/auth/auth.module.css"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: US1 Task Feedback (T008-T017)
3. Complete Phase 3: US2 State Communication (T018-T026)
4. **STOP and VALIDATE**: Core interaction polish complete
5. Demo/deploy if ready

**MVP Delivers**: Task CRUD animations + state feedback = 80% of polish impact

### Full Implementation

1. Phase 1: Setup (7 tasks)
2. Phase 2: US1 Task Feedback (10 tasks)
3. Phase 3: US2 State Communication (9 tasks)
4. Phase 4: US3 Page Transitions (7 tasks)
5. Phase 5: US4 Visual Hierarchy (6 tasks)
6. Phase 6: US5 Accessibility (7 tasks)
7. Phase 7: US6 Micro-interactions (6 tasks)
8. Phase 8: Validation (9 tasks)

**Total: 61 tasks**

### Incremental Delivery

Each user story completion = demonstrable improvement:
- After US1: "Tasks animate in and out!"
- After US2: "Loading and error states look great!"
- After US3: "Page transitions are smooth!"
- After US4: "The interface is cleaner!"
- After US5: "Works on mobile and with keyboard!"
- After US6: "Buttons feel amazing to click!"

---

## Requirement Traceability

| Task Range | Implements |
|------------|------------|
| T001-T007 | Infrastructure for FR-009, NFR-004 |
| T008-T017 | FR-001, FR-002, FR-003, FR-007, SC-001, SC-006 |
| T018-T026 | FR-004, FR-005, FR-006, FR-007, SC-002 |
| T027-T033 | FR-008, SC-007 |
| T034-T039 | SC-003 (partial) |
| T040-T046 | FR-009, FR-011, FR-013, FR-014, SC-004 |
| T047-T052 | FR-011, FR-012, SC-003 |
| T053-T061 | SC-005, SC-008, NFR-001, NFR-002, NFR-003 |

---

## Notes

- All tasks are CSS/component changes only - NO backend modifications
- [P] tasks touch different files and can run in parallel
- [Story] label maps each task to its user story for traceability
- Motion library (~18kb) is the only new dependency
- GPU-only properties (transform, opacity) for 60fps performance
- Commit after each logical task group
- Stop at any checkpoint to validate story independently
- Reduced motion users get opacity animations only (no transforms)
