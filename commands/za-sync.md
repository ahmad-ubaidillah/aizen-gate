---
name: "za-sync"
description: "Synchronize projects, skills, and agents across multiple Aizen-Gate-enabled workspaces."
authors: ["Aizen-Gate Team"]
status: "beta"
---

# Command: za-sync

The project-wide synchronization and consistency phase.

**[SA] Time to sync our tools!** I'm calling in @devops and @analyst.

## 1. Skill & Agent Propagation (Via [DEVOPS] Stark)

- **[DEVOPS] Stark** ensures all workspaces have identical tools:
  - Synchronize custom agents in `/aizen-gate/agents/`.
  - Push generic skills from `skills/` to the global registry or other projects.
  - Pull latest core commands and templates from the Aizen-Gate source.

## 2. Remote & Local Alignment (Via [ANALYST] Sigma)

- **[ANALYST] Sigma** identifies discrepancies:
  - Check for mismatched versions of the framework across different projects.
  - Sync `shared/memory.md` between related project repositories.
  - Ensure `.env` and configuration profiles are consistent.

## 3. Conflict Resolution (Via [SA] Bob)

- **[SA] Bob** handles any sync errors:
  - If a skill or agent has different versions, @architect is called in to decide.
  - Provide a summary of updated files and new capabilities added.

---

**[SA] Synchronization successful.** All projects and domains are now perfectly aligned. Ready to resume building?
