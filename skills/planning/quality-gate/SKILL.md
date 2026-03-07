---
name: quality-gate
description: "You MUST use this to validate any plan, PRD, or major architectural decision before proceeding. Derived from the Athena 7-Dimension Gate, it ensures 100% clarity and logic."
---

# Quality Gate: The Athena 7-Dimension Review

## Overview

Before any execution, the Scrum Master or Architect must pass the current artifacts through this "Quality Gate." If any dimension fails, the plan must be revised.

## The 7 Dimensions

1. **Clarity**: Is the objective precisely defined? (Pass if: A 5-year-old can understand the "What" and "Why").
2. **Completeness**: Are all requirements covered? (Pass if: No "To-be-determined" or "Placeholder" items remain).
3. **Consistency**: Does the plan align with existing architecture and patterns? (Pass if: No contradictions with `shared/memory.md`).
4. **Feasibility**: Can this be built with the current stack and tools? (Pass if: No magical thinking or "Assume X exists").
5. **Efficiency**: Is this the simplest way to achieve the goal? (Pass if: YAGNI - no unnecessary complexity).
6. **Verifiability**: Is every task testable? (Pass if: Every story has explicit, objective Acceptance Criteria).
7. **Risk**: Are the "known unknowns" identified? (Pass if: Error handling and edge cases are explicitly mentioned).

## Process Flow

1. **Present Artifact**: Show the Plan or PRD.
2. **Score**: Rate EACH of the 7 dimensions from 1-10.
3. **Gate Verdict**:
   - **PASS**: Average score > 8.0, no single dimension < 7.0.
   - **REVISE**: Average score < 8.0 or any dimension < 7.0.
4. **Feedback**: If REVISE, provide specific, actionable items for each failing dimension.

## Implementation: The "Adversarial Check"

Invite another agent (e.g., @architect or @qa) to perform a "Peer Review" as part of the gate. This ensures dual-verification.

---

**[SA] Quality Gate passed.** The plan is robust and ready for execution.
