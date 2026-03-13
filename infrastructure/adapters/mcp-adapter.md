---
name: mcp-adapter
type: adapter
---

# MCP (Model Context Protocol) Adapter

## Overview

Designed to facilitate communication between Aizen-Gate agents and MCP-compatible servers.

## Communication Pattern

1. **Protocol Handshake**: Agents check for available MCP tools via the MCP host.
2. **Execution Selection**: The Scrum Master [SA] selects the most relevant tool (e.g., search_web, codebase_search) based on the current skill requirement.
3. **Response Serialization**: Tools return standard JSON responses, which are converted back into the [SA] dialogue format.

---

**[SA] Adapters active.** Connecting the framework to the world.
