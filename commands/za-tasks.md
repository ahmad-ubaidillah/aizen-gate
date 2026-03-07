# Aizen-Gate Playbook: za-tasks

## Overview

Break a feature's specification and architecture plan into atomic, sequenced Work Packages (WPs) in isolated markdown files with XML structured prompts.

## Actors

- **[SA] Scrum Master**: Routing, graph validation.
- **[DEV] Lead Developer**: Task granularity, dependency sequencing.

## Workflow

1. **Context Intake**: Review `aizen-gate/specs/{feature-slug}/spec.md` and `plan.md`.
2. **Task Decomposition**: Segment the feature into atomic WPs (1-2 days).
3. **Graph Definition**: Map dependencies (e.g., Auth before Routes).
4. **WP Generation**: Create `aizen-gate/specs/{feature-slug}/tasks/WPXX.md`.
5. **XML Structured Prompts**: The implementation prompt inside each WP MUST use XML tags to provide context and explicit instructions:
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
- The `[SA]` notifies the user: 'Ready to implement. Run za-auto to begin parallel execution.'
