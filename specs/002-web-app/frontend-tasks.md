# Tasks: Frontend Completion & System Integration

**Input**: Design documents from `/specs/002-web-app/`
**Prerequisites**: frontend-plan.md, frontend-spec.md, frontend-research.md, frontend-data-model.md, frontend-quickstart.md

**Tests**: This specification uses manual end-to-end testing. No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `frontend/app/`, `frontend/lib/`, `frontend/services/`
- **Backend** (Phase 1 complete): `backend/app/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure from Phase 1 (authentication) is functional

**Status**: Phase 1 (Authentication) already complete - verification only

- [X] T001 Verify backend API is running at http://localhost:8000 with all 6 task endpoints functional
- [X] T002 Verify Better Auth configuration in frontend/lib/auth.ts and frontend/lib/auth-client.ts
- [X] T003 [P] Verify authenticated API client in frontend/lib/api-client.ts attaches JWT tokens
- [X] T004 [P] Verify task service methods in frontend/services/tasks.ts (getAllTasks, createTask, updateTask, toggleComplete, deleteTask, getTask)
- [X] T005 Verify environment variables configured in frontend/.env.local (BETTER_AUTH_SECRET, DATABASE_URL, NEXT_PUBLIC_API_URL)

**Checkpoint**: Infrastructure ready - all Phase 1 components functional and verified

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and styling that MUST be complete before user story enhancements

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create frontend/app/globals.css with CSS variables for colors, spacing, and breakpoints
- [X] T007 [P] Create reusable LoadingSpinner component in frontend/components/LoadingSpinner.tsx
- [X] T008 [P] Create reusable ErrorMessage component in frontend/components/ErrorMessage.tsx
- [X] T009 [P] Create reusable EmptyState component in frontend/components/EmptyState.tsx
- [X] T010 Add responsive meta viewport tag to frontend/app/layout.tsx if not present
- [X] T011 Add sign-out functionality to frontend/app/layout.tsx navigation header

**Checkpoint**: Foundation ready - reusable components available for all user stories

---

## Phase 3: User Story 1 - New User Onboarding (Priority: P1) 🎯 MVP

**Goal**: New users can register, log in, create their first task, and verify data persistence across sessions

**Independent Test**: Open application → sign up → create task → close browser → sign in → verify task persists

**Status**: ~80% complete from Phase 1 - verification and landing page enhancement needed

### Implementation for User Story 1

- [X] T012 [US1] Enhance frontend/app/page.tsx landing page with clear "Get Started" and "Sign In" navigation
- [X] T013 [US1] Verify frontend/app/auth/signup/page.tsx accepts name, email, password and creates account
- [X] T014 [US1] Verify frontend/app/auth/signin/page.tsx accepts email, password and establishes session
- [X] T015 [US1] Verify automatic redirect from signup to /tasks page after successful registration
- [X] T016 [US1] Verify task creation form in frontend/app/tasks/page.tsx (title required, description optional)
- [X] T017 [US1] Verify new task appears immediately in task list after creation
- [X] T018 [US1] Test complete flow: signup → create task → logout → login → verify task persistence

**Checkpoint**: User Story 1 fully functional - new users can onboard and create tasks

---

## Phase 4: User Story 2 - Task Management Workflow (Priority: P1)

**Goal**: Users can perform all CRUD operations (view, create, edit, delete, toggle completion) with proper UI feedback

**Independent Test**: Log in → view tasks → create task → edit task → toggle completion → delete task → verify empty state

**Status**: ~60% complete - needs edit functionality, delete confirmation, better loading states, and validation

### Implementation for User Story 2

- [X] T019 [P] [US2] Add edit mode state to frontend/app/tasks/page.tsx (editingTaskId, editTitle, editDescription)
- [X] T020 [P] [US2] Add form validation for task title (required, max 255 chars, trim whitespace) in frontend/app/tasks/page.tsx
- [X] T021 [US2] Implement edit button that switches task display to edit form in frontend/app/tasks/page.tsx
- [X] T022 [US2] Implement save edit functionality with optimistic UI update in frontend/app/tasks/page.tsx
- [X] T023 [US2] Implement cancel edit functionality that discards changes in frontend/app/tasks/page.tsx
- [X] T024 [US2] Add delete confirmation state (deletingTaskId) to frontend/app/tasks/page.tsx
- [X] T025 [US2] Replace immediate delete with confirmation dialog UI in frontend/app/tasks/page.tsx
- [X] T026 [US2] Implement confirm delete with loading state in frontend/app/tasks/page.tsx
- [X] T027 [US2] Add loading states for create, update, toggle, and delete operations in frontend/app/tasks/page.tsx
- [X] T028 [US2] Add inline validation error display for empty task title in frontend/app/tasks/page.tsx
- [X] T029 [US2] Add inline validation error display for title exceeding 255 chars in frontend/app/tasks/page.tsx
- [X] T030 [US2] Verify empty state message displays when user has zero tasks in frontend/app/tasks/page.tsx
- [X] T031 [US2] Verify task list displays in reverse chronological order (newest first) in frontend/app/tasks/page.tsx
- [X] T032 [US2] Verify completed tasks show strikethrough styling in frontend/app/tasks/page.tsx
- [X] T033 [US2] Add visual distinction between complete and incomplete tasks (checkmark icons) in frontend/app/tasks/page.tsx

**Checkpoint**: User Story 2 fully functional - complete task management with all CRUD operations

---

## Phase 5: User Story 3 - Responsive Mobile Experience (Priority: P2)

**Goal**: Application is fully functional and visually optimized for mobile devices (320px+) with touch-friendly controls

**Independent Test**: Open application in mobile browser or DevTools device emulation → verify no horizontal scroll → tap all buttons → create/edit tasks → verify comfortable interaction

### Implementation for User Story 3

- [X] T034 [P] [US3] Add mobile-first responsive CSS to frontend/app/globals.css (base styles for 320px+)
- [X] T035 [P] [US3] Add tablet breakpoint styles (@media min-width: 768px) to frontend/app/globals.css
- [X] T036 [P] [US3] Add desktop breakpoint styles (@media min-width: 1024px) to frontend/app/globals.css
- [X] T037 [US3] Add responsive CSS for task list container in frontend/app/tasks/page.tsx (flexbox, proper spacing)
- [X] T038 [US3] Add responsive CSS for task item cards in frontend/app/tasks/page.tsx (stack on mobile, row on desktop)
- [X] T039 [US3] Add responsive CSS for create task form in frontend/app/tasks/page.tsx (full width on mobile)
- [X] T040 [US3] Ensure all buttons meet 44x44px minimum touch target in frontend/app/tasks/page.tsx
- [X] T041 [US3] Ensure form inputs are sized for comfortable mobile interaction in frontend/app/tasks/page.tsx
- [X] T042 [US3] Add proper spacing between interactive elements (8px minimum) in frontend/app/tasks/page.tsx
- [X] T043 [US3] Test layout on 320px width (iPhone SE) - verify no horizontal scroll
- [X] T044 [US3] Test layout on 768px width (iPad portrait) - verify comfortable tablet experience
- [X] T045 [US3] Test layout on 1024px+ width (desktop) - verify centered layout with max-width
- [X] T046 [US3] Verify text remains readable at all breakpoints (minimum 16px base font size)

**Checkpoint**: User Story 3 fully functional - mobile-optimized responsive design

---

## Phase 6: User Story 4 - Session Management (Priority: P2)

**Goal**: Proper authentication flow with route protection, session persistence, token expiry handling, and secure sign-out

**Independent Test**: Try accessing /tasks without login → verify redirect → login → verify access → sign out → verify redirect → wait for token expiry → verify redirect

### Implementation for User Story 4

- [X] T047 [US4] Enhance session check in frontend/app/tasks/page.tsx to show loading state during auth verification
- [X] T048 [US4] Add proper redirect to /auth/signin when session is missing in frontend/app/tasks/page.tsx
- [X] T049 [US4] Implement sign-out button in frontend/app/layout.tsx navigation that calls authClient.signOut()
- [X] T050 [US4] Ensure sign-out clears Better Auth session and redirects to /auth/signin
- [X] T051 [US4] Add 401 error handling in frontend/lib/api-client.ts to redirect to /auth/signin on token expiry
- [X] T052 [US4] Add session expiry message state to display "Session expired, please sign in again"
- [X] T053 [US4] Verify unauthenticated users cannot access /tasks directly (auto-redirect to sign-in)
- [X] T054 [US4] Verify authenticated users maintain session across page refreshes
- [X] T055 [US4] Test token expiry scenario (24 hours or manipulate JWT expiry) - verify redirect to sign-in
- [X] T056 [US4] Test sign-out functionality - verify session cleared and redirect works
- [X] T057 [US4] Test that user cannot access another user's tasks by modifying URL parameters

**Checkpoint**: User Story 4 fully functional - secure session management

---

## Phase 7: User Story 5 - Error Handling (Priority: P3)

**Goal**: Clear, actionable error messages for network failures, validation errors, API errors, and unexpected states

**Independent Test**: Simulate network failure → verify error message → reconnect → retry → verify success. Submit invalid form → verify inline error. Stop backend → verify friendly error.

### Implementation for User Story 5

- [X] T058 [P] [US5] Enhance error state in frontend/app/tasks/page.tsx to show network failure message with retry button
- [X] T059 [P] [US5] Add specific error handling for 403 Forbidden in frontend/lib/api-client.ts with access denied message
- [X] T060 [P] [US5] Add specific error handling for 404 Not Found in frontend/lib/api-client.ts
- [X] T061 [US5] Add specific error handling for 422 Validation Error in frontend/lib/api-client.ts
- [X] T062 [US5] Add specific error handling for 500 Server Error in frontend/lib/api-client.ts with friendly message
- [X] T063 [US5] Add retry mechanism for failed API calls in frontend/app/tasks/page.tsx
- [X] T064 [US5] Ensure form data is retained when validation fails or network error occurs
- [X] T065 [US5] Add network error simulation test - verify error message and data retention
- [X] T066 [US5] Add backend offline test - verify friendly error message with retry option
- [X] T067 [US5] Add invalid form submission test - verify inline validation error messages
- [X] T068 [US5] Ensure all error messages are user-friendly (no technical jargon or stack traces)
- [X] T069 [US5] Ensure errors are cleared when user successfully retries operation

**Checkpoint**: User Story 5 fully functional - comprehensive error handling

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and validation against success criteria

- [ ] T070 [P] Review all components for clean code standards (SRP, clear naming, DRY)
- [ ] T071 [P] Extract duplicate code into reusable utilities (error formatting, date formatting)
- [ ] T072 [P] Add comments for non-obvious logic (authentication flows, edge cases)
- [ ] T073 [P] Review CSS for consistency (spacing, colors, typography)
- [ ] T074 Verify constitution compliance (all 10 principles) against implementation
- [ ] T075 Update frontend/README.md with setup instructions if needed
- [ ] T076 Test complete end-to-end flow from frontend-quickstart.md Test 1 (new user onboarding)
- [ ] T077 Test complete end-to-end flow from frontend-quickstart.md Test 2 (task management)
- [ ] T078 Test complete end-to-end flow from frontend-quickstart.md Test 3 (responsive mobile)
- [ ] T079 Test complete end-to-end flow from frontend-quickstart.md Test 4 (session management)
- [ ] T080 Test complete end-to-end flow from frontend-quickstart.md Test 5 (error handling)
- [ ] T081 Validate SC-001: New user signup + first task under 3 minutes
- [ ] T082 Validate SC-002: Task operations complete within 2 seconds
- [ ] T083 Validate SC-003: Page loads within 3 seconds on broadband
- [ ] T084 Validate SC-004: No horizontal scroll on 320px+ screens
- [ ] T085 Validate SC-005: Touch targets minimum 44x44px
- [ ] T086 Validate SC-006: 95% first-attempt success rate for operations
- [ ] T087 Validate SC-007: Automatic sign-out after 24 hours works
- [ ] T088 Validate SC-008: 100% cross-user access blocked (403 errors)
- [ ] T089 Validate SC-009: 100% error messages displayed clearly
- [ ] T090 Validate SC-010: Multi-device access functional (same account, different browsers)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verification of Phase 1 authentication work
- **Foundational (Phase 2)**: Depends on Setup verification - BLOCKS all user story enhancements
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - mostly verification work
  - User Story 2 (P1): Can start after Foundational - independent of US1
  - User Story 3 (P2): Can start after Foundational - adds CSS across all pages
  - User Story 4 (P2): Can start after Foundational - enhances existing auth
  - User Story 5 (P3): Can start after Foundational - adds error handling
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1, works on same page but different features
- **User Story 3 (P2)**: Should wait for US1 and US2 to avoid CSS conflicts - adds responsive styling to existing UI
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, enhances existing auth flow
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent, adds error handling across all operations

### Within Each User Story

- Tasks within a story should generally be done in order (dependencies exist)
- Tasks marked [P] can run in parallel (different files or independent work)
- Story is complete when all its tasks pass independent testing

### Parallel Opportunities

**Phase 2 (Foundational)**:
```bash
# Can work in parallel:
T007: LoadingSpinner component
T008: ErrorMessage component
T009: EmptyState component
```

**Phase 3 (User Story 1)**:
```bash
# Most tasks are verification - sequential work
```

**Phase 4 (User Story 2)**:
```bash
# Can work in parallel:
T019: Add edit mode state
T020: Add form validation
T024: Add delete confirmation state
```

**Phase 5 (User Story 3)**:
```bash
# Can work in parallel:
T034: Mobile-first CSS base
T035: Tablet breakpoint styles
T036: Desktop breakpoint styles
```

**Phase 6 (User Story 4)**:
```bash
# Sequential work - each task builds on previous
```

**Phase 7 (User Story 5)**:
```bash
# Can work in parallel:
T058: Network failure error handling
T059: 403 Forbidden error handling
T060: 404 Not Found error handling
T061: 422 Validation error handling
T062: 500 Server error handling
```

**Phase 8 (Polish)**:
```bash
# Can work in parallel:
T070: Clean code review
T071: Extract duplicate code
T072: Add comments
T073: CSS consistency review
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup verification (T001-T005)
2. Complete Phase 2: Foundational components (T006-T011)
3. Complete Phase 3: User Story 1 - Onboarding (T012-T018)
4. Complete Phase 4: User Story 2 - Task Management (T019-T033)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo basic functional application

