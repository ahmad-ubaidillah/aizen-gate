# TypeScript Migration Plan

> **Status:** Planning | **Target Version:** 3.0.0 | **Estimated Duration:** 8-12 sprints

## Executive Summary

This document outlines the comprehensive migration strategy from JavaScript to TypeScript for the Aizen-Gate project. The project already has TypeScript infrastructure in place (`tsconfig.json` with strict mode) and has begun partial migration in the `src/errors/` and `src/utils/` directories.

## Current State

### Already Migrated (5 files)
| File | Location |
|------|----------|
| BaseError | [`src/errors/base-error.ts`](src/errors/base-error.ts) |
| RuntimeError | [`src/errors/runtime-error.ts`](src/errors/runtime-error.ts) |
| TimeoutError | [`src/errors/timeout-error.ts`](src/errors/timeout-error.ts) |
| ValidationError | [`src/errors/validation-error.ts`](src/errors/validation-error.ts) |
| Retry Utility | [`src/utils/retry.ts`](src/utils/retry.ts) |

### Legacy JavaScript Files (73 files pending)

---

## Migration Priorities

### 🔴 Priority 1: Core Infrastructure (High Impact)
*Critical path files that other modules depend on*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 1 | CLI Entry | [`bin/cli.js`](bin/cli.js) | Low | commander, chalk |
| 2 | Core Commands | [`bin/commands/core.js`](bin/commands/core.js) | Medium | Multiple |
| 3 | Logger | [`src/utils/logger.js`](src/utils/logger.js) | Medium | winston |
| 4 | Error Handler | [`src/server/error-handler.js`](src/server/error-handler.js) | Low | express |
| 5 | API Server | [`src/server/api-server.js`](src/server/api-server.js) | Medium | express |
| 6 | MCP Server | [`src/server/mcp-server.js`](src/server/mcp-server.js) | High | @modelcontextprotocol/sdk |
| 7 | Plugin Manager | [`src/utils/plugin-manager.js`](src/utils/plugin-manager.js) | Medium | Dynamic loading |
| 8 | Metrics | [`src/utils/metrics.js`](src/utils/metrics.js) | Medium | Multiple |

### 🟠 Priority 2: Business Logic (Medium Impact)
*Core orchestration and AI modules*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 9 | Model Router | [`src/ai/model-router.js`](src/ai/model-router.js) | High | AI providers |
| 10 | Token Budget | [`src/ai/token-budget.js`](src/ai/token-budget.js) | High | Token counting |
| 11 | Output Filter | [`src/ai/output-filter.js`](src/ai/output-filter.js) | Medium | AI processing |
| 12 | Context Engine | [`src/memory/context-engine.js`](src/memory/context-engine.js) | High | Embeddings, DB |
| 13 | Memory Store | [`src/memory/memory-store.js`](src/memory/memory-store.js) | High | better-sqlite3 |
| 14 | Orchestrator API | [`src/orchestration/orchestrator-api.js`](src/orchestration/orchestrator-api.js) | Medium | API |
| 15 | Auto Loop | [`src/orchestration/auto-loop.js`](src/orchestration/auto-loop.js) | High | Agent execution |
| 16 | Circuit Breaker | [`src/orchestration/circuit-breaker.js`](src/orchestration/circuit-breaker.js) | Medium | State management |
| 17 | Dependency Graph | [`src/orchestration/dependency-graph.js`](src/orchestration/dependency-graph.js) | Medium | DAG operations |
| 18 | Worktree Manager | [`src/orchestration/worktree-manager.js`](src/orchestration/worktree-manager.js) | Medium | Git operations |

### 🟡 Priority 3: Supporting Services
*Utilities and secondary modules*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 19 | Retry (duplicate) | [`src/utils/retry.js`](src/utils/retry.js) | Low | (will remove .js) |
| 20 | Circuit Breaker Util | [`src/utils/circuit-breaker.js`](src/utils/circuit-breaker.js) | Medium | State |
| 21 | Debate Engine | [`src/utils/debate-engine.js`](src/utils/debate-engine.js) | Medium | AI |
| 22 | Input Sanitizer | [`src/utils/input-sanitizer.js`](src/utils/input-sanitizer.js) | Low | Validation |
| 23 | Mapper | [`src/utils/mapper.js`](src/utils/mapper.js) | Low | YAML/JSON |
| 24 | Skill Hub | [`src/utils/skill-hub.js`](src/utils/skill-hub.js) | Medium | File system |
| 25 | Skill Watcher | [`src/utils/skill-watcher.js`](src/utils/skill-watcher.js) | Low | File watching |
| 26 | Spec Decomposer | [`src/utils/spec-decomposer.js`](src/utils/spec-decomposer.js) | Medium | Parsing |
| 27 | Playbook Runner | [`src/utils/playbook-runner.js`](src/utils/playbook-runner.js) | Medium | Execution |
| 28 | Quick Flow | [`src/utils/quick-flow.js`](src/utils/quick-flow.js) | Low | Flow control |
| 29 | Telemetry | [`src/utils/telemetry.js`](src/utils/telemetry.js) | Medium | Analytics |

