# 🚨 Error Library & Troubleshooting Guide

This library tracks known issues, root causes, and verified fixes for the Aizen-Gate orchestrator.

## 🌀 Playbook & Orchestration

### [ERROR-001] Missing Playbook Overview

- **Symptom**: When running `npx aizen-gate <playbook>`, the CLI outputs "Overview: No overview provided."
- **Root Cause**: The `playbook-runner.js` used a simple regex looking for `## Overview` sections, but modern playbooks use YAML frontmatter for metadata.
- **Fix**: Updated `src/utils/playbook-runner.js` to use `gray-matter` to parse frontmatter and prioritize the `description` field as the overview.
- **Status**: ✅ Fixed in v2.2.1

---

---

## 💾 Memory & AI Budget

### [ERROR-201] TypeError: cannot read toFixed of undefined

- **Symptom**: Running `npx aizen-gate tokens` crashes with `TypeError: Cannot read properties of undefined (reading 'toFixed')`.
- **Root Cause**: The `TokenBudget.getReport()` returned an object with missing properties when no data was recorded (empty ledger).
- **Fix**: Added defensive logic in `bin/commands/memory.js` to provide default 0.0 values for all budget metrics before calling `toFixed`.
- **Status**: ✅ Fixed in v2.2.2

---

## 🛠️ Skill Management

### [ERROR-301] TypeError: path argument must be string (SkillHub)

- **Symptom**: `npx aizen-gate skill search` crashes with `TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined`.
- **Root Cause**: The `SkillHub` constructor was being called without the `projectRoot` argument in `bin/commands/skills.js`, causing `path.join` to receive `undefined`.
- **Fix**: Updated `bin/commands/skills.js` to pass `process.cwd()` to the `SkillHub` constructor.
- **Status**: ✅ Fixed in v2.2.2

### [ERROR-302] Module Not Found (skill-creator/index)

- **Symptom**: `npx aizen-gate dashboard` or `skill add` fails with `MODULE_NOT_FOUND`.
- **Root Cause**: Incorrect relative path in `src/utils/skill-watcher.js` (was `../skill-creator` instead of `../../skill-creator`).
- **Fix**: Corrected the require path in `skill-watcher.js`.
- **Status**: ✅ Fixed in v2.2.2

---

## 🩺 Diagnostics & Quality

### [ERROR-401] Doctor Crash on Missing Skills Directory

- **Symptom**: Running `npx aizen-gate doctor` fails with `Error: ENOENT: no such file or directory, scandir '.../aizen-gate/skills'`.
- **Root Cause**: The `doctor.js` was attempting to read the `skills` directory without checking if it exists.
- **Fix**: Added `fs.existsSync` check in `src/quality/doctor.js` to handle empty or uninitialized skill hubs gracefully.
- **Status**: ✅ Fixed in v2.2.3
