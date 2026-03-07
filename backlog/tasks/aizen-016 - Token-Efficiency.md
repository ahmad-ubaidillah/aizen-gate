---
id: AIZEN-016
title: Token Saving & Efficiency System
status: In Progress
assignee:
  - "@codex"
  - "[SA] - Shield Architect"
created_date: "2026-03-07 17:15"
updated_date: "2026-03-07 17:15"
labels:
  - sprint-1
  - priority-1
  - optimization
  - cost-saving
dependencies: []
priority: High
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement a comprehensive token saving and efficiency system for Aizen Gate, drawing from Mem0 (semantic memory) and RTK (output filtering) research. This includes per-phase logic budgets, command output compression, semantic fact extraction, and model routing.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Token Budget System: Per-phase limits (spec: 4K, plan: 6K, WP: 3K) with enforcement in `token-budget.js`.
- [ ] #2 Output Filter Engine: RTK-inspired filtering for command results (git, npm, tests) in `output-filter.js`.
- [ ] #3 Semantic Memory Store: Mem0-style fact extraction and retrieval (ADD/UPDATE/NOOP) in `memory-store.js`.
- [ ] #4 Context Compactor: Upgraded `compress.js` with sliding windows and artifact summarization.
- [ ] #5 Enhanced Context Engine: Budget-enforced context assembly with priority-based trimming.
- [ ] #6 Model Router: Cost-aware escalation and phase-sensitive model selection.
- [ ] #7 Logic Optimizer Skill: SKILL.md for agents to apply efficiency patterns.
- [ ] #8 Token Report CLI: `npx aizen-gate token-report` for usage analytics and savings display.

<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `scripts/token-budget.js` with estimation and enforcement logic.
2. Create `scripts/output-filter.js` with filtering strategies (stats, error-only, group).
3. Create `scripts/memory-store.js` for fact extraction and keyword-based retrieval.
4. Upgrade `scripts/compress.js` with distillation and artifact summarization.
5. Upgrade `scripts/context-engine.js` to integrate budget/filter/memory.
6. Upgrade `scripts/model-router.js` with model escalation and tracking.
7. Create `skills/optimization/token-efficiency/SKILL.md`.
8. Update `package.json` with reporting command and integrate all logic.
9. Write comprehensive tests for budget, filter, and memory store.

<!-- SECTION:PLAN:END -->
