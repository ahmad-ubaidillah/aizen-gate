# ⛩️ Aizen-Gate: The Premier AI-Orchestration & Specification Shield

<p align="center">
  <img src="https://img.shields.io/npm/v/aizen-gate?style=for-the-badge&color=EB5757&logo=npm" alt="NPM Version">
  <img src="https://img.shields.io/badge/Status-Active%20Shield-27AE60?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Security-Hardened-2D9CDB?style=for-the-badge" alt="Security">
</p>

---

## 🆕 Implemented Features (2026 Enhancement)

All 6 phases of the Aizen-Gate Enhancement have been completed:

| Feature | Description | Status |
|---------|-------------|--------|
| **Enhanced Onboarding** | 7-question wizard with project style selection (Fast/Medium/Slow) | ✅ DONE |
| **PRD Conditional Flow** | Smart detection - load existing PRD or create new with PM+BA agents | ✅ DONE |
| **Agent Tags System** | Clear identification with [PM], [DEV], [QA], [ARCH], [AZ] tags | ✅ DONE |
| **Situation Detection** | Auto-detect intent (feature/bug/optimization/review/discussion) | ✅ DONE |
| **AI Questions with Suggestions** | Multi-choice options with pros/cons and recommendations | ✅ DONE |
| **Review Retry Loop** | 3-attempt retry with diff reports and rejection tracking | ✅ DONE |
| **Fallback Correction** | User can correct misdetected intents with [F], [B], [O], [D] commands | ✅ DONE |
| **Auto-Skill Trigger** | Keyword-based skill activation (security, database, testing, etc.) | ✅ DONE |
| **Token Management** | Budget tracking and context summarization every 20 messages | ✅ DONE |

### New CLI Commands

```bash
npx aizen-gate specify    # Discovery wizard with AI suggestions
npx aizen-gate plan        # Architectural blueprint design
npx aizen-gate tasks       # Work package decomposition
npx aizen-gate auto        # Autonomous execution loop
npx aizen-gate status      # View Scrum Board & Memory
npx aizen-gate dashboard  # Real-time progress (port 6420)
```

### New Folder Structure

```
aizen-gate/
├── agents/                    # All agents (unified - MD + YAML)
│   ├── legacy/               # Legacy YAML agents
│   ├── pm.agent.md
│   ├── developer.agent.md
│   └── ...
├── skills-reference/         # 1200+ skills (Antigravity)
│   └── skills/
├── rules/                    # Rules system (11 files)
├── prd/
├── shared/
│   └── memory.db            # SQLite database
├── kanban/                   # Task board
└── dashboard/                # Web dashboard
```

### Documentation

For detailed documentation, see:
- **[AIZEN.md](./AIZEN.md)** - Agent configuration and identity
- **[ONBOARDING.md](./ONBOARDING.md)** - Setup guide for new users
- **[AGENTS.md](./AGENTS.md)** - Agent system documentation

---

## 🏛️ What is Aizen-Gate?

**Aizen-Gate** is a high-tier AI-Orchestration framework (Elite AI-SDLC) that transforms standard AI interactions into a professional, multi-agent Software Development Life Cycle (SDLC) execution.

It is not just a set of instructions; it is a **"Gate"** that ensures every line of code written by an AI follows high-quality standards, remains documented, and operates within a razor-sharp contextual memory.

> [!IMPORTANT]
> **Aizen-Gate** is more than a chatbot. It is an operating system for AI Agents, managing specifications, planning, and implementation in one seamless workflow.

---

## 🎯 Why Aizen-Gate?

When developing applications with AI, we often face three major hurdles:

1. **Context Rot:** AI begins to forget initial instructions or hallucinates as project complexity grows.
2. **Standard Leakage:** AI-generated code lacks architectural consistency or aesthetic standards.
3. **Task Fragmentation:** Managing complex features in parallel without breaking the main codebase is difficult.

**Aizen-Gate** eliminates these gaps by providing a **"Shield"** that guarantees project integrity from start to finish.

---

## 💻 Tech Stack & Architecture

Aizen-Gate is built on a modern foundation for maximum performance and security:

