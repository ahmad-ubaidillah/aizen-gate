# Aizen-Gate Playbook: az-research

## Overview

Conduct a deep research phase before technical planning to identify the best tech stack, architecture patterns, and potential pitfalls for a new feature.

## Actors

- **[ARCH] Architect**: Problem definition & technical constraints
- **[DEV] Lead Developer**: Feasibility and library research
- **[SEC] Security**: Security implications and compliance

## Workflow

1. **Intake**: Review `aizen-gate/specs/{feature-slug}/spec.md`.
2. **Parallel Research**: Spawn 4 parallel sub-agents (or simulated parallel passes) to investigate:
   - **Stack Search**: Best libraries/frameworks for the specific requirements.
   - **Pattern Matching**: Architectural patterns (e.g., event-driven, serverless) that fit.
   - **Pitfall Analysis**: Known issues with the chosen stack or common bugs in this domain.
   - **Security Review**: Initial security considerations and best practices.
3. **Consolidation**: Combine findings into `aizen-gate/specs/{feature-slug}/research.md`.
4. **Conclusion**: Recommend a specific tech stack and architecture for `az-plan`.

## Exit Criteria

- A comprehensive `research.md` document exists.
- The Architect provides a high-level recommendation for the implementation plan.
