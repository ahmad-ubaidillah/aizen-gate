---
id: AIZEN-014
title: TDD Enforcement Mode
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

Add configurable Test-Driven Development enforcement that requires agents to write failing tests before implementation code. No enforcement of test-first discipline leads to under-tested code. Inspired by Superpowers' mandatory RED-GREEN-REFACTOR and Bmalph's Ralph TDD loop.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Configurable via `module.yaml`: `tdd: enabled/disabled/strict` (default: disabled).
- [x] #2 When `enabled`: agent is prompted to write tests first but can proceed without.
- [x] #3 When `strict`: agent MUST write a failing test, verify it fails, write code, verify it passes — enforced in WP prompts.
- [x] #4 RED → GREEN → REFACTOR cycle enforced in implement prompts.
- [x] #5 Test coverage check after each WP (configurable minimum, e.g., 80%).
- [x] #6 Review phase checks for test presence — WPs without tests flagged as warnings.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Add `tdd` config option to `module.yaml` schema.
2. Modify `za-implement.md` prompts to inject TDD instructions when enabled/strict.
3. Add RED-GREEN-REFACTOR cycle template for WP execution prompts.
4. Add test coverage checker (parse test runner output for coverage %).
5. Modify `za-review.md` to flag WPs without tests.
6. Write tests for TDD prompt injection and coverage checking.
<!-- SECTION:PLAN:END -->
