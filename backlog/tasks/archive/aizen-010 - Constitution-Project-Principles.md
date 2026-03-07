---
id: AIZEN-010
title: Constitution & Project Principles (za-constitution)
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-4
  - high
  - intelligence
dependencies: []
priority: High
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a project principles/constitution document that all agents reference before every decision. Provides consistency and governance across the entire pipeline. Inspired by Spec Kit and Spec Kitty's `/speckit.constitution` command.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `za-constitution` command creates/updates `shared/constitution.md` with project principles.
- [x] #2 Interactive interview flow: asks user about code quality standards, testing requirements, UX consistency, performance targets, security policies.
- [x] #3 All agent prompts (specify, research, plan, implement, review) prepend constitution as context.
- [x] #4 Constitution template includes: coding standards, architecture principles, testing requirements, security policies, UX guidelines, performance targets.
- [x] #5 Versioned — changes tracked with timestamps and author.
- [x] #6 Worktree symlinks to constitution (all WPs share same source of truth).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `commands/za-constitution.md` command definition with interview flow.
2. Create `templates/constitution-template.md` with structured sections.
3. Modify all agent prompts to load constitution as first context item.
4. Add constitution to worktree symlink setup in `worktree-manager.js`.
5. Add versioning (YAML frontmatter with version, date, changes).
6. Write tests for constitution creation, injection, and worktree sharing.
<!-- SECTION:PLAN:END -->
