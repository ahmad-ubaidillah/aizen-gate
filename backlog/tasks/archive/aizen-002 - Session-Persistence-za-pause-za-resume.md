---
id: AIZEN-002
title: Session Persistence (za-pause / za-resume)
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

Implement session persistence so users can pause and resume work across sessions. Currently, all progress is lost when a session ends. Inspired by GSD's `pause-work`/`resume-work` with handoff documents and Kiln's `reset`/`resume` commands.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `za-pause` command serializes current state (active phase, current WP, completed WPs, pending WPs, decisions log, debate history) to `shared/handoff.md`.
- [x] #2 `za-resume` command reads `shared/handoff.md`, restores session state, and displays a "where we left off" summary.
- [x] #3 Handoff document is human-readable markdown with YAML frontmatter for machine-parseable fields.
- [x] #4 Auto-pause on session disconnect (if detectable) — writes handoff before termination.
- [x] #5 Resume validates handoff integrity (checks referenced files exist, WP states are consistent).
- [x] #6 Dashboard (`aizen-pulse`) shows "Paused" state with resume instructions.
- [x] #7 Works across different AI platforms (Claude, Gemini, Cursor, etc.).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `commands/za-pause.md` command definition with state serialization logic.
2. Create `commands/za-resume.md` command definition with state restoration logic.
3. Implement `scripts/session-manager.js` — serialize/deserialize active pipeline state.
4. Create `templates/handoff-template.md` for structured handoff documents.
5. Add auto-pause signal handler to `auto-loop.js` (SIGINT/SIGTERM).
6. Update dashboard to show paused state and resume CTA.
7. Add validation logic to resume flow (file existence, state consistency).
8. Write tests for pause/resume roundtrip.
<!-- SECTION:PLAN:END -->
