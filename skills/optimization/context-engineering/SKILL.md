---
name: context-engineering
description: "You MUST use this to manage long-lived conversation contexts, prevent context rot, and optimize token usage. Ensures the agent always has the most relevant information without being overwhelmed by noise."
---

# Context Engineering & Context Rot Prevention

## Overview

As conversations grow, LLMs suffer from "context rot" where they lose track of the core objective due to excessive noise. This skill provides techniques to prune, summarize, and restructure context to maintain high performance.

## Core Strategies

1. **The 200K Boundary**: Never exceed 200K tokens of active context. Most reasoning models (Claude 3.5 Sonnet, GPT-4o) perform best when the context is concise ($< 100K$).
2. **Fresh Start Pattern**: When moving between major phases (e.g., from Plan to Build), suggest a "context refresh" to the user.
3. **Fact Extraction**: Periodically move critical decisions, patterns, and state into `shared/memory.md` or `shared/project.md` and then "forget" the chat history by starting a new session or using a summarization hook.

## Process Flow

### 1. Periodic Pruning (Every 5-10 turns)

- Scan the conversation for repetitive info, failed commands, and long stack traces.
- Identify what is **Permanent Knowledge** (move to `memory.md`) vs. **Transient Noise** (ignore).

### 2. State Syncing

- Ensure `shared/state.md` and `shared/board.md` are the "Source of Truth".
- If a conflict exists between the chat history and these files, the files **always win**.

### 3. XML Windowing

- When reading large files, use specific line ranges.
- When outputting large amounts of data, use XML tags to structure it for easier parsing by subagents.

## Implementation: The "Context Refresh"

When you feel the context is becoming "mushy" (repetitive mistakes, ignoring instructions):

1. **Summarize**: Create a `CONTINUE_HERE.md` or use the `continue-here.md` template.
2. **Sync**: Ensure all files are committed and memory is updated.
3. **Notify**: Tell the user: "I'm performing a context refresh to ensure maximum accuracy. I've synced our state to `shared/memory.md` and created a summary in `continue-here.md`."

## Anti-Patterns

- **"The Wall of Text"**: Dumping raw logs or files into context without filtering. Use `rtk`-style filtering.
- **"Ignoring the Files"**: Relying on memory of the chat rather than reading the source files.
- **"Context Hoarding"**: Keeping every single thought in the active window.

---

**[SA] Context optimized.** I'm now operating with 100% clarity on the mission.
