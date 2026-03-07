---
name: "za-discuss"
description: "A pre-planning dialogue phase to capture nuanced user preferences and architectural desires."
authors: ["Aizen-Gate Team"]
status: "beta"
---

# Command: za-discuss

The pre-planning dialogue and preference capture phase.

**[SA] Let's chat before we plan!** I'm calling in @pm and @architect.

## 1. Requirement Deep Dive (Via [PM] John)

- **[PM] John** asks for your thoughts on:
  - **Constraints**: What are the non-negotiable boundaries?
  - **Success Criteria**: What does "Perfect" look like?
  - **Future Scope**: What are the "Maybe Later" items?

## 2. Arch & Style Selection (Via [ARCH] Winston)

- **[ARCH] Winston** presents options for:
  - **Architectural Style**: Monolith, Micro-services, Event-driven?
  - **Tech Choices**: Libraries, patterns, and conventions.
  - **Quality Gates**: How strictly should we enforce TDD/Linting?

## 3. Discussion Digest (Via [SA] Bob)

- **[SA] Bob** summarizes the conversation:
  - Updates **Shared Memory** (`shared/memory.md`) with your specific preferences.
  - Refines the **PRD** if necessary.
  - Provides a "Consensus Checklist" that @plan will follow.

---

**[SA] Discussion captured!** We have 3 new architectural preferences and 2 key success criteria. Ready to move into @plan?
