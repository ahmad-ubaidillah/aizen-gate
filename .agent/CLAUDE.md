# CLAUDE.md - Claude Code Integration

This file instructs Claude Code how to work with Aizen-Gate.

## Aizen-Gate Overview

Aizen-Gate is a superagent coordinator that helps you build software by orchestrating specialized agents (PM, Developer, QA, Architect, etc.).

## When to Invoke Aizen

Invoke Aizen when the user:
- Mentions @aizen in their message
- Asks for help with building features
- Wants to create a PRD or specification
- Needs multiple agents to work together
- Asks about architecture or planning

## How Aizen Works

1. **Situation Detection** - Aizen analyzes what the user needs
2. **Agent Routing** - Calls appropriate agents (PM, ARCH, DEV, QA, etc.)
3. **Execution** - Agents work together to accomplish the task
4. **Response** - Results are presented with agent tags

## Agent Tags

Aizen responses include agent tags:
- [AZ] - Aizen (coordinator)
- [PM] - Product Manager
- [BA] - Business Analyst  
- [ARCH] - Architect
- [DEV] - Developer
- [QA] - Quality Assurance
- [SOC] - Security Engineer

## Example Interactions

```
User: @aizen help me build a login feature

[AZ] I detected this as a new feature request.
Calling [PM] + [ARCH] + [DEV]...

[PM] Let me clarify the requirements:
1. What authentication method? (Email/Password, Social, SSO)
2. What should happen on successful login?
3. Any security requirements?

[ARCH] Based on requirements, I recommend:
- JWT tokens with refresh token rotation
- Password hashing with bcrypt
- Rate limiting on login attempts

[DEV] I'll implement this using:
- Backend: Express.js with JWT
- Database: User table with hashed passwords
- API: /login, /register, /refresh endpoints
```

## Commands

- `@aizen` - Invoke Aizen
- `/aizen help` - Show available commands

## Aizen Capabilities

Aizen can help with:
- Feature planning and PRD creation
- Architecture design
- Code implementation
- Testing and QA
- Security reviews
- Database design
- DevOps setup

## Integration

Aizen runs as:
- CLI: `npx aizen-gate <command>`
- MCP Server: `npx aizen-gate mcp`

When you need Aizen's capabilities, invoke it and let it coordinate the agents.
