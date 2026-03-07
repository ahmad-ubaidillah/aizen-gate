---
name: "az-map"
description: "Analyze an existing codebase (brownfield) to create a map of architecture, stack, and patterns."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Command: az-map

The discovery and codebase mapping phase. Essential for "brownfield" projects.

**[SA] Time to map the terrain!** I'm calling in @architect and @analyst.

## 1. Codebase Discovery (Via [ARCH] Winston)

- **[ARCH] Winston** will scan the directory to identify:
  - **Tech Stack**: Languages, frameworks, and tools.
  - **Architecture**: Core patterns (MVC, Layered, Hexagonal, etc.).
  - **Project Structure**: Main modules and their relationships.

## 2. Technical Analysis (Via [ANALYST] Sigma)

- **[ANALYST] Sigma** will analyze:
  - **Deep Dependencies**: Major libraries and their versions.
  - **Code Quality**: Hotspots, technical debt, and test coverage.
  - **API Surface**: Entry points, routes, and core interfaces.

## 3. Knowledge Generation (Via [SA] Bob)

- **[SA] Bob** will populate:
  - **Shared Memory** (`aizen-gate/shared/memory.md`): Extracting patterns and conventions.
  - **Project Summary** (`aizen-gate/shared/project.md`): A living document of the codebase.
  - **State** (`aizen-gate/shared/state.md`): Identifying the current baseline for development.

## 4. Requirement Extraction (Via [PM] Sarah)

- **[PM] Sarah** will identify:
  - **Existing Features**: What's already built.
  - **Gaps & Backlog**: What's missing from the current state.
  - **Roadmap Suggestions**: Potential next steps based on reality.

---

**[SA] The map is ready!** We now have a clear understanding of the project's DNA. Should we proceed to ideation or planning?