### 🟢 Priority 4: Quality & Tasks
*Quality assurance and task management*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 30 | Quality Gate | [`src/quality/quality-gate.js`](src/quality/quality-gate.js) | Medium | Verification |
| 31 | Verifier | [`src/quality/verifier.js`](src/quality/verifier.js) | Medium | Code analysis |
| 32 | Analyzer | [`src/quality/analyzer.js`](src/quality/analyzer.js) | Medium | AST parsing |
| 33 | Benchmark | [`src/quality/benchmark.js`](src/quality/benchmark.js) | Medium | Performance |
| 34 | Doctor | [`src/quality/doctor.js`](src/quality/doctor.js) | Medium | Diagnostics |
| 35 | Checklist Gen | [`src/quality/checklist-gen.js`](src/quality/checklist-gen.js) | Low | Generation |
| 36 | Todo Scanner | [`src/quality/todo-scanner.js`](src/quality/todo-scanner.js) | Low | Scanning |
| 37 | Task CLI | [`src/tasks/task-cli.js`](src/tasks/task-cli.js) | Medium | CLI |
| 38 | Kanban Automation | [`src/tasks/kanban-automation.js`](src/tasks/kanban-automation.js) | Low | Automation |
| 39 | WP Model | [`src/tasks/wp-model.js`](src/tasks/wp-model.js) | Low | Data model |
| 40 | Board Export | [`src/tasks/board-export.js`](src/tasks/board-export.js) | Low | Export |
| 41 | Task Search | [`src/tasks/task-search.js`](src/tasks/task-search.js) | Low | Search |
| 42 | Archive Tasks | [`src/tasks/archive-tasks.js`](src/tasks/archive-tasks.js) | Low | Archival |

### 🔵 Priority 5: Session & Knowledge
*Session management and knowledge systems*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 43 | Session Manager | [`src/session/session-manager.js`](src/session/session-manager.js) | Medium | State |
| 44 | Lifecycle Manager | [`src/session/lifecycle-manager.js`](src/session/lifecycle-manager.js) | Medium | Lifecycle |
| 45 | KG Engine | [`src/knowledge/kg-engine.js`](src/knowledge/kg-engine.js) | High | Graph DB |
| 46 | KG Scanner | [`src/knowledge/kg-scanner.js`](src/knowledge/kg-scanner.js) | Medium | Scanning |
| 47 | Living Docs | [`src/knowledge/living-docs.js`](src/knowledge/living-docs.js) | Medium | Documentation |
| 48 | Capture Insights | [`src/knowledge/capture-insights.js`](src/knowledge/capture-insights.js) | Low | Insights |

### 🟣 Priority 6: Setup & Onboarding
*Setup utilities and user onboarding*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 49 | Onboarding | [`src/setup/onboarding.js`](src/setup/onboarding.js) | Medium | CLI prompts |
| 50 | Onboarding Index | [`src/setup/onboarding/index.js`](src/setup/onboarding/index.js) | Medium | Flow control |
| 51 | CI Setup | [`src/setup/ci-setup.js`](src/setup/ci-setup.js) | Low | CI detection |
| 52 | Constitution | [`src/setup/constitution.js`](src/setup/constitution.js) | Low | Config |
| 53 | Migrator | [`src/setup/migrator.js`](src/setup/migrator.js) | Medium | Migration |
| 54 | Onboarding Config | [`src/setup/onboarding/config/options.js`](src/setup/onboarding/config/options.js) | Low | Config |
| 55 | Agent Handoff | [`src/setup/onboarding/steps/agent-handoff.js`](src/setup/onboarding/steps/agent-handoff.js) | Medium | Agent flow |
| 56 | Confirm Flow | [`src/setup/onboarding/steps/confirm-flow.js`](src/setup/onboarding/steps/confirm-flow.js) | Low | Flow |
| 57 | Dev Type | [`src/setup/onboarding/steps/dev-type.js`](src/setup/onboarding/steps/dev-type.js) | Low | Selection |
| 58 | IDE Select | [`src/setup/onboarding/steps/ide-select.js`](src/setup/onboarding/steps/ide-select.js) | Low | Selection |
| 59 | PRD Flow | [`src/setup/onboarding/steps/prd-flow.js`](src/setup/onboarding/steps/prd-flow.js) | High | PRD generation |

