# Implementation Tasks: Backend REST API & Persistent Data Layer

**Feature**: 002-web-app
**Branch**: `002-web-app`
**Created**: 2026-01-08
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Overview

This document breaks down the implementation of the Backend REST API into granular, testable tasks organized by user story priority. Each user story represents an independently testable increment of functionality.

**Total Tasks**: 38
**MVP Scope**: User Story 1 (View All Tasks) + User Story 2 (Create New Task) - 12 tasks
**Full Feature**: All 6 user stories - 38 tasks

## Task Organization

Tasks are organized into phases:
1. **Phase 1**: Setup & Project Initialization (5 tasks)
2. **Phase 2**: Foundational Infrastructure (8 tasks)
3. **Phase 3**: User Story 1 - View All Tasks [P1] (3 tasks)
4. **Phase 4**: User Story 2 - Create New Task [P1] (3 tasks)
5. **Phase 5**: User Story 6 - Toggle Completion [P1] (2 tasks)
6. **Phase 6**: User Story 3 - View Single Task [P2] (2 tasks)
7. **Phase 7**: User Story 4 - Update Task [P2] (3 tasks)
8. **Phase 8**: User Story 5 - Delete Task [P3] (2 tasks)
9. **Phase 9**: Polish & Documentation (10 tasks)

---

## Phase 1: Setup & Project Initialization

**Goal**: Create backend project structure and configure environment

**Satisfies**: Project structure from plan.md

- [x] T001 Create backend/ directory structure with app/ and tests/ subdirectories
- [x] T002 Create backend/app/__init__.py to initialize the app package
- [x] T003 Create backend/app/models/__init__.py for models package
- [x] T004 Create backend/app/schemas/__init__.py for schemas package
- [x] T005 Create backend/app/routers/__init__.py for routers package

---

## Phase 2: Foundational Infrastructure

**Goal**: Set up database connection, session management, and core models that all user stories depend on

**Satisfies**: FR-001 (persistence), plan.md Phase 3 (Foundation)

**Blocking**: ALL user story phases depend on these tasks

- [x] T006 Create backend/requirements.txt with dependencies: fastapi>=0.115.0, sqlmodel>=0.0.24, uvicorn[standard]>=0.30.0, psycopg2-binary>=2.9.9, python-dotenv>=1.0.0, pydantic>=2.0.0
- [x] T007 Create backend/.env.example with template: DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require
- [x] T008 Create backend/app/database.py with SQLModel engine creation (from DATABASE_URL env var) and get_session dependency using yield pattern
- [x] T009 Create backend/app/dependencies.py with SessionDep type alias: Annotated[Session, Depends(get_session)]
- [x] T010 Create backend/app/models/task.py with Task SQLModel table definition (7 fields: id, title, description, is_completed, created_at, updated_at, user_id)
- [x] T011 Create backend/app/schemas/task.py with TaskCreate schema (title, description) including field validator for non-empty title
- [x] T012 [P] Add TaskUpdate schema to backend/app/schemas/task.py (title, description, is_completed - all optional)
- [x] T013 [P] Add TaskResponse schema to backend/app/schemas/task.py (all Task fields for API responses)

---

## Phase 3: User Story 1 - View All Tasks [P1]

**Story Goal**: Users can see all their tasks to review what needs to be done

**Priority**: P1 (Core viewing capability)

**Satisfies**: FR-002, FR-003 (user-scoped queries), spec.md User Story 1

**Independent Test Criteria**:
- [ ] Create 5 tasks for user 1, GET /api/1/tasks returns all 5 with complete details
- [ ] GET /api/1/tasks with no tasks returns empty array []
- [ ] Create tasks for user 1 and user 2, GET /api/1/tasks returns only user 1's tasks (no data leakage)

**Implementation Tasks**:

