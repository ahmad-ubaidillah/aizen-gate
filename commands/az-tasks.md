# Aizen-Gate Playbook: az-tasks

## Overview

Break a feature's specification and architecture plan into atomic, sequenced Work Packages (WPs) in isolated markdown files with XML structured prompts.

## Actors

- **[SA] Scrum Master**: Routing, graph validation.
- **[DEV] Lead Developer**: Task granularity, dependency sequencing.

## Workflow

1. **Context Intake**: Review `aizen-gate/specs/{feature-slug}/spec.md` and `plan.md`.
2. **Task Decomposition**: Segment the feature into atomic WPs (1-2 days).
3. **Consistency Check**: Run `npx aizen-gate analyze` to ensure the task decomposition addresses all ACs in the spec and all milestones in the plan. Resolve any [DRIFT] or [ORPHAN] issues.
4. **Graph Definition**: Map dependencies (e.g., Auth before Routes).
5. **WP Generation**: Create `aizen-gate/specs/{feature-slug}/tasks/WPXX.md`.
6. **XML Structured Prompts**: The implementation prompt inside each WP MUST use XML tags to provide context and explicit instructions:
   ```xml
   <task type="implementation">
     <objective>...</objective>
     <files_to_touch>...</files_to_touch>
     <acceptance_criteria>...</acceptance_criteria>
     <context>...</context>
   </task>
   ```

## Exit Criteria

- `tasks/` directory contains `WP01.md`, `WP02.md`, etc.
- No circular dependencies exist.
- The `[SA]` notifies the user: 'Ready to implement. Run az-auto to begin parallel execution.'
