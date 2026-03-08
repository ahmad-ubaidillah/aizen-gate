# Sprint 05: Quality & Observability

**Sprint Goal:** Improve error handling, add centralized logging, and establish CI/CD pipelines

**Duration:** 2 weeks
**Story Points Available:** 34 points

---

## 📋 Sprint Backlog

### Epic 1: Error Handling Improvements (8 pts)

#### Task 1.1: Create Typed Error System (3 pts)
- **Description:** Create custom error classes with error codes and metadata
- **Files:** `src/errors/` (new directory)
- **Deliverables:**
  - `src/errors/base-error.js` - Base error class
  - `src/errors/validation-error.js` - Input validation errors
  - `src/errors/runtime-error.js` - Runtime operation errors
  - `src/errors/timeout-error.js` - Timeout errors
  - Update all catch blocks to use typed errors
- **Acceptance Criteria:** All errors have codes, messages, and context

#### Task 1.2: Global Error Handler Middleware (2 pts)
- **Description:** Add Express/error handler that catches unhandled errors
- **Files:** `src/server/api-server.js`, `dashboard/server.js`
- **Deliverables:**
  - Error logging with stack traces
  - Sanitized error responses (no leaked internals)
  - Error codes in responses
- **Acceptance Criteria:** All API errors return structured JSON with codes

#### Task 1.3: Error Recovery Patterns (3 pts)
- **Description:** Add retry logic, circuit breakers, and fallbacks
- **Files:** `src/utils/retry.js`, `src/utils/circuit-breaker.js`
- **Deliverables:**
  - Generic retry decorator with exponential backoff
  - Circuit breaker class
  - Applied to MCP calls, memory operations
- **Acceptance Criteria:** Transient failures auto-retry, cascade failures stop

---

### Epic 2: Centralized Logging (8 pts)

#### Task 2.1: Logger Implementation (3 pts)
- **Description:** Implement Winston logger with multiple transports
- **Files:** `src/utils/logger.js` (new)
- **Deliverables:**
  - Winston configuration
  - File transport (rotating daily)
  - Console transport (with colors)
  - JSON structured logging option
  - Request ID middleware
- **Acceptance Criteria:** Logs go to both file and console with timestamps

#### Task 2.2: Module Integration (2 pts)
- **Description:** Replace all console.log/error with logger calls
- **Files:** `bin/commands/*.js`, `src/**/*.js`
- **Deliverables:**
  - Consistent log levels (debug, info, warn, error)
  - Context (command, session, user) in all logs
- **Acceptance Criteria:** No raw console.log in production code

#### Task 2.3: Log Analytics Script (3 pts)
- **Description:** Create log parsing and analytics tool
- **Files:** `bin/commands/logs.js` (new)
- **Deliverables:**
  - Error aggregation by type
  - Time-series analysis
  - Top failing commands
  - Alert on error spikes
- **Acceptance Criteria:** Can parse logs and show error trends

---

### Epic 3: Observability (6 pts)

#### Task 3.1: OpenTelemetry Setup (3 pts)
- **Description:** Add OpenTelemetry for distributed tracing
- **Files:** `src/utils/telemetry.js` (new)
- **Deliverables:**
  -Tracer provider setup
  - Span creation for commands
  - Span attributes (user, command, duration)
  - Export to console/debug
- **Acceptance Criteria:** All commands generate spans

#### Task 3.2: Metrics Collection (3 pts)
- **Description:** Add basic metrics (latency, error rate, usage)
- **Files:** `src/utils/metrics.js` (new)
- **Deliverables:**
  - Histogram for command durations
  - Counter for errors
  - Counter for commands by type
  - `/metrics` endpoint
- **Acceptance Criteria:** Metrics available at /api/metrics

---

### Epic 4: E2E Testing (6 pts)

#### Task 4.1: Playwright Setup (2 pts)
- **Description:** Configure Playwright for E2E tests
- **Files:** `tests/e2e/` (new), `playwright.config.js`
- **Deliverables:**
  - Playwright config with chromium
  - Test fixtures (server, browser)
  - Basic page load test
- **Acceptance Criteria:** Can run `npm run e2e` successfully

#### Task 4.2: Core E2E Tests (4 pts)
- **Description:** Write E2E tests for critical flows
- **Files:** `tests/e2e/*.spec.js`
- **Deliverables:**
  - Onboarding flow test
  - Command execution test
  - Dashboard load test
  - Agent handoff test
- **Acceptance Criteria:** 4 passing E2E tests

---

### Epic 5: CI/CD (6 pts)

#### Task 5.1: GitHub Actions Workflow (3 pts)
- **Description:** Create CI workflow
- **Files:** `.github/workflows/ci.yml` (new)
- **Deliverables:**
  - Node.js 20 matrix
  - Install dependencies
  - Lint (biome)
  - Unit tests
  - E2E tests (optional on PR)
- **Acceptance Criteria:** Green CI on push to main

#### Task 5.2: Release Workflow (3 pts)
- **Description:** Create release workflow with changelog
- **Files:** `.github/workflows/release.yml` (new)
- **Deliverables:**
  - Semantic version bump
  - Changelog generation
  - GitHub release creation
  - NPM publish (optional)
- **Acceptance Criteria:** Can create release from tag

---

## 📊 Capacity Planning

| Task | Points | Owner | Dependencies |
|------|--------|-------|--------------|
| 1.1 Typed Errors | 3 | - | - |
| 1.2 Error Handler | 2 | - | 1.1 |
| 1.3 Retry/Circuit | 3 | - | 1.1 |
| 2.1 Logger | 3 | - | - |
| 2.2 Integration | 2 | - | 2.1 |
| 2.3 Log Analytics | 3 | - | 2.1 |
| 3.1 OpenTelemetry | 3 | - | 2.1 |
| 3.2 Metrics | 3 | - | 3.1 |
| 4.1 Playwright | 2 | - | - |
| 4.2 E2E Tests | 4 | - | 4.1 |
| 5.1 CI Workflow | 3 | - | - |
| 5.2 Release Workflow | 3 | - | 5.1 |
| **TOTAL** | **34** | | |

---

## 🎯 Sprint Goals

1. **Must Have:** Tasks 1.1, 1.2, 2.1, 2.2, 5.1 (13 pts)
2. **Should Have:** Tasks 1.3, 3.1, 4.1, 5.2 (11 pts)
3. **Nice to Have:** Tasks 2.3, 3.2, 4.2 (10 pts)

---

## 📝 Notes

- Error handling (Epic 1) is highest priority - prevents debugging pain
- Logging enables observability, do early
- CI/CD ensures code quality gates
- E2E tests provide confidence for refactoring
