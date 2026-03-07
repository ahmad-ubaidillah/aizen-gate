---
id: AIZEN-008
title: Multi-Model Orchestration
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

Support configurable multi-model routing that assigns different AI models to different pipeline phases. Different model families catch different blind spots — using Opus for reasoning, GPT for translation, Sonnet for implementation produces more robust output. Inspired by Kiln's multi-model orchestration (Opus + GPT-5.2 + GPT-5.3-codex across 3 families).

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Extend `profiles.yaml` to support model-family routing: specify model per phase (research, planning, debate, implementation, review).
- [x] #2 Model-family debate in planning: one model proposes, a different-family model critiques.
- [x] #3 Fallback logic: if configured model unavailable, gracefully fall back to alternative.
- [x] #4 Token cost tracking per model in `shared/state.md`.
- [x] #5 Preset profiles: "quality" (all high-end), "balanced" (mix), "budget" (all budget).
- [x] #6 Dashboard shows which model is handling each phase/WP.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Extend `profiles.yaml` schema with per-phase model configuration.
2. Create `scripts/model-router.js` — resolves model for given phase/task.
3. Add model-family debate mode to `debate-engine.js` (cross-family critique).
4. Implement fallback chain logic.
5. Add token cost tracking per model.
6. Create preset profile templates (quality, balanced, budget).
7. Update dashboard to display model assignments.
8. Write tests for routing, fallback, and cost tracking.
<!-- SECTION:PLAN:END -->
