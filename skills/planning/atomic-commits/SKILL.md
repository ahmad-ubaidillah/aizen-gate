---
name: atomic-commits
description: "You MUST use this for all development work. It ensures a clean, bisectable history through semantic messages and single-task commits."
---

# Skill: Atomic & Semantic Git (The 100% Clarity Standard)

## Overview

High-performance teams use atomic commits to enable rollback, bisect, and automated changelogs. Every commit is a single "logical unit" of change.

## The Semantic Standard

Follow the **Conventional Commits** format: `<type>([scope]): <description>`

### 1. Common Types

- `feat`: A new feature (task/story).
- `fix`: A bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Maintenance, config, small fixes.
- `docs`: Documentation only changes.

### 2. Task ID Integration

- Every commit MUST include the **Scrum Board Task ID** (e.g., `T-001`).
- Example: `feat(api): T-001 - add user authentication endpoint`

### 3. Branching Strategy

- **Per-Task Branching**: `feat/task-001-login-flow`
- **Clean Merge**: Always rebase or Squash-Merge into the main/develop branch.

## Process Flow

1. **Verify**: Run tests and quality gates.
2. **Stage**: Add only the files relevant to the current task.
3. **Commit**: Use a semantic message with the Task ID.

---

**[SA] Commits standardized.** Our history is now as clean as our code.
