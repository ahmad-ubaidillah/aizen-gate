---
id: AIZEN-012
title: Design System Intelligence
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-5
  - medium
  - design
dependencies: []
priority: Medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Integrate a design system intelligence engine that generates industry-specific design recommendations (styles, colors, typography, patterns) based on project type. Elevates UI output quality dramatically. Inspired by UI UX Pro Max's 100 reasoning rules, 67 UI styles, 96 color palettes, and BM25 ranking for style matching.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Industry-specific design reasoning rules (minimum 50 product categories).
- [x] #2 Style recommendations per product type with ranked relevance scoring.
- [x] #3 Color palette selection with industry-appropriate moods and contrast compliance (WCAG AA).
- [x] #4 Typography pairing recommendations with Google Fonts imports.
- [x] #5 Anti-pattern detection per industry (e.g., no neon colors for banking apps).
- [x] #6 Persist design system to `shared/design-system.md` for session continuity.
- [x] #7 Integrate into `za-implement` — agents reference design system during UI work.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `skills/ui-ux/design-intelligence/SKILL.md` with reasoning rules.
2. Build reasoning rule database (JSON) for 50+ product categories.
3. Implement style matcher with relevance scoring.
4. Create color palette and typography pairing databases.
5. Implement anti-pattern detector.
6. Add design system persistence and loading.
7. Integrate into implement command context loading.
8. Write tests for reasoning, matching, and anti-pattern detection.
<!-- SECTION:PLAN:END -->
