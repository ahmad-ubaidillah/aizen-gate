# Aizen-Gate Framework

## What This Is

Aizen-Gate is a universal AI development framework powered by a multi-agent scrum system. It provides 11 specialized agents, 48+ skills, and 19 commands to orchestrate the entire software development lifecycle (SDLC) through an elite agentic workflow.

## Core Value

Aizen-Gate transforms raw ideas into battle-hardened, production-ready code through autonomous multi-agent collaboration, high-end aesthetics, and rigorous quality gates.

## Requirements

### Validated

- [x] Multi-agent Scrum Architecture (11 specialized agents) — Phase 1
- [x] Identity Tagging Protocol (`[SA]`, `[DEV]`, etc.) — Phase 1
- [x] Command-driven workflow (19 core commands) — Phase 1
- [x] Skill-based extensible architecture (48+ skills) — Phase 1
- [x] Model Profile Selection (`profiles.yaml`) — Phase 1
- [x] Design Data System (11 CSVs for style intelligence) — Phase 1

### Active

- [ ] Turn Playbooks into Engines (Priority 1)
- [ ] Fill Structural Gaps (Priority 2)
- [ ] Advanced Capabilities - Token Opt & E2E (Priority 3)

### Out of Scope

- [ ] Integration with proprietary non-standard LLM APIs — Focus on standard MCP/OAI compatible models.

## Context

Aizen-Gate is designed for developers who want "premium" AI assistance that doesn't just write code but manages the entire project lifecycle with high-end editorial aesthetics and rigorous engineering standards.

## Constraints

- **Stack**: Node.js, Markdown-based state, MCP (Model Context Protocol).
- **Architecture**: Multi-agent Scrum with shared memory.
- **Standards**: TDD first, Big O awareness, zero secrets.

## Key Decisions

| Decision         | Rationale                                                | Outcome |
| ---------------- | -------------------------------------------------------- | ------- |
| Markdown State   | Human-readable, git-trackable, LLM-friendly.             | ✓ Good  |
| Identity Tagging | Clear persona separation in long threads.                | ✓ Good  |
| Skill-Based Dev  | Modular, reusable playbooks across agents.               | ✓ Good  |
| CSV for Design   | Large-scale style data without token bloat until needed. | ✓ Good  |

---

_Last updated: 2026-03-07 after Gap Analysis v2_
