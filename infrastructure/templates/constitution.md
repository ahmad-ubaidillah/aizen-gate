# Aizen-Gate Constitution

This is the project's living architectural DNA. All agents (especially `[SA]` and `[DEV]`) must read this document before planning or implementing any features.

## Principles

1. **Quality over Speed**: If an implementation feels fragile, stop and debate with `[ARCH]`.
2. **Atomic Work Packages**: No Work Package should take more than 1 day. If they do, they must be broken down.
3. **Traceability**: All code changes must correlate to a WP inside `.worktrees/{featureSlug}-{wpId}`.
4. **No Secrets**: Never hardcode API keys, passwords, or PII. Use environment variables.

## Architectural Mandates

- **Language**: [Insert Language e.g., TypeScript]
- **Framework**: [Insert Framework e.g., Next.js App Router]
- **State Management**: [Insert State e.g., Zustand]
- **Testing**: [Insert Testing stack e.g., Jest / RTL]

_(Agents must refuse to build solutions that violate these architectural mandates unless explicitly forced by the user)._
