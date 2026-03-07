---
id: AIZEN-003
title: Context Engineering & Token Optimization Module
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

Implement context engineering to prevent context rot — the #1 cause of quality degradation in long-running AI sessions. Currently, accumulated context pollutes agent responses over time. Inspired by GSD's fresh 200k context windows per plan and XML prompt formatting that keeps instructions precise.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Artifact size limits enforced: spec ≤4k tokens, plan ≤6k tokens, per-WP prompt ≤3k tokens — excess is summarized.
- [x] #2 Fresh subagent context per WP execution — each WP gets a clean context window with only relevant artifacts loaded.
- [x] #3 XML prompt formatting for all WP instructions — structured tags prevent misinterpretation.
- [x] #4 Context budget tracker in `shared/state.md` — shows token usage per artifact and remaining budget.
- [x] #5 Automatic context pruning: when approaching limits, older/less-relevant context is summarized and archived.
- [x] #6 Context loading priority: constitution > spec > plan > current-WP > decisions > patterns (configurable order).
- [x] #7 Smoke test: run a 10-WP feature and verify no quality degradation between WP1 and WP10.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `scripts/context-engine.js` — token counting (tiktoken or heuristic), budget tracking, pruning logic.
2. Define artifact size limits in `module.yaml` under `context.limits`.
3. Add XML prompt formatter utility — wraps WP instructions in structured `<task>`, `<context>`, `<constraints>` tags.
4. Modify `auto-loop.js` to construct fresh context per WP (load only relevant artifacts).
5. Implement context loading priority resolver.
6. Add pruning/summarization for over-budget artifacts.
7. Add context budget display to state.md and dashboard.
8. Write integration tests verifying isolated context per WP.
<!-- SECTION:PLAN:END -->
