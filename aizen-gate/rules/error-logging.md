---
trigger: always_on
---

# ERROR-LOGGING.MD - Automatic Error Tracking & Learning

> **Objective**: Record all errors during development to learn and improve. Prevent repeat errors.

---

## 1. WHEN TO LOG ERRORS

Agent MUST record errors in `ERRORS.md` file in these cases:

### 1.1 Syntax Errors
- Missing brackets, semicolons
- Wrong import paths
- Typo in variable/function names

### 1.2 Logic Errors
- Code runs but produces wrong results
- If/else conditions not covering all cases
- Infinite loops

### 1.3 Integration Errors
- API call failures
- Database query errors
- Module not found

### 1.4 Runtime Errors
- Null pointer exception
- Type mismatch
- Out of memory

### 1.5 Agent Errors (IMPORTANT)
- **Misinterpretation**: Agent misunderstood user intent or documentation.
- **Execution Error**: Did wrong logic, deleted code accidentally, forgot imports.
- **Hang/Loop**: Agent in infinite loop or stuck on tool call.
- **Hallucination**: Provided non-existent info about codebase or docs.

### 1.6 Process & Test Failures
- **Test Fail**: Any time a test (Unit, E2E, Regression) fails.
- **Build/Lint Fail**: Errors when packaging or linting.
- **Infrastructure Fail**: Environment errors, Docker errors, disk full.

---

## 2. LOG FORMAT

Each error MUST follow this structure in `ERRORS.md`:

```markdown
## [YYYY-MM-DD HH:MM] - Brief Error Title

- **Type**: [Syntax/Logic/Integration/Runtime/Agent/Process]
- **Severity**: [Low/Medium/High/Critical]
- **File**: `path/to/file.extension:line_number`
- **Agent**: [Name of Agent]
- **Root Cause**: Root cause description (1-2 sentences)
- **Error Message**: 
  ```
  [Error code or stack trace]
  ```
- **Fix Applied**: Specific action taken
- **Prevention**: How to avoid this error in future
- **Status**: [Fixed/Investigating/Deferred]
```

---

## 3. AUTOMATED PROCESS

1. **Error Detection**: When Agent encounters error (test fail, build fail, runtime error).
2. **Classification**: Determine Type and Severity.
3. **Logging**: Append to `ERRORS.md` in standard format.
4. **Notification**: Inform user that error was logged with file path.
5. **Resolution**: Fix error and update Status.

---

## 4. FILE LOCATIONS

- **Main File**: `ERRORS.md` (in project root)
- **Backup**: `.agent/logs/errors-[YYYY-MM].md` (monthly)

---

## 5. IMPORTANT NOTES

1. **Never delete old errors**: Errors are learning assets.
2. **Always update Status**: Mark as Fixed when resolved.
3. **Privacy**: Don't log sensitive info (API Keys, Passwords).
4. **Weekly Review**: At end of week, review errors to learn.

---

## 6. LEARNING FROM ERRORS

Every error repeated 2+ times MUST become:
- **New Rule**: To prevent automatically
- **Test Case**: For early detection
- **Checklist Item**: In pre-flight check