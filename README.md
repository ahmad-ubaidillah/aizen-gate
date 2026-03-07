# ⛩️ Aizen-Gate: The Ultimate AI-Orchestration & Specification Shield (v2.0)

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18-orange.svg" alt="Node Version">
</p>

Aizen-Gate is the world's most comprehensive AI development framework, combining spec-driven development, multi-agent scrum, model debate, and parallel worktree isolation. It provides a rigorous SDLC to ensure zero-defect delivery through a 7-phase pipeline.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [🛠️ CLI Commands](#️-cli-commands)
- [👥 Multi-Agent Team](#-multi-agent-team)
- [🔧 Installation](#-installation)
- [📖 Usage Guide](#-usage-guide)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- **Spec-Driven Development**: Elite discovery interview to create functional specifications
- **Multi-Agent Scrum**: 11 distinct AI personas working in harmony
- **Parallel Execution**: Git worktrees for isolated, parallel task execution
- **Model Debate**: Architectural debates between different AI perspectives
- **Quality Gates**: Athena quality gates for comprehensive code review
- **Live Dashboard**: Real-time progress monitoring at `http://localhost:6420`
- **Skill Marketplace**: 1,200+ skills available via Antigravity library
- **Multi-Platform Support**: Integrates with Claude Code, Cursor, Gemini CLI, Windsurf, and more

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Git
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmad-ubaidillah/aizen-gate.git
cd aizen-gate

# Install dependencies
npm install

# Make CLI executable
chmod +x bin/cli.js

# Link globally (optional)
npm link
```

### Running Aizen-Gate

```bash
# Using npx
npx aizen-gate start

# Or using the CLI directly
node bin/cli.js start

# Check status
node bin/cli.js status

# View help
node bin/cli.js help
```

---

## 🏗️ Architecture

### The 7-Phase Dominance Pipeline

Aizen-Gate 2.0 enforces a rigorous SDLC:

| Phase | Command | Description |
|-------|---------|-------------|
| 1. Specify | `za-specify` | Elite discovery interview via `[PM]` to create functional `spec.md` |
| 2. Research | `za-research` | Parallel technical research via 4 sub-agents into `research.md` |
| 3. Plan | `za-plan` | Architectural debate between `[ARCH]` and `[DEV]` with XML decisions |
| 4. Tasks | `za-tasks` | Decomposition into Work Packages (WPs) with dependency mapping |
| 5. Auto | `za-auto` | Autonomous wave execution. Spawns parallel worktrees per WP |
| 6. Implement | `za-implement` | (Manual) Focused implementation of a specific WP |
| 7. Review | `za-review` | `[QA]` code review with Athena quality gates |
| 8. Merge | `za-merge` | Topological merging of feature branches into main |

### Directory Structure

```
aizen-gate/
├── agents/              # AI Agent definitions (11 personas)
├── bin/                 # CLI entry point
├── commands/            # Command definitions (za-*)
├── dashboard/           # Web dashboard
├── docs/                # Documentation
├── installer/           # Installation scripts
├── scripts/             # Core utilities
├── shared/              # Shared state and memory
├── skill-creator/       # Skill generation
├── skills/              # Skill library
├── templates/           # Project templates
├── tests/               # Test files
├── workflows/           # CI/CD workflows
├── module.yaml          # Module configuration
├── package.json         # Dependencies
└── profiles.yaml        # Agent profiles
```

---

## 🛠️ CLI Commands

### Main Workflow Commands

```bash
# Start a new project
npx aizen-gate specify    # Start discovery interview
npx aizen-gate research   # Parallel technical research
npx aizen-gate plan       # Plan & Model Debate
npx aizen-gate tasks      # Create Work Packages
npx aizen-gate auto       # Run autonomous implementation wave
npx aizen-gate implement  # Implement specific WP
npx aizen-gate review     # QA verification gate
npx aizen-gate merge      # Merge to main & cleanup
```

### Skill Management

```bash
# Search skills in the marketplace
npx aizen-gate skill search <query>

# Install a skill
npx aizen-gate skill install <id>

# List installed skills
npx aizen-gate skill list
```

### Maintenance & Diagnostics

```bash
# Launch Real-Time Dashboard (Aizen-Pulse)
npx aizen-gate dashboard

# Audit protocol compliance
npx aizen-gate benchmark

# Workspace diagnostics
npx aizen-gate doctor

# Archive knowledge into memory
npx aizen-gate archive
```

### Additional Commands

```bash
# View help
npx aizen-gate help

# Check current status
npx aizen-gate status

# Configure settings
npx aizen-gate config
```

---

## 👥 Multi-Agent Team (11 Personas)

Aizen-Gate features 11 distinct AI personas, each with specialized roles:

| Tag | Agent | Role |
|-----|-------|------|
| `[PM]` | Product Manager | Requirements gathering, PRD creation |
| `[ARCH]` | Architect | System design, technical decisions |
| `[DEV]` | Developer | Implementation, coding |
| `[QA]` | QA Engineer | Testing, quality assurance |
| `[DES]` | Designer | UI/UX design |
| `[DB]` | Database Engineer | Database design, migrations |
| `[DEVOP]` | DevOps | Deployment, CI/CD |
| `[SEC]` | Security | Security audits, vulnerability scanning |
| `[SM]` | Scrum Master | Sprint planning, backlog management |
| `[AN]` | Analyst | Data analysis, research |
| `[QF]` | Quick Flow | Rapid prototyping |

### Using Agents

Reference agents in your prompts using their tags:

```
You're working with [ARCH] on the system design.
[PM] needs to review the requirements.
[DEV], please implement the API endpoint.
```

---

## 🔧 Installation

### Global Installation (Recommended)

```bash
npm install -g aizen-gate

# Verify installation
aizen-gate --version
```

### Local Installation

```bash
npm install aizen-gate --save-dev
```

### Platform-Specific Setup

#### Claude Code
Aizen-Gate automatically integrates via `CLAUDE.md`. When Claude Code starts in the project directory, it will load Aizen-Gate configurations.

#### Cursor
Add Aizen-Gate rules to `.cursorrules`:
```
# Import Aizen-Gate rules
@./.cursorrules
```

#### Windsurf
Rules are automatically loaded from `.windsurf/rules/`.

---

## 📖 Usage Guide

### Starting a New Project

1. **Initialize the project**:
   ```bash
   npx aizen-gate specify
   ```
   This starts a discovery interview with the Product Manager agent.

2. **Research phase**:
   ```bash
   npx aizen-gate research
   ```
   Parallel research by 4 sub-agents.

3. **Planning**:
   ```bash
   npx aizen-gate plan
   ```
   Architectural debate and decision recording.

4. **Task breakdown**:
   ```bash
   npx aizen-gate tasks
   ```
   Create Work Packages with dependencies.

5. **Implementation**:
   ```bash
   npx aizen-gate auto
   ```
   Or implement specific packages:
   ```bash
   npx aizen-gate implement --package=auth
   ```

6. **Review & Merge**:
   ```bash
   npx aizen-gate review
   npx aizen-gate merge
   ```

### Using the Dashboard

Start the real-time dashboard:
```bash
npx aizen-gate dashboard
```

Access at: `http://localhost:6420`

Features:
- Real-time progress tracking
- Sprint goal monitoring
- Activity logs
- Agent status

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [Documentation](./docs/)
- [API Reference](./docs/api-reference.md)
- [User Guide](./docs/user-guide.md)
- [Architecture Decision Records](./docs/adr/)

---

<p align="center">
  <strong>⛩️ [Aizen] Shield System Active.</strong><br>
  Every gap has been eliminated. Ready to build the future.
</p>