### Incremental Delivery

1. **Setup + Foundational** → Foundation ready (T001-T011)
2. **Add User Story 1** → Test independently → Deploy (MVP minus edit/delete)
3. **Add User Story 2** → Test independently → Deploy (Full CRUD working)
4. **Add User Story 3** → Test independently → Deploy (Mobile-responsive)
5. **Add User Story 4** → Test independently → Deploy (Secure sessions)
6. **Add User Story 5** → Test independently → Deploy (Polish with error handling)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Developer A**: User Story 1 (verification) + User Story 2 (CRUD features)
2. **Developer B**: User Story 3 (responsive CSS) + User Story 4 (session management)
3. **Developer C**: User Story 5 (error handling) + Foundational components

Stories complete and integrate independently with minimal conflicts.

---

## Parallel Example: User Story 2

```bash
# Launch parallel tasks for User Story 2:
Task T019: "Add edit mode state to frontend/app/tasks/page.tsx"
Task T020: "Add form validation for task title in frontend/app/tasks/page.tsx"
Task T024: "Add delete confirmation state to frontend/app/tasks/page.tsx"

# These three tasks work on state management and can be done simultaneously
# Then continue with dependent tasks sequentially
```

---

## Task Summary

**Total Tasks**: 90
- **Phase 1 (Setup)**: 5 tasks (verification only)
- **Phase 2 (Foundational)**: 6 tasks (reusable components)
- **Phase 3 (US1 - P1)**: 7 tasks (onboarding verification)
- **Phase 4 (US2 - P1)**: 15 tasks (full CRUD enhancement)
- **Phase 5 (US3 - P2)**: 13 tasks (responsive design)
- **Phase 6 (US4 - P2)**: 11 tasks (session management)
- **Phase 7 (US5 - P3)**: 12 tasks (error handling)
- **Phase 8 (Polish)**: 21 tasks (validation and documentation)

**Parallel Opportunities**: 19 tasks marked [P] can run in parallel
**MVP Scope**: Phases 1-4 (T001-T033) = 33 tasks for basic functional app
**Full Feature**: All 90 tasks for complete production-ready application

---

## Notes

- [P] tasks = different files or independent work, no dependencies
- [US1], [US2], etc. = Story labels for traceability to frontend-spec.md
- Each user story should be independently testable via frontend-quickstart.md scenarios
- Manual testing strategy - no automated UI test tasks
- Constitution compliance verified in Phase 8 (Task T074)
- All success criteria (SC-001 through SC-010) validated in Phase 8 (Tasks T081-T090)
- Existing Phase 1 code provides ~60-80% of functionality - tasks focus on enhancements
