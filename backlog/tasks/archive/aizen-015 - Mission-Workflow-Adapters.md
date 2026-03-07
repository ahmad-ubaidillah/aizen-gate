---
id: AIZEN-015
title: Mission & Workflow Adapters
status: Done
assignee:
  - '[SA] - Shield Architect'
created_date: '2026-03-07 16:22'
updated_date: '2026-03-07 09:39'
labels:
  - sprint-5
  - medium
  - design
dependencies:
  - AIZEN-010
priority: Medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Support multiple mission types that customize which phases are active, which templates are used, and which validation rules apply. A one-size-fits-all workflow is too rigid for different project types. Inspired by Spec Kitty's mission system (software-dev, research) that adapts workflows per use case.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Support mission types: `software-dev` (default), `research`, `writing`, `data-pipeline`.
- [x] #2 Each mission customizes: active phases, templates, validation rules, path conventions, agent selection.
- [x] #3 `software-dev`: full 8-phase pipeline, TDD optional, standard templates.
- [x] #4 `research`: specify → research → analyze → synthesize → report (skip plan/tasks/auto/implement).
- [x] #5 `writing`: outline → draft → review → edit → publish (custom phases).
- [x] #6 `data-pipeline`: schema → extract → transform → validate → deploy (custom phases).
- [x] #7 Switch mission via `za-config --mission research` (reconfigures active phases).
- [x] #8 Mission definitions stored in `missions/` directory as YAML files.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `missions/` directory with mission YAML schema.
2. Define 4 built-in missions: software-dev, research, writing, data-pipeline.
3. Implement mission loader in `scripts/mission-manager.js`.
4. Modify CLI command runner to check active mission and skip/enable phases accordingly.
5. Add mission-specific templates to `templates/missions/`.
6. Add mission switching to `za-config` or `module.yaml`.
7. Update dashboard to show active mission and available phases.
8. Write tests for mission loading, phase filtering, and switching.
<!-- SECTION:PLAN:END -->
