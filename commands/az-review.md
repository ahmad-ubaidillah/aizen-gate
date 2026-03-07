# Aizen-Gate Playbook: az-review

## Overview

A playbook for the `[QA]` persona to thoroughly review a Work Package prior to moving it to the `done` lane. Matches the rigorous PR approval mechanisms missing from older autonomous loop models.

## Actors

- **[QA] Quality Assurance**: Primary code review agent.
- **[SEC] Security**: Supplemental agent for critical paths (Optional).

## Workflow

1. **Lane Transition**: Identify the target WP and ensure it resides in the `review` lane.
2. **Context Synchronization**:
   - Read the WP's acceptance criteria from `aizen-gate/specs/{feature-slug}/tasks/{wpId}.md`.
   - Read the `aizen-gate/shared/constitution.md` for overarching rules.
3. **Execution Review**:
   - Navigate to the associated Git worktree (`.worktrees/{featureSlug}-{wpId}`).
   - Run tests if applicable (`npm test` or similar context).
   - Read the codebase changes visually to ensure they match architectural integrity (e.g. no rogue logic).
4. **Approval / Rejection Matrix**:
   - **Approve**: If all AC are met, transition the WP to `done` on the dashboard.
   - **Reject**: Add explicit feedback to the bottom of the WP markdown file and push it back to the `doing` lane for the DEV agent.

## Exit Criteria

- The implementation is robustly analyzed.
- The WP is either fully accepted (`done`) or returned to execution (`doing`) with concrete next steps.
