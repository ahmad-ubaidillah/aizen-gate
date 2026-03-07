# Aizen-Gate Playbook: za-merge

## Overview

A playbook for the `[SA]` persona to finalize a feature by merging the approved feature branch (topologically) into the main trunk.

## Actors

- **[SA] Scrum Master**: Final merge approval and cleanup.
- **[DEV] Lead Developer**: Resolving merge conflicts.

## Workflow

1. **Intake**: Review `aizen-gate/specs/{feature-slug}/plan.md` and ensure all WPs in `tasks/` are in the `done` lane.
2. **Topological Merge**:
   - Identify the main branch (usually `main` or `master`).
   - For each WP branch (`{featureSlug}-{wpId}`):
     - Perform a `git checkout main`.
     - Perform a `git merge {branchName}`.
     - Resolve any conflicts as the [DEV] persona.
3. **Workspace Cleanup**:
   - For each WP branch merged, use `WorktreeManager` to remove the `.worktrees/` directory.
   - Delete the temporary WP branches from Git.
4. **Final Protocol**:
   - Run `npx aizen-gate archive` to distill the new knowledge into permanent memory.
   - Update `aizen-gate/shared/state.md` to reflect the feature completion.
   - Delete the feature spec directory `aizen-gate/specs/{feature-slug}` (or move it to `aizen-gate/specs/completed/`).

## Exit Criteria

- The feature code is merged and functional on the main branch.
- The workspace is clean and ready for the next feature.
- Long-term memory is updated via distillation.
