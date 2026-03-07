---
name: "Idea Grooming & Concept Refinement"
description: "A guided workflow for the Analyst [BA] and PM [PM] to turn raw ideas into refined implementation-ready concepts."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Idea Grooming Skill

Objective: Take a raw user request and "groom" it until it is clear, feasible, and ready for a PRD.

## Roles Involved

- **[BA] Analyst**: Asks probing questions about market, users, and edge cases.
- **[PM] Product Manager**: Defines MVP scope, priorities, and success metrics.

## The Workflow

### Phase 1: Exploration

1. **[BA]** Gathers initial input.
2. **[BA]** Asks 3-5 high-impact questions focused on:
   - Target audience (Who is it for?)
   - Problem (What pain point are we solving?)
   - Core Features (What are the non-negotiables?)
   - Success (What does a win look like?)

### Phase 2: Refinement

3. **[PM]** Synthesizes the exploration into a draft concept.
4. **[PM]** Defines the **MVP (Minimum Viable Product)** scope.
5. **[PM]** Identifies potential risks or dependencies.

### Phase 3: Finalization

6. **[BA]** Documents the refined concept in the **Shared Memory** (`aizen-gate/shared/memory.md`).
7. **[PM]** Confirms readiness for the next step (PRD Creation).

## Output Criteria

- A clear, concise project summary.
- A list of core features for the MVP.
- Agreement on the target tech stack (if specified).
- Defined success metrics.
- All decisions logged in `shared/memory.md`.

## Discussion Guide (Example)

[BA] "That sounds like a great start! To help narrow it down: 1) Who is the primary persona using this? 2) Is this mobile-first or desktop?"
[PM] "Based on that, I suggest we focus on X first. Option Y could be a fast follow but let's keep the MVP lean."
