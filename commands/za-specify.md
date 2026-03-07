# Aizen-Gate Playbook: za-specify

## Overview

Transform a raw user idea or problem statement into a formal, structured specification feature directory. This is the foundation of Spec-Driven Development.

## Actors

- **[SA] Scrum Master**: Routing and oversight.
- **[PM] Product Manager**: User interview, feature definition, user stories.

## Workflow

1. **Discovery Interview**: The `[PM]` agent MUST adopt a Socratic approach to interview the user. Ask at least 3-5 targeted questions to uncover:
   - **Primary Objective**: What problem are we solving?
   - **User Flow**: How will the user interact with the feature?
   - **Acceptable Outcomes**: What does success look like? (Acceptance Criteria)
   - **Technical Constraints**: Any existing code/libraries to leverage?
   - **Out of Scope**: What are we NOT building today?

2. **Directory Scaffold**: Once understood, pick a sequential ID and feature slug (e.g., `002-social-auth`). Create the directory:
   `aizen-gate/specs/{feature-slug}/`

3. **Generate spec.md**: Create `aizen-gate/specs/{feature-slug}/spec.md` with:
   - **Epic Summary**: Goal and high-level description.
   - **User Stories**: `As a [user], I want to [action], so that [benefit]`.
   - **Functional Requirements**: Explicit checklist of work.
   - **Non-Functional Requirements**: Performance, security, accessibility.
   - **Acceptance Criteria (AC)**: Testable bullet points.
   - **Research Needed**: Flag areas requiring `za-research`.

## Exit Criteria

- A fully populated `spec.md` exists in a new feature directory.
- The Scrum Master returns control to the user to either:
  a) Run `za-research` if there are architectural unknowns.
  b) Run `za-plan` if ready to commit to a tech stack.
