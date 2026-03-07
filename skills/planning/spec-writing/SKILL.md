---
name: spec-writing
description: "You MUST use this for structured, spec-driven development. It provides a workflow to go from a Pro-PRD to a formal Specification before planning."
---

# Skill: Spec-Driven Development (OpenSpec)

## Overview

Spec-driven development ensures that the "What" and "How" are locked before any code is written. It prevents scope creep and ensures architectural consistency.

## Process Flow: Propose → Specify → Validate

### 1. Proposal Layer

- Review the **PRD** and **Architecture Overview**.
- Identify the core entities, API endpoints, and user flows.
- Use `templates/requirements.md` to document the "Active" scope.

### 2. Specification Layer

- Create a formal `SPEC.md` or updated `PROJECT.md`.
- Detail the **Data Models**, **Interface Definitions**, and **Edge Cases**.
- Use the **Athena 7-Dimension Gate** (see `quality-gate` skill) to verify the spec.

### 3. Artifact Generation

- Create/Update the **Shared State** files (`shared/project.md`, `shared/state.md`).
- Ensure the **Scrum Board** (`shared/board.md`) is synced with the spec milestones.

## Output Templates

- `templates/requirements.md`: For deep requirement extraction.
- `templates/discovery.md`: For brownfield or complex discovery phase.
- `templates/milestone.md`: For high-level roadmap locking.

---

**[SA] Spec writing active.** Clarity is the foundation of execution.