### ⚪ Priority 7: Remaining Commands & External
*CLI commands and external tools*

| # | File | Location | Complexity | Dependencies |
|---|------|----------|------------|--------------|
| 60 | Docs Command | [`bin/commands/docs.js`](bin/commands/docs.js) | Low | Documentation |
| 61 | Knowledge Command | [`bin/commands/knowledge.js`](bin/commands/knowledge.js) | Low | KG |
| 62 | Logs Command | [`bin/commands/logs.js`](bin/commands/logs.js) | Low | Logging |
| 63 | Memory Command | [`bin/commands/memory.js`](bin/commands/memory.js) | Low | Memory |
| 64 | Orchestration Command | [`bin/commands/orchestration.js`](bin/commands/orchestration.js) | Medium | Orchestration |
| 65 | Quality Command | [`bin/commands/quality.js`](bin/commands/quality.js) | Low | Quality |
| 66 | Server Command | [`bin/commands/server.js`](bin/commands/server.js) | Low | Server |
| 67 | Session Command | [`bin/commands/session.js`](bin/commands/session.js) | Low | Session |
| 68 | Skills Command | [`bin/commands/skills.js`](bin/commands/skills.js) | Low | Skills |
| 69 | Tasks Command | [`bin/commands/tasks.js`](bin/commands/tasks.js) | Low | Tasks |
| 70 | Dashboard Server | [`dashboard/server.js`](dashboard/server.js) | Medium | Express, WS |
| 71 | Skill Creator Index | [`skill-creator/index.js`](skill-creator/index.js) | Low | Main entry |
| 72 | Map Codebase | [`skill-creator/src/map-codebase.js`](skill-creator/src/map-codebase.js) | Medium | Code mapping |
| 73 | Scraper | [`skill-creator/src/scraper.js`](skill-creator/src/scraper.js) | Low | Scraping |
| 74 | Skill Generator | [`skill-creator/src/skill-generator.js`](skill-creator/src/skill-generator.js) | Medium | Generation |
| 75 | Tech Detector | [`skill-creator/src/tech-detector.js`](skill-creator/src/tech-detector.js) | Medium | Detection |
| 76 | Detect Platform | [`installer/src/detect-platform.js`](installer/src/detect-platform.js) | Medium | Platform detection |
| 77 | Install | [`installer/src/install.js`](installer/src/install.js) | High | Installation |

---

## Migration Tasks (Work Packages)

### WP1: Infrastructure Foundation
**Objective:** Migrate core infrastructure with high dependencies

- [ ] Migrate [`bin/cli.js`](bin/cli.js) → `bin/cli.ts`
- [ ] Migrate [`bin/commands/core.js`](bin/commands/core.js) → `bin/commands/core.ts`
- [ ] Migrate [`src/utils/logger.js`](src/utils/logger.js) → `src/utils/logger.ts`
- [ ] Migrate [`src/server/error-handler.js`](src/server/error-handler.js) → `src/server/error-handler.ts`
- [ ] Migrate [`src/server/api-server.js`](src/server/api-server.js) → `src/server/api-server.ts`
- [ ] Migrate [`src/server/mcp-server.js`](src/server/mcp-server.js) → `src/server/mcp-server.ts`
- [ ] Create shared type definitions (`src/types/index.ts`)

**Estimated:** 2 sprints

### WP2: AI & Memory Core
**Objective:** Migrate AI and memory modules with complex types

- [ ] Migrate [`src/ai/model-router.js`](src/ai/model-router.js) → `src/ai/model-router.ts`
- [ ] Migrate [`src/ai/token-budget.js`](src/ai/token-budget.js) → `src/ai/token-budget.ts`
- [ ] Migrate [`src/ai/output-filter.js`](src/ai/output-filter.js) → `src/ai/output-filter.ts`
- [ ] Migrate [`src/memory/context-engine.js`](src/memory/context-engine.ts)
- [ ] Migrate [`src/memory/memory-store.js`](src/memory/memory-store.ts)
- [ ] Create AI provider interfaces (`src/types/ai.ts`)
- [ ] Create Memory interfaces (`src/types/memory.ts`)

**Estimated:** 2 sprints

### WP3: Orchestration Engine
**Objective:** Migrate orchestration and workflow modules

