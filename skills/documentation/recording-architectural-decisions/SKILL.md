---
name: recording-architectural-decisions
description: "You MUST use this whenever a significant technical or design decision is made. Ensures the project's 'Why' is documented for future developers and agents."
---

# 📜 ADR: Architectural Decision Records

## Overview

As projects evolve, the "Why" behind a decision (e.g., "Why chose Prisma over Drizzle?") is often lost. This skill enforces the creation of ADR files in `shared/decisions/`.

## The ADR Format (v1.0)

Every ADR file should follow this structure:

1. **Title**: `ADR-XXX: <Short Title>`
2. **Status**: Draft, Accepted, Superseded, or Rejected.
3. **Context**: What is the problem? What are the constraints?
4. **Decision**: What did we choose to do?
5. **Consequences (Pos/Neg)**: What are the trade-offs? What is the impact on complexity, cost, or performance?

## Process Flow

1. **Identify Decision**: When the team reaches consensus on a major trade-off (during `az-discuss` or `az-plan`).
2. **Draft the record**: Use the **[ARCH] Winston** agent to draft the ADR.
3. **Review**: Invite the **[SA] Scrum Master** and **[QA] Argus** to review for gaps.
4. **Finalize**: Save to `shared/decisions/YYYY-MM-DD-adr-xxx.md`.
5. **Update Memory**: Link the new ADR in `shared/memory.md`.

## Anti-Patterns

- **"Decision Dumping"**: Making decisions in chat and not documenting them.
- **"The Wall of Text"**: Making ADRs too long. Keep them crisp and decision-focused.

---

**[SA] Decision recorded.** The project's architecture is now self-documenting.
