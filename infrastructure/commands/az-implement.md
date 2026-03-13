# Aizen-Gate Playbook: az-implement

## Overview

Implement a specific Work Package in an isolated parallel work environment (git worktree).

## Actors

- **[DEV] Lead Developer**: Primary implementer
- **[QA] Quality Assurance**: Double checks implementation

## Workflow

1. **Target Evaluation**: If the user didn't specify a WP ID, review the dashboard/tasks to find the next available `planned` WP where all dependencies are `done`.
2. **Worktree Initialization**: Ensure you are in the isolated git worktree created for this WP (e.g., `.worktrees/001-feature-WP01`). If not, the `[SA]` should have created one via `az-auto` or `WorktreeManager`.
3. **Requirement Gathering**:
   - Read `aizen-gate/specs/{feature-slug}/tasks/{wpId}.md`.
   - Read the main `spec.md` for broader context.
4. **Code Execution**:
   - Follow the implementation prompt within the WP file.
   - Employ TDD (Test-Driven Development) if appropriate.
   - Run local tests to ensure no regressions.
5. **Pre-Review Checklist**:
   - Have all acceptance criteria in the WP file been met?
   - Is the code format standard?
   - Are there any hardcoded secrets? (Check DEV-06).
6. **Atomic Commitment**:
   - Stage all changes: `git add .`.
   - Commit with WP-trace message: `git commit -m "{wpId} - completed implementation of {title}"`.
7. **Lane Transition**: Move the WP from `doing` to `review` when complete by updating the frontmatter in the WP file or using the dashboard API.

## Exit Criteria

- Code is fully implemented within the isolated worktree.
- Local tests pass.
- WP lane is updated to `review`.
- The `[QA]` agent is queued for the review phase.
