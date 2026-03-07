---
name: "za-config"
description: "Configure the Aizen-Gate environment, model profiles, and team behavior."
authors: ["Aizen-Gate Team"]
status: "production"
---

# Command: za-config

The configuration and environment tuning phase.

**[SA] Time to tune the engine!** I'm calling in @devops and @analyst.

## 1. Model Profile Selection (Via [DEVOPS] Stark)

- **[DEVOPS] Stark** configures your model profiles:
  - **Quality (High-End)**: GPT-4o, Claude 3.5 Opus. For planning and complex logic.
  - **Balanced (Standard)**: Claude 3.5 Sonnet, GPT-4o-mini. For implementation and research.
  - **Budget (Fast & Cheap)**: Llama-3-70b, GPT-3.5-Turbo. For docs, logs, and simple tasks.

## 2. Integration & Tooling (Via [DEVOPS] Stark)

- **[DEVOPS] Stark** manages your integrations:
  - Configure MCP servers and external tools.
  - Set up API keys and environment variables in `.env`.
  - Link with GitHub/GitLab repositories.

## 3. Team Personality (Via [SA] Bob)

- **[SA] Bob** adjusts the team "Vibe":
  - **Aggressive (Fast)**: Fewer questions, more action.
  - **Cautious (Deep-Plan)**: More debate and verification before code.
  - **Creative (Research-Heavy)**: More brainstorming and experimentation.

## 4. Automation Settings (Via [SA] Bob)

- **[SA] Bob** tunes the autonomous loop:
  - Set circuit breaker limits for `za-auto`.
  - Configure the frequency of **Quality Gates** and **Cost Reports**.

---

**[SA] Configuration updated.** The team is now perfectly tuned for the mission. Ready to build?
