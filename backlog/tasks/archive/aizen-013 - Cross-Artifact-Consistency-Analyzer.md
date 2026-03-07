---
id: AIZEN-013
title: Cross-Artifact Consistency Analyzer (za-analyze)
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

Implement automated cross-artifact consistency verification to detect drift between spec, plan, and tasks. Requirements can get lost or mutate as they flow through the pipeline. Inspired by Spec Kit and Spec Kitty's `/speckit.analyze` command.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `za-analyze` compares spec.md ↔ plan.md ↔ WPs for requirement coverage.
- [x] #2 Detects orphaned requirements (in spec but not planned or tasked).
- [x] #3 Detects orphaned implementations (in WP but not traced to spec requirement).
- [x] #4 Detects scope creep (WPs that add functionality not in spec).
- [x] #5 Generates coverage report in `shared/analysis-report.md` with gap matrix.
- [x] #6 Severity levels: critical (missing security req), warning (missing feature), info (style drift).
- [x] #7 Can be run at any phase — recommended before `za-auto` and before `za-merge`.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `commands/za-analyze.md` command definition.
2. Build requirement extractor: parse spec for user stories, acceptance criteria, NFRs.
3. Build plan extractor: parse plan for planned components and technical decisions.
4. Build WP extractor: parse WPs for implementation scope.
5. Implement coverage matrix generator (spec → plan → WP mapping).
6. Add orphan and scope creep detection.
7. Create analysis report template with severity classification.
8. Write tests for extraction, mapping, and detection logic.
<!-- SECTION:PLAN:END -->