- [ ] Migrate [`src/orchestration/orchestrator-api.js`](src/orchestration/orchestrator-api.ts)
- [ ] Migrate [`src/orchestration/auto-loop.js`](src/orchestration/auto-loop.ts)
- [ ] Migrate [`src/orchestration/circuit-breaker.js`](src/orchestration/circuit-breaker.ts)
- [ ] Migrate [`src/orchestration/dependency-graph.js`](src/orchestration/dependency-graph.ts)
- [ ] Migrate [`src/orchestration/worktree-manager.js`](src/orchestration/worktree-manager.ts)
- [ ] Migrate [`src/orchestration/merge-engine.js`](src/orchestration/merge-engine.ts)
- [ ] Migrate [`src/orchestration/discovery-wizard.js`](src/orchestration/discovery-wizard.ts)
- [ ] Create Orchestration types (`src/types/orchestration.ts`)

**Estimated:** 2 sprints

### WP4: Quality & Utils
**Objective:** Migrate utility modules and quality tools

- [ ] Migrate all files in [`src/utils/`](src/utils/) directory
- [ ] Migrate all files in [`src/quality/`](src/quality/) directory
- [ ] Migrate all files in [`src/tasks/`](src/tasks/) directory
- [ ] Create Utility types (`src/types/utils.ts`)

**Estimated:** 1.5 sprints

### WP5: Session & Knowledge
**Objective:** Migrate session and knowledge modules

- [ ] Migrate all files in [`src/session/`](src/session/) directory
- [ ] Migrate all files in [`src/knowledge/`](src/knowledge/) directory
- [ ] Migrate all files in [`src/missions/`](src/missions/) directory
- [ ] Create Knowledge types (`src/types/knowledge.ts`)

**Estimated:** 1.5 sprints

### WP6: Setup & Onboarding
**Objective:** Migrate setup and onboarding flows

- [ ] Migrate all files in [`src/setup/`](src/setup/) directory
- [ ] Create Onboarding types (`src/types/onboarding.ts`)

**Estimated:** 1 sprint

### WP7: Commands & External
**Objective:** Migrate CLI commands and external tools

- [ ] Migrate all files in [`bin/commands/`](bin/commands/) directory
- [ ] Migrate [`dashboard/server.js`](dashboard/server.js)
- [ ] Migrate all files in [`skill-creator/`](skill-creator/) directory
- [ ] Migrate all files in [`installer/`](installer/) directory
- [ ] Update package.json entry points

**Estimated:** 1 sprint

### WP8: Testing & Polish
**Objective:** Ensure full type coverage and testing

- [ ] Add type tests for migrated modules
- [ ] Run full TypeScript compiler check
- [ ] Update CI/CD pipeline for TypeScript
- [ ] Update documentation
- [ ] Remove duplicate .js files (if both .ts and .js exist)

**Estimated:** 1 sprint

---

## Migration Strategy

### 1. Incremental Migration
- Migrate file by file, maintaining backward compatibility
- Use `allowJs: true` in tsconfig.json during transition
- Gradually enable stricter TypeScript options

### 2. Type Definitions First
- Create shared type definitions before migrating modules
- Define interfaces for external dependencies (express, winston, etc.)

### 3. Pattern: JSDoc to TypeScript
```javascript
// Before (JSDoc)
/**
 * @param {string} name
 * @param {number} age
 * @returns {Promise<User>}
 */
async function createUser(name, age) { ... }
```

```typescript
// After (TypeScript)
interface User {
  id: string;
  name: string;
  age: number;
  createdAt: Date;
}

async function createUser(name: string, age: number): Promise<User> { ... }
```

### 4. Pattern: barrel exports
```typescript
// src/errors/index.ts
export * from './base-error';
export * from './runtime-error';
// etc.
```

### 5. Keep .js for TypeScript Files
During migration, keep the .js files but make them re-export from .ts:
```javascript
// bin/cli.js (legacy entry point)
module.exports = require('./cli.ts');
```

---

## Type Definitions to Create

### Priority 1 Types
- `src/types/index.ts` - Common types
- `src/types/ai.ts` - AI provider interfaces
- `src/types/memory.ts` - Memory system interfaces

### Priority 2 Types
- `src/types/orchestration.ts` - Orchestration types
- `src/types/session.ts` - Session types
- `src/types/knowledge.ts` - Knowledge graph types

### Priority 3 Types
- `src/types/utils.ts` - Utility types
- `src/types/quality.ts` - Quality gates types
- `src/types/onboarding.ts` - Onboarding types

---

## Notes

- The project uses CommonJS (`"type": "commonjs"` in package.json)
- TypeScript compilation outputs to `./dist` directory
- Strict mode is already enabled in `tsconfig.json`
- Some files may need `// @ts-nocheck` temporarily during migration
- Consider using `typescript-estree` for AST-based transformations for large files