- [x] T014 [US1] Create backend/app/routers/tasks.py with APIRouter and import SessionDep
- [x] T015 [US1] Implement GET /api/{user_id}/tasks endpoint in backend/app/routers/tasks.py that queries Task filtered by user_id and returns list of TaskResponse
- [x] T016 [US1] Create backend/app/main.py with FastAPI app instance, include tasks router with prefix=/api, add startup event to call SQLModel.metadata.create_all(engine)

---

## Phase 4: User Story 2 - Create New Task [P1]

**Story Goal**: Users can add new tasks to track things they need to do

**Priority**: P1 (Essential creation capability)

**Satisfies**: FR-002, FR-006 (validation), FR-007 (created_at), FR-009 (non-empty title), spec.md User Story 2

**Depends On**: Phase 3 (US1) for task listing to verify creation

**Independent Test Criteria**:
- [ ] POST /api/1/tasks with title+description returns 201 with is_completed=false and timestamps
- [ ] POST /api/1/tasks with title only succeeds with description=null
- [ ] POST /api/1/tasks with empty title returns 400 Bad Request
- [ ] Task created by user 1 does not appear in GET /api/2/tasks (isolation)

**Implementation Tasks**:

- [x] T017 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/app/routers/tasks.py that creates Task with user_id from path, validates via TaskCreate schema, returns 201 with TaskResponse
- [x] T018 [US2] Add Pydantic field validator to TaskCreate in backend/app/schemas/task.py to ensure title is not empty/whitespace (raise ValueError)
- [x] T019 [US2] Test POST endpoint returns 400 when title is empty (Pydantic validation triggers)

---

## Phase 5: User Story 6 - Toggle Completion [P1]

**Story Goal**: Users can mark tasks complete/incomplete to track progress

**Priority**: P1 (Core value proposition of todo app)

**Satisfies**: FR-002, FR-008 (updated_at), FR-011 (is_completed), spec.md User Story 6

**Depends On**: Phase 3 (US1) and Phase 4 (US2) for creating and viewing tasks

**Independent Test Criteria**:
- [ ] PATCH /api/1/tasks/123/complete on incomplete task sets is_completed=true and refreshes updated_at
- [ ] PATCH /api/1/tasks/123/complete on complete task sets is_completed=false
- [ ] PATCH /api/1/tasks/456/complete where task belongs to user 2 returns 404
- [ ] PATCH /api/1/tasks/999/complete where task doesn't exist returns 404

**Implementation Tasks**:

- [x] T020 [US6] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/app/routers/tasks.py that queries Task by id AND user_id, toggles is_completed, updates updated_at timestamp, returns 200 with TaskResponse
- [x] T021 [US6] Add error handling in PATCH endpoint to return 404 when task not found or belongs to different user

---

## Phase 6: User Story 3 - View Single Task [P2]

**Story Goal**: Users can view full details of a specific task

**Priority**: P2 (Useful but not blocking - list view works alone)

**Satisfies**: FR-002, FR-004 (ownership enforcement), FR-005 (404 for unauthorized), spec.md User Story 3

**Depends On**: Phase 3 (US1) and Phase 4 (US2) for task creation

**Independent Test Criteria**:
- [ ] GET /api/1/tasks/123 where task exists and belongs to user 1 returns 200 with complete task details
- [ ] GET /api/1/tasks/999 where task doesn't exist returns 404
- [ ] GET /api/1/tasks/456 where task belongs to user 2 returns 404 (no information leakage)

**Implementation Tasks**:

- [x] T022 [US3] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/app/routers/tasks.py that queries Task by id AND user_id, returns 200 with TaskResponse
- [x] T023 [US3] Add error handling to return 404 when task not found or doesn't belong to user (HTTPException)

---

## Phase 7: User Story 4 - Update Task [P2]

**Story Goal**: Users can modify task title/description to refine information

**Priority**: P2 (Important for data accuracy but not blocking core usage)

**Satisfies**: FR-002, FR-006 (validation), FR-008 (updated_at refresh), spec.md User Story 4

