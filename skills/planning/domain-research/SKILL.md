---
name: domain-research
description: "You MUST use this for any project with a high degree of technical or domain complexity. It performs parallel research into stack, architecture, pitfalls, and competitors."
---

# Domain Research: Multi-Phase Discovery

## Overview

Before creating a PRD or Plan, the team should perform deep research to avoid common pitfalls and leverage best-in-class patterns.

## The 4 Pillars of Research

1. **Stack & Tooling**:
   - Identify the most efficient libraries and frameworks for the task.
   - Check for recent breaking changes or deprecations.
2. **Architecture & Patterns**:
   - Look for standard ways to solve this specific problem (e.g., Auth, Caching, State).
   - Trace existing code to see if current patterns can be extended.
3. **Pitfalls & Anti-Patterns**:
   - Google/Search for "common mistakes when building [X]".
   - Check documentation for "Best Practices".
4. **Competitors & Inspiration**:
   - How do other tools (like the 16 repositories we analyzed) handle this?
   - What features make their solution "premium"?

## Process Flow

1. **Identify Unseen Complexity**: If the user asks for something like "real-time sync" or "AI-driven mapping", flag it as high-research.
2. **Spawn Researchers**: In your mental model, act as 4 parallel researchers.
3. **Consolidate**: Synthesize the findings into `shared/research.md` (use the `research.md` template).
4. **Inform the PRD**: Use the research to set constraints and define "Success Criteria" in the PRD.

## Techniques: The 16-Tool Audit

Always ask: "How would the 16 repositories we analyzed handle this?"

- **rtk**: Can we optimize tokens here?
- **GSD**: Are we creating too much context?
- **Kiln**: Do we need an adversarial review?
- **Bmalph**: Can this be automated?

---

**[SA] Research complete.** We've identified the best path forward and avoided 3 major pitfalls.
