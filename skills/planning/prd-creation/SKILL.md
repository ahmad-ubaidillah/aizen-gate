---
name: "PRD Creation & Alignment"
description: "A workflow for the Product Manager [PM] to turn a refined concept into a comprehensive PRD using industry-standard templates."
authors: ["Aizen-Gate Team"]
status: "production"
---

# PRD Creation Skill

Objective: Create a high-quality Product Requirements Document (PRD) from a refined idea or project concept.

## Roles Involved

- **[PM] Product Manager**: Primary author and stakeholder manager.
- **[BA] Analyst**: Provides data and research to support requirements.

## The Workflow

### Phase 1: Choosing a Template

1. **[PM]** Determines if a **Quick PRD** (mvp/single feature) or **Full PRD** (complex project) is needed.
   - Quick PRD: Uses `aizen-gate/templates/prd-quick.hbs`
   - Full PRD: Uses `aizen-gate/templates/prd-full.hbs`

### Phase 2: Drafting the PRD

2. **[PM]** Uses the **Groomed Idea** (from `shared/memory.md`) to populate the fields:
   - **Executive Summary**
   - **User Stories** (with Acceptance Criteria)
   - **Functional & Non-Functional Requirements**
   - **User Experience (UX) Goals**
   - **Milestones & Success Metrics**
3. **[BA]** Reviews the PRD for completeness and logical gaps.

### Phase 3: Review & Align

4. **[PM]** Presents the PRD to the team (Architect, Designer, etc.).
5. **[SA]** Triggers **Debate Mode** if there are major trade-offs or underspecified areas.
6. **[PM]** Finalizes the PRD and updates the **Shared Board** (`aizen-gate/shared/board.md`) with the planning phase completion.

## Output Criteria

- A structured, professional PRD file.
- Clear user stories with **Acceptance Criteria (AC)**.
- Alignment among all core agents on what is being built.
- All requirements documented in `aizen-gate/artifacts/planning/`.

## PRD Best Practices

- Keep it simple (YAGNI).
- Focus on outcomes over features.
- Define what is **Out of Scope** to prevent feature creep.
- Ensure every user story has clear, testable acceptance criteria.
