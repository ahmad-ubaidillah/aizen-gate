---
id: AIZEN-007
title: User Acceptance Testing (za-verify)
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
  - AIZEN-005
priority: High
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement a formal user acceptance testing step that walks humans through testable deliverables and auto-diagnoses failures. Currently, there's no structured human verification before merge. Inspired by GSD's `verify-work` and Spec Kitty's `accept` command.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `za-verify` extracts testable deliverables from all completed WPs (user stories, acceptance criteria, API endpoints, UI screens).
- [x] #2 Presents each deliverable to user interactively: pass ✅ / fail ❌ / skip ⏭️.
- [x] #3 On failure: user describes the issue → agent spawns debug sub-agent to auto-diagnose.
- [x] #4 Auto-diagnosis produces a fix plan with specific code changes.
- [x] #5 Option to auto-fix and re-verify, or create a new WP for the fix.
- [x] #6 Verification results logged in `shared/verification-report.md`.
- [x] #7 Dashboard shows verification status (verified/unverified/failed) per feature.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `commands/za-verify.md` command definition.
2. Implement deliverable extractor: parse completed WPs for acceptance criteria and user stories.
3. Build interactive verification UI (terminal-based with inquirer prompts).
4. Implement auto-diagnosis flow: spawn debug sub-agent with failure context.
5. Create fix plan generator from diagnostic output.
6. Add verification report template and logging.
7. Update dashboard to show verification status.
8. Write tests for extraction, diagnosis, and report generation.
<!-- SECTION:PLAN:END -->
