---
name: context-engineering
description: "You MUST use this to optimize the information flow to LLMs. Minimizes noise, maximizes signals, and avoids state pollution."
---

# Skill: Context Engineering (Signal over Noise)

## Overview

Context is the scarcest resource in agentic development. This skill ensures that every token sent to the model is high-value and relevant to the current task.

## The 3 Pillars of Context Engineering

### 1. Pruning (Vertical Reduction)

- Remove irrelevant files from the prompt.
- Use `grep` and `find` to isolate specific logic blocks rather than whole files.
- Truncate long logs; keep only the "Head" and "Error" segments.

### 2. Compression (Horizontal Reduction)

- Summarize long conversations into `shared/memory.md`.
- Use the **Source of Truth** protocol: refer to `project.md` for context instead of repeated explanations.

### 3. Verification (Feedback Loop)

- Check if the agent is hallucinating or confused.
- Inject "State Anchors" (e.g., [CURRENT STATE]) periodically.

---

**[SA] Context optimized.** Clear input leads to precise code.
