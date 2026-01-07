# Implementation Plan: In-Memory CLI Todo Application

**Branch**: `001-todo-cli` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-cli/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an in-memory Python CLI todo application supporting task creation, viewing, updating, deletion, and status management. The application will use Python 3.13+ standard library only, maintain state in memory (no persistence), and provide an interactive command-line interface for single-user task management within a terminal session.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Python standard library only (argparse for CLI, dataclasses for models)
**Storage**: In-memory only (Python list/dict structures) - no files, no databases
**Testing**: Python unittest (standard library) - tests are optional per spec
**Target Platform**: Cross-platform (Linux, macOS, Windows) - any system with Python 3.13+
**Project Type**: Single standalone CLI application
**Performance Goals**: Interactive response time (<100ms per command) for up to 50 tasks per session
**Constraints**:
- No external dependencies beyond Python standard library
- No data persistence
- Single-user, single-session only
- Memory footprint <10MB for typical usage (50 tasks)
**Scale/Scope**:
- Single feature (todo management)
- ~5 CLI commands (add, view, update, delete, toggle)
- ~3-4 source modules
- Target: 50+ tasks per session without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I: Spec-Driven Lifecycle** ✅ PASS
- Specification complete and validated in spec.md
- Planning phase in progress
- Tasks and implementation phases follow after plan approval

**Principle II: No Code Without Authorization** ✅ PASS (N/A - planning phase)
- No code will be written until tasks.md is created and approved

**Principle III: AI-Only Implementation** ✅ PASS (N/A - planning phase)
- All code will be generated via /sp.implement after tasks are defined

**Principle IV: Clarification Over Assumptions** ✅ PASS
- Specification has zero [NEEDS CLARIFICATION] markers
- All requirements are clear and documented
- Research phase (Phase 0) will validate Python CLI best practices

**Principle V: Clean Code Standards** ✅ PASS (design commitment)
- Plan will enforce separation of concerns (models, services, CLI)
- Single Responsibility Principle applied to module structure
- Clear naming conventions to be established in data-model.md

**Principle VI: Technology Stack Adherence** ✅ PASS
- Python 3.13+ per Hackathon II Phase I requirements
- CLI-only per phase constraints
- In-memory storage per phase specification
- No web, API, or AI features as required

**Principle VII: State Management Discipline** ✅ PASS
- In-memory only (explicit requirement)
- No persistence (explicit constraint)
- State location: Python data structures in service layer
- State clearing on program exit (explicit requirement)

**Principle VIII: Traceability** ✅ PASS (design commitment)
- This plan maps back to spec.md requirements
- Tasks will map to plan sections
- Code files will map to task IDs

**Principle IX: Mandatory Documentation** ✅ PASS (design commitment)
- README.md will be created (setup and usage)
- CLAUDE.md exists (Claude Code interaction guide)
- This plan.md documents architecture
- data-model.md will document entities
- contracts/ will document CLI commands

**Principle X: External Knowledge via Context7** ✅ PASS
- Context7 used to validate Python CLI best practices
- Will use Context7 for any additional library guidance needed

**GATE STATUS**: ✅ ALL CHECKS PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-cli/
├── spec.md              # Feature specification (created by /sp.specify)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technical research and decisions
├── data-model.md        # Phase 1: Task entity specification
├── quickstart.md        # Phase 1: User guide
├── contracts/           # Phase 1: CLI command contracts
│   └── cli-commands.md  # Interactive menu command specifications
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (from /sp.specify)
└── tasks.md             # Phase 2: Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

**Selected Structure**: Single project (CLI application)

```text
todo-app/                   # Repository root
├── main.py                 # Application entry point
├── src/                    # Source code
│   ├── __init__.py
│   ├── models/             # Data models (entities)
│   │   ├── __init__.py
│   │   └── task.py         # Task dataclass
│   ├── services/           # Business logic layer
│   │   ├── __init__.py
│   │   └── task_service.py # Task management (CRUD, validation)
│   └── cli/                # User interface layer
│       ├── __init__.py
│       └── menu.py         # Interactive menu and command handlers
├── tests/                  # Tests (optional per spec)
│   ├── __init__.py
│   └── unit/               # Unit tests for service layer
│       ├── __init__.py
│       └── test_task_service.py  # If tests are requested
├── specs/                  # Feature specifications
│   └── 001-todo-cli/       # This feature's documentation
├── .specify/               # Spec-Kit Plus framework
│   ├── memory/             # Project memory (constitution, etc.)
│   ├── templates/          # Document templates
│   └── scripts/            # Automation scripts
├── .claude/                # Claude Code configuration
│   └── commands/           # Custom slash commands
├── history/                # Prompt history records
│   └── prompts/            # PHR storage
├── README.md               # Setup and usage instructions
└── CLAUDE.md               # Claude Code interaction guide
```

**Structure Decision**:

Selected **Option 1: Single project** because:
- Single standalone CLI application (no web/mobile components)
- Simple architecture: models → services → CLI
- Minimal overhead, easy to navigate
- Aligns with clean architecture principles
- Supports separation of concerns across three layers

