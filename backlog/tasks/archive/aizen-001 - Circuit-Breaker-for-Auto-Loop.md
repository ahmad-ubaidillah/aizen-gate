---
id: AIZEN-001
title: Circuit Breaker for Auto Loop
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-1
  - critical
  - safety
dependencies: []
priority: Critical
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add stagnation detection and circuit breaker safety to the autonomous execution loop (`auto-loop.js`). Currently, the `za-auto` command can get stuck in infinite failure loops when a WP repeatedly fails implementation. Inspired by Bmalph's Ralph circuit breaker and Kiln's Argus watchdog with 3-cycle correction limits.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Max retry counter per WP (configurable, default: 3 attempts) — loop stops after N consecutive failures on the same WP.
- [x] #2 Response analyzer detects repeating/stuck outputs (e.g., same error string >2 times) and triggers early circuit trip.
- [x] #3 Stagnation detection: if no file changes detected after a WP execution cycle, mark as "stalled".
- [x] #4 Graceful escalation to user when circuit trips — clear message with failure context, suggested actions, and option to skip/retry/abort.
- [x] #5 Circuit state persisted to `shared/circuit-state.json` so restarts don't reset counters.
- [x] #6 Configurable via `module.yaml`: `circuit_breaker.max_retries`, `circuit_breaker.stall_threshold_ms`.
- [x] #7 Unit tests covering: normal flow, retry exhaustion, stagnation detection, graceful escalation.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Add `CircuitBreaker` class to `scripts/circuit-breaker.js` with retry counting, response hashing, and stall detection.
2. Integrate into `auto-loop.js` main execution cycle — wrap each WP execution with circuit breaker checks.
3. Add response analyzer that hashes last N outputs and detects duplicates.
4. Add file-change detection (compare git status before/after WP execution).
5. Implement graceful escalation UI with `chalk` colored output and interactive prompts.
6. Add circuit state persistence to `shared/circuit-state.json`.
7. Add configuration schema to `module.yaml`.
8. Write comprehensive tests.
<!-- SECTION:PLAN:END -->
