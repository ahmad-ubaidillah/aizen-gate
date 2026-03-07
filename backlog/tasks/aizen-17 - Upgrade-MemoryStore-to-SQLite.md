---
id: AIZEN-17
title: Upgrade MemoryStore to SQLite
status: Done
assignee:
  - '@codex'
created_date: '2026-03-07 11:07'
updated_date: '2026-03-07 11:13'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace JSON-based memory with SQLite. Create schema: memories, vectors, waypoints, embed_logs tables. Auto-migrate existing memory-facts.json
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Unit test confirming CRUD on SQLite,Test that old JSON facts are imported
<!-- AC:END -->
