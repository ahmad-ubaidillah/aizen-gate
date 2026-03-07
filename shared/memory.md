# AIZEN-GATE PROJECT MEMORY

> Shared knowledge / decisions / context across all agents.

## Project Context

- **App Name**: Aizen-Gate Framework
- **Description**: Universal AI orchestrator for elite multi-agent development.
- **Target Audience**: Professional developers and AI engineers.
- **Tech Stack**: Node.js, Markdown-based State, MCP, Claude/GPT reasoning models.

## Architecture Decisions

- [2026-03-07] **Dogfooding Protocol**: Aizen-Gate will use its own shared-state architecture to manage its own development. (Decided by @SA)
- [2026-03-07] **MD-Native State**: All project state (board, memory, project, state) remains in Markdown for maximum transparency and LLM compatibility. (Decided by @ARCH)
- [2026-03-07] **CSV-Driven Design**: Using CSV files for large design data sets to avoid context bloat until specific styles are requested. (Decided by @DESIGN)

## High-Level Facts

- [2026-03-07] Current framework coverage is ~69%, target is 90%+. (Extracted by @BA)
- [2026-03-07] 11 specialized agent personas are already defined in agents/ directory. (Extracted by @SA)

## Blockers & Notes

- **Note**: Several skill directories are currently empty and need population to prevent "hallucination" of capabilities.
