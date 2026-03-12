# Antigravity MCP Configuration

## Auto-Start Behavior

With this MCP configuration, Aizen-Gate services will **automatically start** when you first chat with @aizen:

1. First time: You type `@aizen help` → Antigravity spawns MCP server → Services start
2. Subsequent times: IDE auto-connects to already-running MCP server
3. After restart: IDE auto-reconnects and spawns if needed

**No manual start required!**

## Setup

Go to Settings → MCP, and add this config:

```json
{
  "mcpServers": {
    "aizen-gate": {
      "command": "node",
      "args": ["/Users/user/Documents/New Project/aizen-gate/dist/bin/cli.js", "mcp"],
      "env": {}
    }
  }
}
```

## Alternative: Via npx

If you prefer npx (without absolute path):

```json
{
  "mcpServers": {
    "aizen-gate": {
      "command": "npx",
      "args": ["-y", "aizen-gate", "mcp"],
      "env": {}
    }
  }
}
```

## Note

Aizen-Gate MCP doesn't need API key because:
- All agents run locally
- No external AI API calls

## Usage

After setup:
1. Restart Antigravity
2. Type `@aizen help` or `/aizen help`
3. Aizen will auto-start and respond!

## Troubleshooting

If MCP doesn't auto-start:
- Make sure the path to cli.js is correct
- Check Antigravity MCP settings are enabled
- Try restarting Antigravity
