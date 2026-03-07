---
name: "az-standards"
description: "Discover, extract, and deploy project coding standards and conventions."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Command: az-standards

The standards enforcement and discovery phase.

**[SA] Time to align on standards!** I'm calling in @architect and @analyst.

## 1. Standards Discovery (Via [ARCH] Winston)

- **[ARCH] Winston** scans the codebase to extract:
  - **Naming Conventions**: Variables, files, functions, and classes.
  - **Code Style**: Indentation, spacing, and formatting.
  - **Patterns**: Recurring architectural or logic patterns.

## 2. Extraction & Policy Generation (Via [ANALYST] Sigma)

- **[ANALYST] Sigma** generates the "Law of the Land":
  - **Shared Memory Update**: Moving extracted rules into `shared/memory.md`.
  - **Guideline Documentation**: Creating or updating `docs/CONTRIBUTING.md`.
  - **Anti-Pattern Guardrails**: Identifying what NOT to do based on codebase history.

## 3. Deployment & Enforcement (Via [SA] Bob)

- **[SA] Bob** ensures team alignment:
  - Updates each agent's local memory with the relevant standards.
  - Configures current implementation skills to follow these rules.
  - Verifies that any new code matches the "DNA" of the project.

---

**[SA] Standards synchronized.** Every agent is now aligned with the codebase's conventions.
