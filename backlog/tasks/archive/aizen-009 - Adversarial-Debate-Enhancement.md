---
id: AIZEN-009
title: Adversarial Debate Enhancement
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-4
  - high
  - intelligence
dependencies:
  - AIZEN-008
priority: High
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Enhance the existing debate engine with structured adversarial roles: moderator, synthesizer, and validator. Current debate lacks structured adversarial rigor. Inspired by Kiln's Confucius vs Sun Tzu → Socrates moderator → Plato synthesizer → Athena validator pipeline.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Add moderator role (`Socrates`) to `debate-engine.js` — guides debate, identifies unresolved tensions, forces specificity.
- [x] #2 Add synthesizer role (`Plato`) — merges opposing positions into coherent resolution after debate rounds.
- [x] #3 Add validator role (extends existing `Athena`) — 7-dimension quality check on synthesized output (feasibility, scalability, security, testability, maintainability, performance, UX).
- [x] #4 Configurable debate rounds (default: 2 rounds of back-and-forth, then synthesis).
- [x] #5 Retry loop: if validator rejects, retry synthesis once (max 2 total attempts) before escalating to user.
- [x] #6 Debate transcript saved to `shared/debates/debate-{timestamp}.md`.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Refactor `debate-engine.js` to support pluggable roles (moderator, synthesizer, validator).
2. Create moderator prompt template (Socratic questioning, tension identification).
3. Create synthesizer prompt template (merge opposing views with trade-off analysis).
4. Extend Athena validator with 7-dimension scoring.
5. Add configurable round count and retry logic.
6. Save debate transcripts to `shared/debates/`.
7. Write tests for debate flow, synthesis quality, and validation scoring.
<!-- SECTION:PLAN:END -->
