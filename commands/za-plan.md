# Aizen-Gate Playbook: za-plan

## Overview

Convert a defined specification into a technical architecture and implementation strategy.

## Actors

- **[SA] Scrum Master**: Conflict resolution and final decision making.
- **[ARCH] Architect**: System design, tech stack selection, and core patterns.
- **[DEV] Lead Developer**: Feasibility check, complexity analysis, and implementation strategy.

## Workflow

1. **Intake**: Review `aizen-gate/specs/{feature-slug}/spec.md`. IF `research.md` exists, you MUST read it.
2. **Tech Stack Selection**: Pick the best libraries and frameworks based on the project's `constitution.md`.
3. **Architecture Debate**:
   - `[ARCH]` proposes an architectural approach.
   - `[DEV]` identifies one potential complexity or constraint (Socratic push-back).
   - `[SA]` mediates the debate until a consensus is reached.
4. **Implementation Strategy**:
   - **Data Model**: SQL schema, state management structure, or API contracts.
   - **Core Flow**: Sequence diagrams or pseudo-code logic.
   - **Verification Strategy**: How will we test this? (Unit, E2E, manual).
5. **XML Structured Output**: Create `aizen-gate/specs/{feature-slug}/plan.md`. Use XML tags to wrap core technical decisions:
   ```xml
   <architecture>
     <stack>...</stack>
     <patterns>...</patterns>
     <data-contracts>...</data-contracts>
   </architecture>
   ```

## Exit Criteria

- A fully populated `plan.md` exists.
- The user is notified and prompted to run `za-tasks` to create work packages.
