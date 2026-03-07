---
name: codebase-mapping
description: "You MUST use this for any existing (brownfield) codebase. It provides a structured approach to analyzing architecture, stack, patterns, and state before any modification."
---

# Codebase Mapping & Brownfield Discovery

## Overview

When entering an existing project, the most common failure is making assumptions based on a shallow scan. This skill ensures a deep, multi-layer analysis that populates Aizen-Gate's shared memory.

## Multi-Layer Analysis

Perform these 5 scans in order:

1. **Layer 1: The Stack** (Scan `package.json`, `requirements.txt`, `go.mod`, etc.)
   - Languages and core frameworks.
   - Database and major infrastructure dependencies (ORM, Auth, CI/CD).
   - Tooling and project-specific CLI commands.

2. **Layer 2: The Structure** (Scan `.`, `src/`, `lib/`, `tests/`)
   - Architecture: MVC, Clean, Hexagonal, or Monolith?
   - Entry points: Main files, routes, or server initialization.
   - Test patterns: Unit, integration, E2E structure.

3. **Layer 3: The Data** (Scan `/models`, `/db`, `/schema`)
   - Core entities and their relationships.
   - Persistence layer and migration strategy.

4. **Layer 4: The Logic** (Scan core services or domain logic)
   - How business rules are enforced.
   - Error handling and logging patterns.

5. **Layer 5: The Quality** (Scan `.eslintrc`, `tsconfig.json`, `tests/`)
   - Linting, typing, and architectural constraints.
   - Existing technical debt or known hotspots.

## Output Generation

The goal of this skill is to populate three files:

- **`shared/project.md`**: The definitive "What is this?" document.
- **`shared/memory.md`**: Patterns, conventions, and "How we do things here."
- **`shared/state.md`**: The current baseline for our sprint.

## Techniques: The 5 Muses (From Kiln)

When mapping, use these "muses" as mental models:

- **Mnemosyne (Memory)**: What has been done? (Check git history)
- **Aristotle (Logic)**: How does it work? (Trace a core flow)
- **Da Vinci (Design)**: How is it built? (Analyze components)
- **Athena (Quality)**: Is it done well? (Check tests/types)
- **Hermes (Communication)**: How do parts talk? (Trace APIs/events)

## Anti-Patterns

- **"Shallow Scan"**: Assuming a project is standard before checking.
- **"The Wall of Files"**: Dumping a list of files without context.
- **"Ignoring Git"**: Not checking the history for recent changes or patterns.

---

**[SA] Codebase mapped.** We now have a high-resolution understanding of the project's DNA.
