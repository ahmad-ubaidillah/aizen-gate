# IDE Integration - Aizen-Gate

This folder contains configuration files for integrating Aizen-Gate with various IDEs.

## Supported IDEs

| IDE | Config File | Status |
|-----|-------------|--------|
| Claude Code | `.agent/CLAUDE.md` | ✅ Ready |
| Cursor | `.agent/.cursorrules` | ✅ Ready |
| Windsurf | `.agent/windsurf.md` | ✅ Ready |
| Gemini CLI | `.agent/GEMINI.md` | ✅ Ready |
| Antigravity | `.agent/antigravity.md` + `.agent/antigravity-mcp.md` | ✅ Ready |

## How It Works

1. **User mentions @aizen** in their IDE chat
2. **IDE triggers Aizen** via MCP or command
3. **Aizen processes** the request using agents
4. **Aizen responds** back in the IDE

## Quick Setup

### For Claude Code:
```bash
# Copy the config
cp .agent/CLAUDE.md ./CLAUDE.md
```

### For Cursor:
```bash
# Copy the config  
cp .agent/.cursorrules ./.cursorrules
```

### For Windsurf:
```bash
# Copy the config
cp .agent/windsurf.md ./.windsurf/rules.md
```

### For Gemini CLI:
```bash
# Copy the config
cp .agent/GEMINI.md ./GEMINI.md
```

### For Antigravity (MCP):
```json
{
  "mcpServers": {
    "aizen-gate": {
      "command": "node",
      "args": ["/path/to/aizen-gate/dist/bin/cli.js", "mcp"],
      "env": {}
    }
  }
}
```

See `.agent/antigravity-mcp.md` for full setup instructions.

## Aizen Commands

Once integrated, you can use:

- `@aizen` - Mention Aizen in conversation
- `/aizen` - Use slash command
- `/aizen help` - Show available commands

## Example Usage

```
User: @aizen help me build a login feature

[Aizen] Detected: New Feature
Calling agents: PM → ARCH → DEV

[PM] Let me understand your requirements...
```

## MCP Server (Alternative)

You can also use Aizen's MCP server:

```bash
npx aizen-gate mcp
```

This starts an MCP server that IDEs can connect to for Aizen capabilities.
