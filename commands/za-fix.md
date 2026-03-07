# Aizen-Gate Playbook: za-fix (Quick Mode)

## Overview

Use this playbook for small bugs, documentation updates, or minor refactors that do not require the full 7-phase spec-driven pipeline. It bypasses `specify`, `research`, and `plan` for maximum velocity.

## Actors

- **[DEV] Lead Developer**: Core execution.
- **[QA] Quality Assurance**: Rapid verification.

## Workflow

1. **Intake**: Read the user's request. Identify the target file(s).
2. **Analysis**: Perform a quick `grep` or `find` to understand the impact.
3. **Execution**:
   - Apply the fix directly in the current branch (unless it's a major risk, then use a temporary worktree).
   - Use XML structured comments to explain the fix in the code if necessary.
4. **Smoke Test**: Run the most relevant test or verify visually.
5. **Memory Update**:
   - Briefly summarize the fix in `aizen-gate/shared/state.md`.
   - Update `aizen-gate/shared/board.md` to show a "Quick Fix" was completed.

## Quality Standards

- Maintain architectural integrity even for small fixes.
- Do not introduce tech debt for the sake of speed.
- If the fix touches more than 3 files or involves logic changes that could break the system, pivot to `za-specify` instead.

## Exit Criteria

- The bug is resolved or the small task is complete.
- The user is notified with a brief "Smoke Test" instruction.
- Workspace state is clean.