**Depends On**: Phase 3 (US1), Phase 4 (US2), Phase 6 (US3) for retrieving tasks to verify updates

**Independent Test Criteria**:
- [ ] PUT /api/1/tasks/123 with new title updates title and refreshes updated_at timestamp
- [ ] PUT /api/1/tasks/123 with empty title returns 400 and task remains unchanged
- [ ] PUT /api/1/tasks/456 where task belongs to user 2 returns 404
- [ ] Verify created_at timestamp never changes during update

**Implementation Tasks**:

- [x] T024 [US4] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/app/routers/tasks.py that queries Task by id AND user_id, updates fields from TaskUpdate schema, refreshes updated_at=datetime.utcnow(), returns 200 with TaskResponse
- [x] T025 [US4] Add validation in PUT endpoint to return 400 when TaskUpdate contains empty title
- [x] T026 [US4] Add error handling to return 404 when task not found or doesn't belong to user

---

## Phase 8: User Story 5 - Delete Task [P3]

**Story Goal**: Users can permanently remove tasks for cleanup

**Priority**: P3 (Useful but users can work around by ignoring tasks)

**Satisfies**: FR-002, FR-004 (ownership), FR-005 (404), spec.md User Story 5

**Depends On**: Phase 3 (US1) and Phase 4 (US2) for task creation

**Independent Test Criteria**:
- [ ] DELETE /api/1/tasks/123 removes task and subsequent GET returns 404
- [ ] DELETE /api/1/tasks/999 where task doesn't exist returns 404
- [ ] DELETE /api/1/tasks/456 where task belongs to user 2 returns 404

**Implementation Tasks**:

- [x] T027 [US5] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/app/routers/tasks.py that queries Task by id AND user_id, deletes via session.delete(), returns 204 No Content
- [x] T028 [US5] Add error handling to return 404 when task not found or doesn't belong to user

---

## Phase 9: Polish & Documentation

**Goal**: Complete testing infrastructure, documentation, and production readiness

**Satisfies**: Constitution principles (testing, documentation), plan.md quality validation

- [x] T029 Create backend/tests/__init__.py for tests package
- [x] T030 Create backend/tests/conftest.py with pytest fixtures for test database, test client (TestClient from fastapi.testclient), and test session
- [x] T031 Create backend/tests/test_models.py with tests for Task model validation (empty title raises error, user_id required, timestamps set automatically)
- [x] T032 Create backend/tests/test_tasks.py with integration tests for all 6 endpoints covering acceptance scenarios from spec.md
- [x] T033 [P] Add test in backend/tests/test_tasks.py for user isolation: create task for user 1, verify user 2 cannot access it (404)
- [x] T034 [P] Add test in backend/tests/test_tasks.py for empty task list returns [] not error
- [x] T035 [P] Add negative tests in backend/tests/test_tasks.py for malformed IDs, missing fields, extremely long titles
- [x] T036 Create backend/README.md with setup instructions from quickstart.md, API endpoint documentation, environment variables
- [x] T037 Add CORS middleware to backend/app/main.py for future frontend integration (allow origins, methods, headers)
- [x] T038 Verify all acceptance criteria from spec.md are testable and passing (checklist validation)

---

## Dependencies & Execution Order

### Story Dependency Graph

```
Phase 1 (Setup) →  Phase 2 (Foundation)
                         ↓
                   ┌─────┴─────────────────┐
                   ↓                       ↓
           Phase 3 (US1: View) ←───→ Phase 4 (US2: Create)
                   │                       │
                   ↓                       ↓
           Phase 5 (US6: Toggle) ←────────┘
                   │
         ┌─────────┴──────────┐
         ↓                    ↓
Phase 6 (US3: Get)    Phase 7 (US4: Update)
         │                    │
         └────────┬───────────┘
                  ↓
          Phase 8 (US5: Delete)
                  ↓
          Phase 9 (Polish)
```

