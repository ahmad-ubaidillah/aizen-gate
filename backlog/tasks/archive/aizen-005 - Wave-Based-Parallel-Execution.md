---
id: AIZEN-005
title: Wave-Based Parallel Execution
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-3
  - high
  - execution
dependencies:
  - AIZEN-001
priority: High
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Enhance `auto-loop.js` to group WPs into dependency-aware waves for intelligent parallel execution. Currently, worktrees enable parallelism but lack intelligent dependency-aware wave grouping. Inspired by GSD's wave execution and Spec Kitty's worktree-per-WP model.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Wave grouping algorithm: topologically sort WPs, group into waves where Wave N has no dependencies on other Wave N items.
- [x] #2 Wave 1: all WPs with zero dependencies execute in parallel.
- [x] #3 Wave 2+: WPs depending only on completed waves execute in parallel.
- [x] #4 Sequential execution between waves, parallel within waves.
- [x] #5 Dashboard shows wave progress (wave 1/3 complete, wave 2/3 in progress, etc.).
- [x] #6 Wave failure handling: if a WP in Wave N fails, dependent WPs in Wave N+1 are marked "blocked".
- [x] #7 Configurable max concurrent worktrees per wave (prevent resource exhaustion).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Enhance `dependency-graph.js` to output wave groupings from topological sort.
2. Modify `auto-loop.js` to execute wave-by-wave instead of sequential WP-by-WP.
3. Add concurrent worktree limit configuration to `module.yaml`.
4. Add wave progress tracking to `shared/state.md`.
5. Update dashboard to visualize wave progress.
6. Add blocked-WP handling when upstream wave items fail.
7. Write tests for wave grouping algorithm and failure cascading.
<!-- SECTION:PLAN:END -->
