---
name: "az-build"
description: "Execute implementation tasks with the team."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Command: az-build

The implementation and development phase.

**[SA] Time to get build!** I'm calling in @developer and @designer.

## 1. Task Assignment (Via [SA] Bob)

- **[SA]** I'll assign the next atomic task from the **Scrum Board** (`aizen-gate/shared/board.md`).
- **[SA]** I'll pick the right agent and skill for the job.

## 2. Implementation & TDD (Via [DEV] Amelia)

- **[DEV]** Implementation of one atomic task at a time.
- **[DEV]** TDD first — no code without a test.
- **[DEV]** Reuse existing code over rebuilding.
- **[DEV]** Every change maps to specific Acceptance Criteria (AC).

## 3. UI/UX Implementation (Via [DESIGN] Sally)

- **[DESIGN]** I'll implement the UI as defined in the design system.
- **[DESIGN]** I'll identify and implement accessibility and responsive design.

## 4. Database Schema (Via [DB] Atlas)

- **[DB]** I'll implement the database schema from the Requirements.
- **[DB]** I'll generate migrations and optimize queries.

## 5. Continuous Review & Commit

- **[SA]** Each task's implementation will be reviewed by @qa and @architect.
- **[SA]** **Mandatory Atomic Git Commits** with the task ID in the message after EACH task.
- **[SA]** Use `az-pause` if you need to switch tasks or take a break.

---

**[SA] Ready when you are!** What task should we tackle next?
