# AIZEN-GATE SCRUM BOARD

> Single source of truth for task status.

## Current Sprint: Phase 6 - Extensibility & CI/CD

Due: 2026-03-09

| ID        | Task                  | User Story                                                            | Agent | Files     | Status  | Expectation                               |
| :-------- | :-------------------- | :-------------------------------------------------------------------- | :---- | :-------- | :------ | :---------------------------------------- |
| **T-015** | Plugin Registry Core  | As a dev, I want to fetch and install community skills dynamically.   | @OPS  | `src/`    | ⬜ Todo | `az-skill install` command is functional. |
| **T-016** | Slash Commands Integ. | As a user, I want IDE-native slash commands linked to core scripts.   | @SA   | `config/` | ⬜ Todo | Commands in `.cursorrules` / `CLAUDE.md`. |
| **T-017** | Agent Evaluation Sys. | As a manager, I need to evaluate agent adherence to skill guidelines. | @QA   | `src/`    | ⬜ Todo | `az-benchmark` logic measures compliance. |

---

## Completed Tasks

| ID        | Task               | Completed By | Date       | Review Result          |
| :-------- | :----------------- | :----------- | :--------- | :--------------------- |
| T-001-008 | Enhancement Sprint | Aizen-Gate   | 2026-03-07 | ✓ P1-P3 Foundation     |
| T-009     | Habitat Cleanup    | Aizen-Gate   | 2026-03-07 | ✓ Workspace simplified |
| T-010     | CLI Bridge         | Aizen-Gate   | 2026-03-07 | ✓ npx command ready    |
| T-012-014 | Phase 5 Completion | Aizen-Gate   | 2026-03-07 | ✓ Docs, Mapping, NLP   |
| T-015-017 | Phase 6 Extensib.  | Aizen-Gate   | 2026-03-07 | ✓ Plugins, QA Bench, / |

## Backlog

- [x] Fetch skills from `antigravity-awesome-skills` generic repo pattern (T-015)
- [x] Implement local benchmarks parsing mock board/project states (T-017)
- [x] Auto-inject `.cursorrules` slashed parameters (T-016)
