---
name: "az-doctor"
description: "Run a comprehensive health check on the Aizen-Gate environment and project workspace."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Command: az-doctor

The diagnostic and project-wide health check phase.

**[SA] Time for a check-up!** I'm calling in @devops and @analyst.

## 1. Environment Diagnostics (Via [DEVOPS] Stark)

- **[DEVOPS] Stark** checks:
  - **Tooling**: Versions of Git, Node, and other project dependencies.
  - **Installer Status**: Is the Aizen-Gate framework correctly linked?
  - **Configuration**: Are all required environment variables and keys set?

## 2. Workspace Integrity (Via [ANALYST] Sigma)

- **[ANALYST] Sigma** verifies:
  - **Project Directory**: Are the `/aizen-gate`, `/shared`, and `/docs` folders in place?
  - **Template Quality**: Are the core templates (`shared/board.md`, `shared/memory.md`, etc.) intact?
  - **State Consistency**: Is there any mismatch between current code and shared state?

## 3. Knowledge & State Health (Via [SA] Bob)

- **[SA] Bob** identifies issues:
  - **Backlog Health**: Is the board formatted correctly and tasks numbered?
  - **Commit Hygiene**: Are commit messages following the atomic standard?
  - **Context Rot**: Is the active session context becoming too large?

## 4. Prescription & Fixes (Via [DEVOPS] Stark)

- **[DEVOPS] Stark** provides fixes:
  - Automatically correct common directory structure issues.
  - Suggest steps to fix configuration errors.
  - Provide a "Clean Bill of Health" or a prioritized "Fix List".

---

**[SA] Doctor's report is in!** We've identified 3 potential issues and applied 2 quick fixes. Ready to get back to building?
