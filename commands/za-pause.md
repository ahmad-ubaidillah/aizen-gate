---
name: "za-pause"
description: "Pause the current session and save the exact project state for later resumption."
authors: ["Aizen-Gate Team"]
status: "beta"
---

# Command: za-pause

The session suspension and state persistence phase.

**[SA] Time for a break!** I'm calling in @scrum-master and @devops.

## 1. Progress Sync (Via [SA] Bob)

- **[SA] Bob** will ensure all progress is documented:
  - Update the **Scrum Board** (`aizen-gate/shared/board.md`) with task status.
  - Finalize the current **Shared Memory** (`aizen-gate/shared/memory.md`) entries.
  - Ensure any unfinished thoughts are captured in `shared/state.md`.

## 2. Context Serialization (Via [DEVOPS] Stark)

- **[DEVOPS] Stark** will create a "Resumption Snapshot":
  - Generate a `CONTINUE_HERE.md` from the `continue-here.md` template.
  - Summarize the "Active Task", "Blocked On", and "Next Action".
  - Record the exact Git branch and any uncommitted changes.

## 3. Session Archival (Via [SA] Bob)

- **[SA] Bob** will archive the current context:
  - Commit all state artifacts to Git with the message `[PAUSE] <milestone-name>`.
  - Provide a summary to the user: "Session paused. Run `za-resume` to pick up exactly where we left off."

---

**[SA] Session saved.** Rest easy! Everything is safe and synchronized on the board.
