---
id: AIZEN-006
title: Quick Mode (za-quick)
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-3
  - high
  - execution
dependencies: []
priority: High
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add a quick mode that bypasses the full 8-phase pipeline for small tasks like bug fixes, config changes, and minor features. The full specify → research → plan → tasks → auto → implement → review → merge pipeline is overkill for a one-line bug fix. Inspired by GSD's `/gsd:quick` and Bmalph's `QS`/`QD` quick start/deploy commands.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `za-quick` command accepts a task description and executes directly with a single agent.
- [x] #2 Skips research, plan, and formal review phases — goes straight from description to implementation.
- [x] #3 Creates a lightweight tracking entry in `shared/quick/` (not full WP structure).
- [x] #4 Atomic git commit with descriptive message on completion.
- [x] #5 Optional `--with-test` flag to add a test for the change.
- [x] #6 Optional `--review` flag to add a lightweight code review before commit.
- [x] #7 Quick mode history logged in `shared/quick/history.md` for audit trail.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `commands/za-quick.md` command definition.
2. Implement lightweight planner that converts description to single implementation prompt.
3. Create `shared/quick/` directory structure and history tracking.
4. Add atomic commit logic (stage changes, commit with message).
5. Implement optional `--with-test` and `--review` flags.
6. Add quick mode entry to dashboard sidebar.
7. Write tests for quick flow, commit generation, and history logging.
<!-- SECTION:PLAN:END -->
