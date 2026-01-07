# Tasks: In-Memory CLI Todo Application

**Input**: Design documents from `/specs/001-todo-cli/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli-commands.md

**Tests**: Tests are OPTIONAL per spec.md. No test tasks are included below.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- This is a single-project CLI application per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic directory structure

- [X] T001 Create project directory structure (src/, src/models/, src/services/, src/cli/)
- [X] T002 [P] Create __init__.py files for Python packages (src/__init__.py, src/models/__init__.py, src/services/__init__.py, src/cli/__init__.py)

**Checkpoint**: Project structure ready for code implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create Task model dataclass in src/models/task.py with id, title, description, is_completed fields
- [X] T004 Create custom exception classes (TaskNotFoundError, ValidationError) in src/services/task_service.py
- [X] T005 Implement in-memory storage initialization (tasks dict and next_id counter) in src/services/task_service.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Creation and Viewing (Priority: P1) 🎯 MVP

**Goal**: Enable users to add tasks and view the task list. This is the minimum viable product.

**Independent Test**: Launch app, add multiple tasks with varying titles/descriptions, view list, verify all tasks appear with correct IDs and status.

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement create_task function in src/services/task_service.py (validates title/description, assigns ID, stores task, returns Task object)
- [X] T007 [P] [US1] Implement get_all_tasks function in src/services/task_service.py (returns list of all tasks)
- [X] T008 [US1] Implement display_menu function in src/cli/menu.py (prints numbered menu options 1-6)
- [X] T009 [US1] Implement get_user_input function in src/cli/menu.py (prompts for command, returns choice)
- [X] T010 [US1] Implement handle_add_task function in src/cli/menu.py (prompts for title/description, calls create_task, displays success/errors)
- [X] T011 [US1] Implement handle_view_tasks function in src/cli/menu.py (calls get_all_tasks, formats and displays task list or empty message)
- [X] T012 [US1] Implement main event loop in src/cli/menu.py (while loop: display menu → get input → handle command → repeat until exit)
- [X] T013 [US1] Create main.py entry point (imports cli.menu, calls run function)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (add and view tasks works)

---

## Phase 4: User Story 2 - Task Status Management (Priority: P2)

**Goal**: Enable users to mark tasks as completed or incomplete

**Independent Test**: Create tasks, toggle their completion status, verify status changes reflected in task list.

### Implementation for User Story 2

- [X] T014 [US2] Implement get_task_by_id function in src/services/task_service.py (returns task or raises TaskNotFoundError)
- [X] T015 [US2] Implement toggle_task_status function in src/services/task_service.py (gets task by ID, flips is_completed boolean)
- [X] T016 [US2] Implement handle_toggle_status function in src/cli/menu.py (prompts for ID, shows current status, calls toggle_task_status, displays result/errors)
- [X] T017 [US2] Integrate toggle status handler into main event loop in src/cli/menu.py (add command 5 case)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (add, view, toggle status all functional)

---

## Phase 5: User Story 3 - Task Modification (Priority: P3)

**Goal**: Enable users to update task titles and descriptions

**Independent Test**: Create tasks, modify their titles and descriptions, verify changes reflected in task list.

### Implementation for User Story 3

- [X] T018 [US3] Implement update_task function in src/services/task_service.py (gets task by ID, validates new title/description, updates fields)
- [X] T019 [US3] Implement handle_update_task function in src/cli/menu.py (prompts for ID, shows current title, asks what to update (1=title, 2=description, 3=both), prompts for new values, calls update_task, displays result/errors)
- [X] T020 [US3] Integrate update handler into main event loop in src/cli/menu.py (add command 3 case)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently (add, view, toggle, update all functional)

---

## Phase 6: User Story 4 - Task Deletion (Priority: P4)

**Goal**: Enable users to delete tasks

**Independent Test**: Create tasks, delete specific tasks by ID, verify they no longer appear in task list.

### Implementation for User Story 4

- [X] T021 [US4] Implement delete_task function in src/services/task_service.py (gets task by ID, deletes from dict)
- [X] T022 [US4] Implement handle_delete_task function in src/cli/menu.py (prompts for ID, gets task details, asks for confirmation (y/n), calls delete_task if confirmed, displays result/errors)
- [X] T023 [US4] Integrate delete handler into main event loop in src/cli/menu.py (add command 4 case)

**Checkpoint**: All user stories should now be independently functional (all 5 core operations work)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, input validation, and documentation

- [X] T024 [P] Add input validation to handle_add_task in src/cli/menu.py (check empty title, enforce 200 char limit, enforce 1000 char description limit)
- [X] T025 [P] Add input validation to handle_update_task in src/cli/menu.py (check empty title for title updates, enforce length limits)
- [X] T026 [P] Add ID format validation to all ID-based handlers in src/cli/menu.py (verify integer input, display error for non-numeric input)
- [X] T027 [P] Implement handle_exit function in src/cli/menu.py (displays goodbye message, exits program)
- [X] T028 [P] Implement handle_invalid_command function in src/cli/menu.py (displays error for invalid menu choices)
- [X] T029 [P] Integrate exit and invalid command handlers into main event loop in src/cli/menu.py (add command 6 case and else clause)
- [X] T030 Create README.md in repository root (include: prerequisites (Python 3.13+), installation steps, how to run (python main.py), basic usage examples, limitations (in-memory only, no persistence))
- [X] T031 Update CLAUDE.md to document that implementation is complete for feature 001-todo-cli

**Checkpoint**: Application is complete, polished, and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires get_task_by_id which it implements (T014)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires get_task_by_id from US2, so ideally after US2 completes
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires get_task_by_id from US2, so ideally after US2 completes

**Recommended Order**: Foundational → US1 → US2 → US3 → US4 → Polish

### Within Each User Story

- Tasks marked [P] can run in parallel (different files)
- Tasks without [P] must run sequentially in the order listed
- Service layer tasks (src/services/) typically come before CLI tasks (src/cli/) that use them

### Parallel Opportunities

- **Phase 1 (Setup)**: Both tasks (T001, T002) can run in parallel
- **Phase 2 (Foundational)**: T003, T004 can run in parallel; T005 depends on T004
- **Phase 3 (US1)**: T006, T007 can run in parallel (different functions); T008, T009 can run in parallel; rest sequential
- **Phase 4 (US2)**: T014 must complete before T015
- **Phase 5 (US3)**: All tasks sequential
- **Phase 6 (US4)**: All tasks sequential
- **Phase 7 (Polish)**: T024, T025, T026, T027, T028 can all run in parallel; T029 depends on T027-T028; T030, T031 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch service functions in parallel (different functions):
Task T006: "Implement create_task function in src/services/task_service.py"
Task T007: "Implement get_all_tasks function in src/services/task_service.py"

# Launch CLI utility functions in parallel:
Task T008: "Implement display_menu function in src/cli/menu.py"
Task T009: "Implement get_user_input function in src/cli/menu.py"

# Then run handler tasks sequentially after service and utility functions complete:
Task T010: "Implement handle_add_task..."
Task T011: "Implement handle_view_tasks..."
Task T012: "Implement main event loop..."
Task T013: "Create main.py entry point"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005) - CRITICAL checkpoint
3. Complete Phase 3: User Story 1 (T006-T013)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Run: `python main.py`
   - Add multiple tasks (with and without descriptions)
   - View all tasks
   - Verify: IDs increment, statuses show "pending", empty list message works
5. Optionally deploy/demo MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready checkpoint
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (toggle status now works)
4. Add User Story 3 → Test independently → Deploy/Demo (update now works)
5. Add User Story 4 → Test independently → Deploy/Demo (delete now works)
6. Add Polish → Final validation → Production ready
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T006-T013)
   - Developer B: Can start User Story 2 (T014-T017) BUT must wait for T014 (get_task_by_id) before others
   - Developer C: Wait for US2 to complete T014, then start User Story 3 or 4
3. Stories integrate independently through shared service layer

---

## Notes

- [P] tasks = different files/functions, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests are included per spec.md (tests are optional, not requested)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **File structure**:
  - `src/models/task.py`: Task dataclass only
  - `src/services/task_service.py`: All CRUD functions + exceptions + storage
  - `src/cli/menu.py`: All CLI functions + event loop
  - `main.py`: Entry point (minimal)
- **Error handling**: Service layer raises exceptions, CLI layer catches and displays them
- **Validation**: Title required (1-200 chars), description optional (0-1000 chars), IDs must be valid integers
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

- **Total Tasks**: 31
- **Setup**: 2 tasks
- **Foundational**: 3 tasks
- **User Story 1 (P1 - MVP)**: 8 tasks
- **User Story 2 (P2)**: 4 tasks
- **User Story 3 (P3)**: 3 tasks
- **User Story 4 (P4)**: 3 tasks
- **Polish & Documentation**: 8 tasks

**Parallel Opportunities**: 9 tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- US1: Add and view tasks with correct IDs and statuses
- US2: Toggle task status and see changes in list
- US3: Update task titles/descriptions and see changes in list
- US4: Delete tasks and verify removal from list

**MVP Scope** (minimum for demo): Phase 1 + Phase 2 + Phase 3 (User Story 1) = 13 tasks
