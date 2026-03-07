# Aizen-Gate Playbook: az-auto

## Overview

Trigger the autonomous wave execution engine to pick the next set of available Work Packages (WPs) and assign them to subagents for isolated implementation.

## Actors

- **[SA] Scrum Master**: Orchestrator, health monitor, and circuit breaker.
- **[DEV] Lead Developer**: Core engine logic.

## Workflow

1. **Wave Identification**: `[SA]` runs the dependency graph analysis to find all `planned` WPs where dependencies are `done`.
2. **Circuit Breaker Check**: `[SA]` checks if the current wave has failed more than 3 times (infinite loop protection). If so, it pauses and alerts the user.
3. **Task Dispatch**:
   - For each WP in the wave, a fresh subagent task is generated.
   - **XML Consumption**: The subagent MUST read the `WPXX.md` file and look for the `<task>` block:
     ```xml
     <task type="implementation">
       <objective>...</objective>
       <files_to_touch>...</files_to_touch>
       <acceptance_criteria>...</acceptance_criteria>
       <context>...</context>
     </task>
     ```
4. **Execution**: The subagent implements the code in the isolated git worktree.
5. **Quality Gate**: Upon completion, the subagent triggers `az-review`.

## Exit Criteria

- A new wave of WPs is moved from `planned` to `doing`.
- Subagents are active in their respective worktrees.
- The Scrum board indicates active progress.
