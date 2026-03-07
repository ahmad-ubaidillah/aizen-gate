---
id: AIZEN-011
title: Living Docs & Cross-Phase Learning
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-4
  - medium
  - intelligence
dependencies:
  - AIZEN-010
priority: Medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Make the pipeline learn from itself by maintaining append-only living documents that capture decisions, pitfalls, and patterns across phases. Currently, each phase operates independently without benefiting from previous phases' insights. Inspired by Kiln's `decisions.md`, `pitfalls.md`, and `PATTERNS.md` that get appended each phase.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `shared/decisions.md` — append-only log of architecture decisions (what, why, trade-offs, alternatives rejected).
- [x] #2 `shared/pitfalls.md` — append-only log of failures, workarounds, and "don't do this" learnings.
- [x] #3 `shared/patterns.md` — append-only catalog of discovered coding patterns and conventions.
- [x] #4 Each phase's agent prompt loads relevant living docs as context before starting.
- [x] #5 Phase transitions auto-append a summary of that phase's key learnings.
- [x] #6 Living docs searchable by keyword/tag for quick reference.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create living doc templates with structured entry format (date, phase, category, content).
2. Modify each phase command to: (a) load relevant living docs, (b) append learnings on completion.
3. Create `scripts/living-docs.js` — append, search, and summarize utilities.
4. Add auto-summary generation at phase transitions.
5. Add tag-based search functionality.
6. Write tests for append semantics, search, and cross-phase loading.
<!-- SECTION:PLAN:END -->
