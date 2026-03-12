# Aizen-Gate Quick Start Guide

Welcome to Aizen-Gate! This guide will help you get started in 5 minutes.

---

## What is Aizen-Gate?

Aizen-Gate is your AI development assistant that coordinates multiple specialized agents:
- **PM** - Product Manager (requirements & planning)
- **Architect** - System design
- **Developer** - Code implementation
- **QA** - Testing & quality assurance
- **Security** - Security reviews

Just chat with Aizen in your IDE and it will coordinate the right agents for your task.

---

## Quick Setup (3 Steps)

### Step 1: Install

```bash
npm install -g aizen-gate
```

### Step 2: Choose Your IDE

Aizen-Gate works with your existing IDE. Choose one:

| IDE | Setup File |
|-----|------------|
| Antigravity | `.agent/antigravity-mcp.md` |
| Claude Code | `.agent/CLAUDE.md` |
| Cursor | `.agent/.cursorrules` |
| Windsurf | `.agent/windsurf.md` |
| Gemini CLI | `.agent/GEMINI.md` |

### Step 3: Configure MCP

For IDEs that support MCP (Antigravity, Claude Code, Cursor, Windsurf):

1. Open your IDE's Settings → MCP
2. Add this config:

```json
{
  "mcpServers": {
    "aizen-gate": {
      "command": "node",
      "args": ["path/to/aizen-gate/dist/bin/cli.js", "mcp"],
      "env": {}
    }
  }
}
```

**Note:** Replace `path/to/aizen-gate` with your actual installation path.

---

## Start Using Aizen

### In Your IDE

Just type:

```
@aizen help me build a login feature
```

Aizen will:
1. Detect your request (feature, bug, optimization, etc.)
2. Call the appropriate agents
3. Work with you to complete the task

### Available Commands

- `@aizen help` - Get help
- `@aizen build [feature]` - Build a feature
- `@aizen fix [issue]` - Fix a bug
- `@aizen review [code]` - Review code
- `@aizen plan [project]` - Create a plan/PRD

---

## Understanding Aizen Responses

Aizen responses include agent tags:

```
[AZ] I understand you want to build a login feature.
Calling [PM] → [ARCH] → [DEV]...

[PM] Let me clarify requirements:
1. What authentication method?
2. ...

[ARCH] Based on requirements, I recommend:
- JWT tokens
- bcrypt for password hashing
- ...

[DEV] Implementation plan:
1. Create user model
2. Add login endpoint
3. ...
```

### Agent Tags

- **[AZ]** - Aizen (coordinator)
- **[PM]** - Product Manager
- **[ARCH]** - Architect
- **[DEV]** - Developer
- **[QA]** - Quality Assurance
- **[SOC]** - Security Engineer

---

## Troubleshooting

### MCP not connecting?

1. Check the path in your MCP config is correct
2. Restart your IDE
3. Try running manually:
   ```bash
   npx aizen-gate mcp
   ```

### Need help?

```bash
npx aizen-gate help
```

---

## What's Next?

- Check out `.agent/` folder for IDE-specific configs
- Read `AIZEN.md` for advanced configuration
- Explore `kanban/` folder for task management

---

**Happy coding with Aizen! 🚀**