**Critical Path**: Setup → Foundation → US1 → US2 → US6 → Polish

**Parallel Opportunities**:
- After Phase 2: US1 (View) and US2 (Create) can be developed in parallel IF using separate files
- After Phase 5: US3 (Get), US4 (Update), and US5 (Delete) can be developed in parallel (all modify same router file but different functions)
- Phase 9 tests: test_models.py and test_tasks.py can be written in parallel

### Blocking Dependencies

**Phase 2 blocks everything**: All user stories require the database, models, and schemas

**Phase 3 + 4 block later stories**:
- US6 (Toggle) depends on US1 (View) and US2 (Create) to create and verify tasks
- US3 (Get Single) depends on US2 (Create) to have tasks to retrieve
- US4 (Update) depends on US3 (Get) to verify updates
- US5 (Delete) depends on US1 (View) to verify deletion

### Independent User Stories

These stories can be tested independently once their dependencies are met:

1. **US1 (View All)** - Independent after Phase 2, requires only database and Task model
2. **US2 (Create)** - Independent after Phase 2, can test without US1 by checking database directly
3. **US6 (Toggle)** - Requires US1 + US2 to create and verify tasks
4. **US3 (Get Single)** - Requires US2 to create test data
5. **US4 (Update)** - Requires US2 + US3 to create and retrieve tasks
6. **US5 (Delete)** - Requires US2 to create test data, US1 to verify deletion

---

## Parallel Execution Strategy

### Within Phases

**Phase 2 (Foundation)**: Tasks T011-T013 can be done in parallel (different schema files)

**Phase 9 (Polish)**: Tasks T033-T035 can be done in parallel (adding different tests to same file)

### Across Phases (After Critical Path)

Once US1 and US2 are complete:
- **Parallel Set 1**: US6 (Toggle) implementation
- **Parallel Set 2**: After US6, can implement US3, US4, US5 in parallel (all add functions to tasks.py router)

**Example Parallel Workflow**:

```
Day 1: T001-T013 (Setup + Foundation) - Sequential
Day 2: T014-T019 (US1 + US2) - Sequential
Day 3: T020-T021 (US6) - Sequential
Day 4: T022-T028 (US3, US4, US5) - 3 parallel tracks:
  - Track A: T022-T023 (US3)
  - Track B: T024-T026 (US4)
  - Track C: T027-T028 (US5)
Day 5: T029-T038 (Polish) - Mix of sequential and parallel
```

---

## MVP Implementation Strategy

**Minimum Viable Product**: User Story 1 + User Story 2 (View + Create)

**MVP Tasks**: T001-T019 (19 tasks)

