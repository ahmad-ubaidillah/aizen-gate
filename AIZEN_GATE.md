# ⛩️ AIZEN GATE: The Ultimate AI-Orchestration Shield

Aizen Gate is the world's most comprehensive AI development framework, combining spec-driven development, multi-agent scrum, model debate, and parallel worktree isolation.

## 🛠️ Installation

```bash
# Install globally via NPM
npm install -g aizen-gate

# Initialize Aizen-Gate in your project
aizen-gate install
```

## 🚀 The 7-Phase Strategic Pipeline

Aizen Gate enforces a rigorous SDLC to ensure zero-defect delivery:

1.  **`specify`** — Elite discovery interview via `[PM]` to create `spec.md`.
2.  **`discuss`** — Pre-planning dialogue to capture gray areas and architectural desires.
3.  **`research`** — Parallel technical research via 4 sub-agents into `research.md`.
4.  **`plan`** — Architectural debate between `[ARCH]` and `[DEV]` with XML decisions.
5.  **`tasks`** — Decomposition into Work Packages (WPs) with dependency mapping.
6.  **`auto`** — Autonomous wave execution. Spawns parallel worktrees per WP.
7.  **`implement`** — (Manual) Focused implementation of a specific WP.
8.  **`review`** — `[QA]` code review with Athena quality gates.
9.  **`merge`** — Topological merging of feature branches into main.

---

## 🏗️ Technical Foundation

### 1. Multi-Agent Team (Aizen Orchestration)

Access the full team via ID tagging. All user requests are handled by **Aizen ([AZ])**, the Superagent, who coordinates the specialized squad:

- **`[AZ]` — Aizen Orchestrator**: Your primary point of contact. Manages delegation and sprint state.
- **`[PM]` — Project Manager**: Discovery, user stories, and acceptance criteria.
- **`[ARCH]` — Lead Architect**: High-level design, model debate, and technical blueprints.
- **`[DEV]` — Implementation Agent**: Code execution, TDD, and isolated wave implementation.
- **`[QA]` — Quality Gate**: Verification, UAT facilitation, and security audit.
- **`[SA]` — Shield Architect**: Framework maintenance, session persistence, and archival.

### 2. 🌀 Automatic AI Lifecycle Management

Aizen monitors your environment to ensure zero-friction orchestration:

- **Auto-Wake**: Instantly resumes your last session when any command is run.
- **Auto-Pause**: Pauses the implementation loop during manual testing or subprocess builds.
- **Idle-Shutdown**: Shuts down after 30 minutes of inactivity to preserve state and token budget.

### 3. 🧠 5-Tier Persistent Memory System

Aizen remembers everything through a hierarchical SQL-backed storage:

1.  **Working Memory (WM)**: Immediate task-specific context.
2.  **Episodic Memory (EM)**: Chronological events and decision history.
3.  **Semantic Memory (SM)**: Technical patterns and project conventions.
4.  **Document Memory (DM)**: specs, architecture, and planning records.
5.  **Long Summary Thread (LST)**: Rolling distillation of the entire session history.

### 4. 🛠️ Dynamic Skill System

Aizen evolves with your project:

- **Auto-Detection**: Scans `package.json`, `go.mod`, etc., to generate relevant skills.
- **Skill Watcher**: Background service that auto-installs skills when you add new dependencies.
- **Manual Import**: Create custom skills by importing official documentation links.

### 5. Aizen-Pulse (Live Dashboard)

Monitor progress in real-time at `http://localhost:6420`. The Kanban board updates automatically move tasks from `Todo` to `Done` based on execution state.

---

## 📦 Universal Platform Support

Aizen Gate detects and installs into every major AI development environment:

- **Claude Code** (`CLAUDE.md`)
- **Cursor** (`.cursorrules`)
- **Gemini CLI** (`GEMINI.md`)
- **GitHub Copilot** (`copilot-instructions.md`)
- **Windsurf** (`.windsurf/rules/`)
- **Kiro / Kilo** (`.kiro/` / `.kilo/`)

---

## 🛠️ CLI Commands Reference

```bash
# Workflow
npx aizen-gate specify    # Start discovery
npx aizen-gate research   # Parallel research
npx aizen-gate plan       # Architecture & Plan
npx aizen-gate tasks      # Generate WPs
npx aizen-gate auto       # Run autonomous loop (w/ Skill Watcher)
npx aizen-gate implement  # Implement specific WP
npx aizen-gate review     # QA Review
npx aizen-gate merge      # Merge to main (Auto-Kanban Update)

# Lifecycle & Memory
npx aizen-gate pause      # Manually pause session
npx aizen-gate resume     # Manually resume session
npx aizen-gate status     # Sprint Board summary
npx aizen-gate tokens     # Token efficiency report

# Skill Management
npx aizen-gate skill add    # Create skill from doc links
npx aizen-gate skill search # Search skill marketplace
npx aizen-gate skill install # Install from awesome-skills

# Visibility & Health
npx aizen-gate dashboard  # Launch web UI
npx aizen-gate map        # Architecture mapping
npx aizen-gate doctor     # Workspace health check
npx aizen-gate benchmark # Protocol audit
npx aizen-gate clean     # [AZ] Archive finished tasks
```

## 📜 Archival Intelligence

The `clean` command is fully automated. It:

1. Moves all "Done" tasks to `backlog/tasks/archive/<dd-mm-yyyy_HH-mm>`.
2. Updates task assignees to `[AZ] - Aizen Orchestrator`.
3. Auto-checks all remaining implementation checklists.
4. Updates `backlog/readme.md` with the latest archive timestamp.

---

**⛩️ [Aizen] Shield System Active.** Every gap has been eliminated. Ready to build the future.
