---
trigger: model_decision
description: "When the user asks to fix bugs, analyze errors, investigate issues, run tests, or troubleshoot code."
---

# DEBUG.MD - Systematic QA & Fix Protocol

> **Objective**: Investigate, fix, and test in a unified workflow.

---

## 1. INVESTIGATION (Sherlock Mode)

### 1.1 First Steps
1. **Stack Trace**: Don't guess. Read the first line of the log.
2. **Reproduce**: Write a small script/test to reproduce the bug.
3. **Isolate**: Disable surrounding modules to narrow down the suspect.

### 1.2 Information Gathering
1. **Environment**: Note OS, Node/Python version, dependencies.
2. **Context**: What was user doing? What inputs led to error?
3. **Logs**: Extract relevant log entries around the error.

---

## 2. TESTING STRATEGY

### 2.1 TDD Lite
1. Write failing test case (Red) before fixing code.
2. Write code to pass test (Green).
3. Refactor for maintainability.

### 2.2 Test Types
- **Unit Test**: Test isolated function logic.
- **Integration Test**: Test API -> DB flow.
- **E2E Test**: Test full user journey.

---

## 3. FIXING PROTOCOL

### 3.1 Root Cause Analysis
1. Fix the cause, not symptoms.
2. Ask "Why?" 5 times to find root cause.
3. Document the actual fix, not workaround.

### 3.2 Regression Check
1. Run existing test suite to ensure nothing is broken.
2. Check related functionality.
3. Verify fix works in all edge cases.

### 3.3 Cleanup
1. Remove all debug logs after fix.
2. Delete temporary test files.
3. Update documentation if needed.

---

## 4. DEBUGGING TECHNIQUES

### 4.1 Tools
- **IDE Debugger**: Set breakpoints, inspect variables.
- **Console**: Strategic console.log for flow tracing.
- **Browser DevTools**: Network, Elements, Console for frontend.

### 4.2 Techniques
- **Binary Search**: Comment half the code to isolate issue.
- **Diff**: Compare working vs broken state.
- **Rubber Duck**: Explain problem out loud.

---

## 5. REPORTING FORMAT

Format: `[Error] -> [Root Cause] -> [Solution] -> [Prevention]`

Example:
- **Error**: API returns 500 on user creation.
- **Cause**: Database constraint violation - email not unique.
- **Solution**: Added email validation before insert.
- **Prevention**: Add unique index on email column in migration.

---

## 6. COMMON PATTERNS

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Null reference | Uninitialized variable | Add null check |
| Infinite loop | Wrong condition | Fix termination logic |
| Memory leak | Unclosed resources | Use try-finally |
| Slow response | Missing index | Add database index |