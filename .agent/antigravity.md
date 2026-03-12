# Antigravity Integration - Aizen-Gate

## Overview

Aizen-Gate is your superagent coordinator. When you mention @aizen in Antigravity, it will help coordinate the development process.

## How to Use

### Basic Invocation
```
@aizen help me build a login feature
```

### Slash Command
```
/aizen create API for user management
```

### MCP Setup (Recommended)
For full integration, add this to Antigravity Settings → MCP:

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

See `.agent/antigravity-mcp.md` for detailed setup instructions.

## Aizen Workflow

1. **You invoke Aizen** - @aizen or /aizen
2. **Aizen detects** - What type of request (feature, bug, optimization, etc.)
3. **Aizen routes** - Calls appropriate agents
4. **Agents execute** - PM, ARCH, DEV, QA work together
5. **Results returned** - Back in Antigravity chat

## Supported Situations

| Input Type | Aizen Calls |
|------------|-------------|
| New feature | PM → ARCH → DEV |
| Bug fix | DEV → QA |
| Optimization | ARCH → DEV → QA |
| API development | ARCH → BE |
| UI work | DESIGN → FE |
| Code review | QA → SOC |
| Discussion | PM / ARCH |
| Help needed | AZ guides you |

## Agent Tags

- [AZ] - Aizen (your coordinator)
- [PM] - Product Manager
- [BA] - Business Analyst
- [ARCH] - Architect
- [DEV] - Developer
- [BE] - Backend Engineer
- [FE] - Frontend Engineer
- [QA] - Quality Assurance
- [SOC] - Security Engineer
- [DESIGN] - Designer

## Example Interaction

```
You: @aizen I need to add payment to my app

[Aizen] Detected: New Feature - Payment Integration
Calling [PM] → [ARCH] → [DEV]

[PM] Let me clarify requirements:
1. Which payment provider? (Stripe, PayPal, etc.)
2. Payment types? (One-time, Subscription, Both)
3. International support needed?
4. Refund policy requirements?

[ARCH] Recommended Architecture:
- Stripe Connect for scalability
- Webhook handlers for payment events
- PCI compliance via Stripe Elements
- Idempotency keys for retries

[DEV] Implementation Plan:
1. Install stripe npm package
2. Create payment service
3. Add API endpoints (create-payment, confirm-payment, refund)
4. Implement webhook handler
5. Write unit and integration tests

Would you like me to proceed with any specific part?
```

## Fallback Correction

If Aizen misdetects your intent, you can correct it:

```
[F]eature - New feature
[B]ug - Bug fix  
[O]ptimize - Optimization
[D]iscussion - General discussion
[R]eview - Code review
[H]elp - I need help
```

## Aizen Commands

- `@aizen <message>` - Invoke Aizen with your request
- `/aizen` - Slash command
- `/aizen status` - Show current project status
- `/aizen tasks` - Show task board
- `/aizen help` - Show help

## Project Context

Aizen knows about your project from:
- `aizen-gate/shared/project.md` - Project details
- `aizen-gate/shared/memory.md` - Conversation history
- `aizen-gate/shared/board.md` - Task board
- `aizen-gate/PRD/prd.md` - Product requirements

## Quick Start

Just type:
```
@aizen what can you help me with?
```

Aizen will respond with capabilities and ask what you need help with.
