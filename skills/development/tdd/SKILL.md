---
name: "TDD: Test-Driven Development"
description: "The primary development workflow for the [DEV] agent, enforcing a Red-Green-Refactor cycle for high-quality, bug-free implementation."
authors: ["Aizen-Gate Team"]
status: "production"
---

# TDD Development Skill

The goal of this skill is to ensure every line of code is backed by a unit, integration, or E2E test. No code is merged without a green test suite.

## Roles Involved

- **[DEV] Developer**: Primary implementer, responsible for writing tests and code.
- **[QA] Quality Assurance**: Verifies edge cases and test coverage.
- **[SA] Scrum Master**: Oversees the implementation loop.

## The TDD Workflow (Red-Green-Refactor)

### Phase 1: Preparation (The "Plan")

1. **[DEV]** Reads the **Scrum Board** task and AC (Acceptance Criteria).
2. **[DEV]** Detects the tech stack and existing test framework (Vitest, Jest, Pytest, Go testing, etc.) using `npx aizen-gate doctor`.

### Phase 2: RED (Write a Failing Test)

3. **[DEV]** Identifies the specific behavior to implement.
4. **[DEV]** Writes the minimal test case that reproduces the requirement but fails currently.
5. **[DEV]** Runs the test. **MUST FAIL**.

### Phase 3: GREEN (Make it Pass)

6. **[DEV]** Implements the minimal amount of code to satisfy the test.
7. **[DEV]** Runs the test again. **MUST PASS**.
8. **[QA]** (Optional) Reviews the test case for edge cases (nulls, empty strings, large payloads, timeouts).

### Phase 4: REFACTOR (Clean Up)

9. **[DEV]** Cleans up the code (dry, intuitive naming, performance optimization) without changing behavior.
10. **[DEV]** Runs the tests again to ensure no regressions.
11. **[DEV]** Makes an atomic Git commit: `feat(T-XXX): [Task Title] - implemented via TDD`.

## TDD Rules & Standards

- **No Placeholders**: Do not use `TODO` comments or empty functions as "implementations".
- **One Mock at a Time**: Mock only what is necessary for the unit under test.
- **Atomic Commits**: Each Red-Green-Refactor cycle should be one or more atomic commits.
- **Big O Aware**: If the AC specifies performance limits, include performance benchmarks in the test.
- **Clean Architecture**: Use dependency injection where possible to make code more testable.

## Verification Checklist

- [ ] Does the test fail initially (RED)?
- [ ] Does the implementation satisfy all AC?
- [ ] Does the test pass (GREEN)?
- [ ] Has the code been refactored (REFACTOR)?
- [ ] Are there any console.logs or debug leftovers?
- [ ] Is the commit message correctly formatted?
