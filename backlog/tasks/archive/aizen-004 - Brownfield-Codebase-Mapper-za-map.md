---
id: AIZEN-004
title: Brownfield Codebase Mapper (za-map)
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-2
  - critical
  - context
dependencies: []
priority: Critical
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Enhance the existing `mapper.js` into a comprehensive brownfield codebase mapper that spawns parallel analysis sub-agents to understand existing codebases before any work begins. Cannot work on existing codebases without understanding current architecture, patterns, tech stack, and conventions. Inspired by GSD's `map-codebase` and Kiln's `Mnemosyne` with 5 parallel muse agents.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `za-map` command spawns 4-5 parallel analysis sub-agents: Architecture Analyst, Tech Stack Detective, Data Model Inspector, API Surface Scanner, Quality Auditor.
- [x] #2 Each sub-agent produces a focused analysis section in `shared/codebase-map.md`.
- [x] #3 Architecture analysis: identifies patterns (MVC, microservices, monolith, etc.), dependency graph, module boundaries.
- [x] #4 Tech stack detection: frameworks, languages, build tools, test runners, linters, CI/CD.
- [x] #5 Data model analysis: database schemas, ORMs, data flow, API contracts.
- [x] #6 Quality audit: test coverage estimation, linting status, known anti-patterns, dependency health.
- [x] #7 Output integrates into `za-specify` and `za-plan` as context — agents use codebase-map for informed decisions.
- [x] #8 Incremental re-scan: `za-map --update` only re-analyzes changed files since last scan.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Enhance `scripts/mapper.js` to support parallel sub-agent spawning.
2. Define 5 analysis dimensions with specific prompts and output schemas.
3. Create `commands/za-map.md` command definition.
4. Create `templates/codebase-map-template.md` for structured output.
5. Implement parallel execution with progress reporting.
6. Add codebase-map integration into `za-specify.md` and `za-plan.md` context loading.
7. Add incremental scan logic (git diff-based change detection).
8. Write tests for map generation and incremental updates.
<!-- SECTION:PLAN:END -->
