# GEMINI.md - Gemini CLI Integration

## Aizen-Gate Overview

Aizen-Gate is a superagent that coordinates multiple specialized agents for software development.

## Invocation

When user mentions @aizen or uses /aizen, invoke Aizen to coordinate agents.

## Supported Agents

| Tag | Role |
|-----|------|
| [AZ] | Aizen Coordinator |
| [PM] | Product Manager |
| [BA] | Business Analyst |
| [ARCH] | Architect |
| [DEV] | Developer |
| [BE] | Backend Engineer |
| [FE] | Frontend Engineer |
| [QA] | Quality Assurance |
| [SOC] | Security Engineer |
| [DESIGN] | Designer |

## Situation Detection

Aizen automatically detects the type of request:
- **Feature** - New feature development → PM → ARCH → DEV
- **Bug** - Bug fix → DEV → QA
- **Optimization** - Performance → ARCH → DEV → QA
- **Discussion** - Planning/ideas → PM / ARCH
- **Review** - Code review → QA → SOC
- **Help** - User needs guidance → AZ guides user

## Example Usage

```
User: @aizen build me an API

[AZ] Detected: New Feature (API Development)
Calling [ARCH] → [BE]

[ARCH] API Design:
- RESTful endpoints
- OpenAPI 3.0 specification
- JWT authentication
- Rate limiting

[BE] Implementation:
- Express.js server
- Express Validator
- Mongoose models
- Jest tests
```

## Commands

- `@aizen` - Invoke Aizen
- `/aizen` - Slash command
- `/aizen help` - Help

## Aizen Capabilities

- PRD creation
- Architecture design
- Code implementation
- Testing & QA
- Security reviews
- Database design
- DevOps planning
