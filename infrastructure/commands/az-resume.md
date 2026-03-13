---
name: "az-resume"
description: "Resume a previously paused session from the last saved state."
authors: ["Aizen-Gate Team"]
status: "beta"
---

# Command: az-resume

The session restoration and context re-hydration phase.

**[SA] Welcome back!** I'm calling in @scrum-master and @analyst.

## 1. Context Restoration (Via [ANALYST] Sigma)

- **[ANALYST] Sigma** will re-hydrate the context:
  - Read the `CONTINUE_HERE.md` or `shared/state.md` to identify the "Active Task".
  - Review the **Scrum Board** (`aizen-gate/shared/board.md`) for the current milestone status.
  - Review the last few commits and recent `shared/memory.md` entries.

## 2. Environment Alignment (Via [SA] Bob)

- **[SA] Bob** will align the workspace:
  - Check the Git branch and status.
  - Verify that dependencies and environment are consistent with the "Pause Snapshot".
  - Alert the user if any external changes have occurred since the pause.

## 3. Mission Re-engagement (Via [SA] Bob)

- **[SA] Bob** will re-engage with the team:
  - Announce the resumption of the mission to all agents.
  - Propose the next immediate step based on the `CONTINUE_HERE.md`.
  - Confirm with the user before proceeding with execution.

---

**[SA] We are back in the flow!** The board is synced and the team is ready. Ready to continue implementation?
