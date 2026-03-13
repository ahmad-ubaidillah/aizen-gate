---
name: "az-status"
description: "Display a comprehensive dashboard of project progress, sprint status, and team activity."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Command: az-status

The project-wide surveillance and transparency phase.

**[SA] Time to see the big picture!** I'm calling in @scrum-master and @analyst.

## 1. Visual Progress Dashboard (Via [SA] Bob)

- **[SA] Bob** will generate a progress summary from the **Scrum Board** (`aizen-gate/shared/board.md`):
  - **Sprints**: Current sprint # vs. total plan.
  - **Task Velocity**: Tasks completed in the last 24h.
  - **Completion %**: Overall project completion based on story count and complexity.

## 2. Team & Activity Insights (Via [ANALYST] Sigma)

- **[ANALYST] Sigma** will analyze recent telemetry:
  - **Active Agents**: Who is currently assigned and what are they working on?
  - **Recent Milestones**: Significant achievements tagged in the last 48h.
  - **Blockers**: Any tasks marked as `BLOCKED` or `STUCK`.

## 3. Resource & Health Check (Via [SA] Bob)

- **[SA] Bob** will perform a health check:
  - **Token Health**: Current cost vs. budget estimates.
  - **Git Health**: Branch status and commit history cleanliness.
  - **State Consistency**: Ensuring `memory.md`, `state.md`, and `project.md` are in sync.

---

**[SA] The dashboard is live!** Everything looking on track for the finish line. Should we continue to the next task or adjust the backlog?