- **Core Engine:** **100% TypeScript** with ESM modules for type safety and long-term maintainability.
- **Embedded Intelligence:** **node-llama-cpp** hosting `qwen2.5-0.5b` locally for zero-latency distillation and task planning (No Ollama required!).
- **Unified Memory:** Synchronous **better-sqlite3** backend with the **12-Core Intelligence Tiering** (Working, Semantic, Episodic, Procedural, etc.).
- **Logic Recall:** **@xenova/transformers** (BGE-Micro-V2) for ultra-lightweight semantic indexing.
- **Addressing:** Built on the **OpenViking URI Protocol** (`agent://space/agent/topic`) for deterministic logic routing.
- **UI Aesthetics:** **Vanilla CSS** with a premium, responsive minimalist editorial style.

---

## 🏗️ Core Components & Features

Aizen-Gate consolidates powerful tools into a unified ecosystem:

| Component | Utility |
| :--- | :--- |
| **`specify` Wizard** | An interactive interview process that turns abstract ideas into bullet-proof `spec.md` files. |
| **Kanban Agent** | Physical state mapping using `/kanban` directories (`backlog`, `dev`, `test`, `done`). |
| **AI Context Bridge** | Auto-generated `CURRENT_SPRINT.md` that keeps AI agents aligned with active tasks. |
| **12-Core Fusion** | A neural-backed memory system that distills raw text into logic nuggets. |
| **Immune System** | Self-healing memory logic that deprioritizes "BROKEN" reasoning paths. |
| **Autonomous Loop** | Executes implementations in isolated Git Worktrees per task. |

---

## 🚀 Installation Guide

You can install Aizen-Gate globally or run it directly via NPX.

### 1. Global Installation

```bash
npm install -g aizen-gate
```

### 2. Initialize the Shield in Your Workspace

Navigate to your project directory and run:

```bash
aizen-gate install
```

_This prepares the `aizen-gate/` folder structure, installs the `constitution.md`, and configures local persistent memory._

---

## 🛠️ Elite Workflow (How to Start)

Follow the 7-phase dominance pipeline for zero-defect results:

1. **Discovery:**

   ```bash
   npx aizen-gate specify
   ```

   _Launch the PM wizard to build the implementation spec._

2. **Planning:**

   ```bash
   npx aizen-gate plan
   ```

   _The Lead Architect designs the architectural blueprint._

3. **Tasking:**

   ```bash
   npx aizen-gate tasks
   ```

   _Decompose the plan into Work Packages (WPs) with clear dependencies._

4. **Execution:**

   ```bash
   npx aizen-gate auto
   ```

   _Trigger the autonomous loop. AI agents start working in parallel isolated branches._

5. **Monitoring:**
   ```bash
   npx aizen-gate dashboard
   ```
   _Visualize real-time pulse and progress in your browser (port 6420)._

---

## 🧪 CLI Commands Reference

### Workflow & Orchestration

```bash
npx aizen-gate research   # Parallel technical deep-dives
npx aizen-gate review     # Perform QA review on finished work
npx aizen-gate merge      # Final branch merging and cleanup
npx aizen-gate quick      # Fast-track a small feature or bug fix
```

### Intelligence & Diagnostics

```bash
npx aizen-gate status     # View Scrum Board & Memory state
npx aizen-gate kanban init # Bootstrap Kanban environment
npx aizen-gate kanban sync # Refresh AI context manifest
npx aizen-gate tokens     # View token usage & efficiency report
```

---

## 💎 How Aizen-Gate Empowers Development

Aizen-Gate shifts your workflow from **"Writing Code"** to **"Directing Vision"**:

- **Cost Efficiency:** Local embeddings and context distillation significantly cut down API token costs.
- **Safe Isolation:** Every task is executed in a separate "Worktree." A failure in one feature never corrupts another.
- **Elite Quality:** With Athena Quality Gates, every completed task is audited by a QA agent before merging is allowed.
- **Scalability:** Manage massive projects with thousands of files while keeping the AI's understanding razor-sharp.

---

<p align="center">
  <strong>⛩️ [Aizen] Shield System Active. Ready to build the future.</strong><br>
  <em>"Every gap has been eliminated. Welcome to the elite tier of AI development."</em>
</p>