**MVP Deliverable**:
- Users can create tasks via POST /api/{user_id}/tasks
- Users can view all their tasks via GET /api/{user_id}/tasks
- Data persists in Neon PostgreSQL
- User isolation enforced (user 1 cannot see user 2's tasks)
- Input validation (empty titles rejected)

**Why This MVP**:
- Delivers core value: users can add and view tasks
- Independently testable
- Demonstrates data persistence and user isolation
- Foundation for all other stories

**Next Increment**: Add US6 (Toggle) - Tasks T020-T021 (2 tasks)
- This completes the core todo app functionality (create, view, toggle completion)

**Final Increments**: Add US3, US4, US5 (Get, Update, Delete) - Tasks T022-T028 (7 tasks)
- These are enhancements but not critical for basic usage

---

## Validation Checklist

Before marking this feature complete, verify:

### Code Quality
- [ ] All tasks T001-T038 completed
- [ ] All code follows clean code standards (SRP, clear naming, separation of concerns)
- [ ] No code duplication without justification
- [ ] All file paths match plan.md project structure
- [ ] Dependencies in requirements.txt match plan.md technical context

### Functional Requirements (from spec.md)
- [ ] FR-001: Data persists to Neon PostgreSQL ✓
- [ ] FR-002: All 6 REST endpoints implemented ✓
- [ ] FR-003: All queries filtered by user_id ✓
- [ ] FR-004: Ownership enforced (404 for unauthorized access) ✓
- [ ] FR-005: 404 for non-existent tasks ✓
- [ ] FR-006: 400 for invalid input ✓
- [ ] FR-007: created_at set automatically ✓
- [ ] FR-008: updated_at updated on modifications ✓
- [ ] FR-009: Title validation (non-empty) ✓
- [ ] FR-010: Description optional ✓
- [ ] FR-011: is_completed boolean maintained ✓
- [ ] FR-012: Unique ID per task ✓
- [ ] FR-013: user_id foreign key ✓
- [ ] FR-014: Concurrent users supported ✓
- [ ] FR-015: Data persists across restarts ✓

### Success Criteria (from spec.md)
- [ ] SC-001: Task creation + list within 2 seconds
- [ ] SC-002: 100% data isolation (zero leakage)
- [ ] SC-003: Data persists across restarts
- [ ] SC-004: 100 concurrent users without errors
- [ ] SC-005: All 6 operations work with correct responses
- [ ] SC-006: Correct HTTP status codes (200, 201, 204, 400, 404)
- [ ] SC-007: Invalid requests rejected 100% of time

### User Story Acceptance (from spec.md)
- [ ] US1: View All Tasks - All 3 acceptance scenarios pass
- [ ] US2: Create New Task - All 4 acceptance scenarios pass
- [ ] US3: View Single Task - All 3 acceptance scenarios pass
- [ ] US4: Update Task - All 4 acceptance scenarios pass
- [ ] US5: Delete Task - All 3 acceptance scenarios pass
- [ ] US6: Toggle Completion - All 4 acceptance scenarios pass

### Testing
- [ ] Unit tests for Task model pass (test_models.py)
- [ ] Integration tests for all 6 endpoints pass (test_tasks.py)
- [ ] User isolation tests pass (no data leakage)
- [ ] Negative tests pass (malformed input, invalid IDs)
- [ ] Edge cases handled (empty list, concurrent updates)

### Documentation
- [ ] README.md complete with setup instructions
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide included

### Constitution Compliance
- [ ] All tasks trace back to plan.md and spec.md
- [ ] No unauthorized code written
- [ ] Clean code standards followed
- [ ] Documentation complete and accurate
- [ ] Traceability maintained

---

## Notes

- **No Test-Driven Development**: Tests are created after implementation (Phase 9) per plan.md
- **No Authentication Yet**: user_id in URL is placeholder, JWT deferred to Phase 2
- **Hard Delete**: Tasks are permanently removed (no soft delete/audit trail)
- **Sync Sessions**: Using SQLModel sync sessions, not async (per research.md decision)
- **Manual Timestamps**: updated_at updated in application code, not DB triggers

---

## Traceability

| Task Range | Plan Section | Spec Requirements |
|------------|--------------|-------------------|
| T001-T005 | Project Structure | - |
| T006-T013 | Phase 3 Foundation | FR-001, FR-007, FR-009, FR-010, FR-011, FR-012, FR-013 |
| T014-T016 | User Story 1 | FR-002, FR-003, US1 |
| T017-T019 | User Story 2 | FR-002, FR-006, FR-009, US2 |
| T020-T021 | User Story 6 | FR-002, FR-008, FR-011, US6 |
| T022-T023 | User Story 3 | FR-002, FR-004, FR-005, US3 |
| T024-T026 | User Story 4 | FR-002, FR-006, FR-008, US4 |
| T027-T028 | User Story 5 | FR-002, FR-004, FR-005, US5 |
| T029-T038 | Testing Strategy | FR-014, FR-015, All Success Criteria |

---

**Generated**: 2026-01-08
**Ready for**: `/sp.implement`
