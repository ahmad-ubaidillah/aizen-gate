---
name: "za-archive"
description: "Archive a completed sprint or milestone into the shared/archive/ directory."
authors: ["Aizen-Gate Team"]
status: "beta"
---

# Command: za-archive

The sprint/milestone clean-up and serialization phase.

**[SA] Time to lock in our wins!** I'm calling in @scrum-master and @docs.

## 1. Board Cleanup (Via [SA] Bob)

- **[SA] Bob** identifies `DONE` tasks on the **Scrum Board** (`aizen-gate/shared/board.md`):
  - Extracts the completed stories and IDs.
  - Summarizes the achievements of the sprint.
  - Moves the `DONE` section to the archive.

## 2. Milestone Documentation (Via [DOCS] Pen)

- **[DOCS] Pen** creates a "Sprint Report":
  - Summarizes lessons learned, technology choices, and blockers resolved.
  - Generates or updates a `shared/archive/sprint-[X]-report.md`.
  - Tags the current state in Git (if requested).

## 3. Knowledge Hardening (Via [SA] Bob)

- **[SA] Bob** ensures patterns are hardened:
  - Invokes `za-compound` to move key learnings into `shared/memory.md` before archival.
  - Cleans the board for the next sprint's `PENDING` items.

---

**[SA] Project history archived.** A clean board is a fast board.
