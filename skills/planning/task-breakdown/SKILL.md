---
name: "Scrum Task Breakdown & Assignment"
description: "A workflow for the Scrum Master [SA] and Architect [ARCH] to turn a PRD into concrete, assigned tasks on the board."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Task Breakdown Skill

Objective: Create actionable, atomic tasks from a high-level PRD and assign them to the correct agents on the **Scrum Board** (`aizen-gate/shared/board.md`).

## Roles Involved

- **[SA] Scrum Master**: Orchestrates the breakdown and ensures all tasks have status, owners, and expectations.
- **[ARCH] Architect**: Provides technical decomposition and identifies dependencies.
- **[DESIGN] Designer**: Identifies UI tasks and design system needs.
- **[DB] Database Engineer**: Identifies data-related tasks.

## The Workflow

### Phase 1: Technical Decomposition

1. **[ARCH]** Breaks the PRD into **Epics** (major features) and **Stories** (specific user functionality).
2. **[SA]** Facilitates the **Task Breakdown** session for each story:
   - What needs to be built?
   - What needs to be tested?
   - What needs to be documented?
   - Are there any architectural or design dependencies?

### Phase 2: Board Assignment

3. **[SA]** Populates the **Scrum Board** (`aizen-gate/shared/board.md`):
   - Generates unique **Task IDs** (e.g., T-001, T-002).
   - Assigns each task to a specific agent (e.g., @dev, @design, @db).
   - Defines the **Acceptance Criteria (AC)** for each task.
   - Sets the **Expectation** (e.g., "Match design system", "100% test coverage").

### Phase 3: Validation

4. **[SA]** Ensures every task has a clear **Definition of Done (DoD)**.
5. **[SA]** Confirms that all tasks flow logically (no circular dependencies).
6. **[SA]** Notifies the team that the board is ready for implementation.

## Output Criteria

- A fully populated **Scrum Board** (`aizen-gate/shared/board.md`).
- Every task has an assigned **ID**, **Agent**, **Status**, and **Expectation**.
- All dependencies are clearly identified.
- The team is aligned on the sprint goals.

## Task Breakdown Best Practices

- Keep tasks small (can be completed in a few hours to a day).
- Use **atomic tasks** — each task should focus on one specific thing (e.g., "Create Login UI", "Implement OAuth Logic").
- Every task MUST have an expectation or Definition of Done.
- Avoid large "Implement Feature X" tasks — break them down by role (UI, Logic, DB, Security).