**Layer Responsibilities**:

1. **models/** - Data definitions only
   - `task.py`: Task dataclass with type hints
   - No business logic, no I/O

2. **services/** - Business logic and validation
   - `task_service.py`: Task storage, CRUD operations, validation
   - In-memory data structures (dict, counter)
   - Raises exceptions for errors
   - No user interface code

3. **cli/** - User interaction layer
   - `menu.py`: Display menus, parse input, call services, display results
   - Handles all I/O (input(), print())
   - Catches service exceptions, displays error messages
   - Main event loop

4. **main.py** - Entry point
   - Initializes and starts CLI loop
   - Minimal code (imports and execution)

## Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────┐
│              User (Terminal)                 │
└─────────────────┬───────────────────────────┘
                  │
                  │ Text I/O
                  ↓
┌─────────────────────────────────────────────┐
│            CLI Layer (cli/menu.py)           │
│  - Display menu & prompts                    │
│  - Parse user input                          │
│  - Format output                             │
│  - Handle errors                             │
└─────────────────┬───────────────────────────┘
                  │
                  │ Method calls
                  ↓
┌─────────────────────────────────────────────┐
│    Service Layer (services/task_service.py)  │
│  - In-memory storage (dict)                  │
│  - CRUD operations                           │
│  - Business validation                       │
│  - ID generation                             │
│  - Exception raising                         │
└─────────────────┬───────────────────────────┘
                  │
                  │ Uses
                  ↓
┌─────────────────────────────────────────────┐
│       Model Layer (models/task.py)           │
│  - Task dataclass                            │
│  - Type definitions                          │
└─────────────────────────────────────────────┘
```

### Data Flow

**Add Task Example**:
```
User input → CLI validates → Service validates → Service creates Task →
Service stores in dict → Service returns Task → CLI displays success
```

**View Tasks Example**:
```
User selects "View" → CLI calls service → Service returns all tasks →
CLI formats and displays → User sees task list
```

**Error Flow Example**:
```
User enters invalid ID → CLI calls service → Service raises TaskNotFoundError →
CLI catches exception → CLI displays error message → Returns to menu
```

### Module Interaction Rules

1. **CLI depends on Service** - CLI imports and calls service functions
2. **Service depends on Model** - Service imports Task dataclass
3. **Model is independent** - Models import nothing (except typing, dataclasses)
4. **No circular dependencies** - Unidirectional dependency flow
5. **Service never imports CLI** - Service has no knowledge of user interface
6. **Model never imports Service or CLI** - Model is pure data

### Execution Flow

**Program Startup**:
```
1. main.py execution begins
2. Import CLI module
3. Initialize CLI (creates menu instance)
4. CLI initializes service (creates task storage)
5. Display welcome message
6. Enter main event loop
```

**Main Event Loop** (in cli/menu.py):
```
while True:
    display_menu()
    user_choice = get_user_input()

    if user_choice == "6":  # Exit
        display_exit_message()
        break

    elif user_choice == "1":  # Add task
        handle_add_task()

    elif user_choice == "2":  # View tasks
        handle_view_tasks()

    # ... other commands ...

    else:
        display_invalid_command_error()
```

**Program Exit**:
```
1. User selects exit (command 6)
2. Display goodbye message
3. Break event loop
4. main.py exits
5. Python clears all in-memory data automatically
```

### State Management

**Storage Location**: Service layer (`services/task_service.py`)

**State Structure**:
```python
# Module-level state (in task_service.py)
_tasks: dict[int, Task] = {}       # Task storage
_next_task_id: int = 1             # ID counter
```

**State Transitions**:
- **Add**: `_tasks[_next_task_id] = new_task; _next_task_id += 1`
- **View**: Read from `_tasks.values()`
- **Update**: Modify `_tasks[task_id]` in place
- **Delete**: `del _tasks[task_id]`
- **Toggle**: Flip `_tasks[task_id].is_completed`
- **Exit**: State cleared automatically on program termination

**Concurrency**: Not applicable (single-threaded, single-user)

**Persistence**: None (in-memory only, cleared on exit)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - complexity tracking not needed. All constitutional principles are satisfied:
- Simple three-layer architecture
- Standard library only
- In-memory state management
- Clear separation of concerns
- No over-engineering

---

## Implementation Summary

### What Will Be Built

A Python 3.13+ command-line todo application with:
- **Interactive menu** for user interaction (not subcommand-based)
- **5 core operations**: Add, View, Update, Delete, Toggle status
- **In-memory storage** using Python dict (no persistence)
- **Clean 3-layer architecture**: Models → Services → CLI
- **Standard library only**: No external dependencies
- **Single session lifecycle**: Data cleared on exit

### Key Technical Decisions (from research.md)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CLI Pattern | Interactive menu loop | Session-based workflow |
| Storage | `dict[int, Task]` | O(1) ID lookup |
| ID Generation | Auto-increment counter | Simple, predictable |
| Validation | Layered (CLI + service) | Separation of concerns |
| Error Handling | Custom exceptions | Graceful failures |
| Module Structure | 3 layers | Clean architecture |

### Files to Implement

**Core Application** (4 files):
1. `main.py` - Entry point (~10 lines)
2. `src/models/task.py` - Task dataclass (~20 lines)
3. `src/services/task_service.py` - Business logic (~150 lines)
4. `src/cli/menu.py` - User interface (~250 lines)

**Supporting Files**:
- `src/__init__.py`, `src/models/__init__.py`, etc. (empty or minimal)
- `tests/unit/test_task_service.py` (optional, if tests requested)

**Documentation** (already created):
- `README.md` (setup and usage)
- `specs/001-todo-cli/` (all planning artifacts)

### Module Responsibilities Summary

**models/task.py**:
- Define Task dataclass with id, title, description, is_completed
- Type hints for all fields
- No business logic

**services/task_service.py**:
- Maintain in-memory task storage (`dict[int, Task]`)
- Provide CRUD functions: create_task, get_all_tasks, get_task_by_id, update_task, delete_task, toggle_status
- Validate inputs (title length, description length)
- Raise TaskNotFoundError for invalid IDs
- Raise ValidationError for invalid inputs

**cli/menu.py**:
- Display interactive menu
- Parse user commands (1-6)
- Handle each command: prompt user, call service, display results
- Catch and display service exceptions
- Main event loop (while True until exit)

**main.py**:
- Import and start CLI menu
- Minimal wrapper: `if __name__ == "__main__": cli.menu.run()`

### User Interaction Flow

```
$ python main.py

→ Display main menu (options 1-6)
→ User enters command
→ Execute command handler:
  - Prompt for inputs
  - Validate inputs
  - Call service
  - Display results or errors
→ Return to main menu
→ Repeat until user exits (command 6)
→ Display goodbye message
→ Program terminates
→ All data cleared
```

### Validation Rules Summary

**Title**:
- Required (non-empty after strip)
- Max 200 characters
- Validated at CLI and service layers

**Description**:
- Optional (empty allowed)
- Max 1000 characters
- Validated at service layer

**Task ID**:
- Must be positive integer
- Must exist in storage for operations
- Validated at service layer (raises TaskNotFoundError)

### Error Handling Strategy

**CLI Layer**:
- Catch service exceptions
- Display user-friendly messages
- Return to menu (never crash)

**Service Layer**:
- Raise TaskNotFoundError for invalid IDs
- Raise ValidationError for invalid inputs
- Return values on success

**User Experience**:
- All errors display clear messages
- User can retry operations
- Application never crashes
- Graceful degradation

---

## Constitution Re-Check (Post-Design)

*Final validation after Phase 1 design complete*

**Principle I: Spec-Driven Lifecycle** ✅ PASS
- Plan derived from validated spec.md
- All requirements traced to spec
- Ready for tasks.md generation

**Principle II: No Code Without Authorization** ✅ PASS
- No code written
- Plan documents what will be built
- Implementation awaits tasks.md

**Principle III: AI-Only Implementation** ✅ PASS
- Plan ready for /sp.implement execution
- No manual coding required

**Principle IV: Clarification Over Assumptions** ✅ PASS
- All uncertainties resolved in research.md
- No [NEEDS CLARIFICATION] markers remain
- Technical decisions justified

**Principle V: Clean Code Standards** ✅ PASS
- Architecture enforces separation of concerns
- Module responsibilities clearly defined
- SRP applied to all modules
- No code duplication anticipated

**Principle VI: Technology Stack Adherence** ✅ PASS
- Python 3.13+ (Hackathon II Phase I requirement)
- CLI only (per phase constraints)
- In-memory storage (per phase specification)
- No deviations from requirements

**Principle VII: State Management Discipline** ✅ PASS
- In-memory only (dict storage)
- No persistence
- State location documented (service layer)
- Cleared on exit per requirement

**Principle VIII: Traceability** ✅ PASS
- Plan maps to spec requirements
- Architecture documented with component diagram
- Data flow traced through all layers
- Ready for task mapping

**Principle IX: Mandatory Documentation** ✅ PASS
- README.md (to be created in tasks)
- CLAUDE.md (exists and updated)
- plan.md (this file)
- data-model.md (created)
- contracts/cli-commands.md (created)
- quickstart.md (created)

**Principle X: External Knowledge via Context7** ✅ PASS
- Context7 used for Python CLI best practices
- Standard library patterns validated
- No reliance on outdated knowledge

**FINAL GATE STATUS**: ✅ ALL CHECKS PASS - Ready for /sp.tasks

---

## Next Steps

1. **User Review**: Review and approve this implementation plan
2. **Generate Tasks**: Run `/sp.tasks` to create tasks.md with implementation tasks
3. **Implement**: Run `/sp.implement` to execute tasks and generate code
4. **Validate**: Test all user stories independently
5. **Deliver**: Demonstrate working CLI application

**Estimated Scope**: ~430 lines of Python code + documentation + tests (if requested)

**Readiness**: Plan complete, all artifacts generated, ready for task breakdown
