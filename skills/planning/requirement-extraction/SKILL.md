---
name: requirement-extraction
description: Use when receiving raw ideas, feature requests, or vague chat input from a user. Extracts and structures requirements before any implementation or planning.
---

# Skill: Requirement Extraction

## Overview

Users rarely provide complete specifications upfront. They provide "raw ideas." The Business Analyst ([BA]) must extract the true business logic, constraints, and edge cases from these ideas before any code is written or architecture is planned.

## When to Use

- A new conversation starts with a feature request.
- The user provides "raw chat" about something they want to build.
- Prior to creating a PRD or `project.md`.

## Core Process: The Extraction Dialogue

1. **Initial Parsing**
   - Read the user's raw input.
   - Separate **Implicit Needs** from **Explicit Requests**.
     (e.g., Request: "I want an auth page." Need: "Secure user session management.")

2. **The 5 Ws & 1 H (Questioning Phase)**
   If the requirements are vague, the [BA] must ask the user up to 3 focused questions to clarify:
   - **Who** is the primary user?
   - **What** is the core transaction or state change?
   - **Where** does this data live?
   - **When** are the edge cases triggered?
   - **Why** are we building this? (Value proposition)
   - **How** does it integrate with existing systems?

3. **Structuring the Output**
   Once clarity is achieved, generate a structured requirement list.

## Implementation: The Structured Output

Format the extracted requirements into a clean list categorized by priority:

```markdown
### Primary Requirements (Must-Have)

- [Requirement 1] (e.g., User must be able to log in with Email/Password)
- [Requirement 2]

### Edge Cases & Negative Flows

- What happens if [Condition A] fails?
- How to handle [Invalid Input B]?

### Technical Constraints

- Must integrate with [System X].
- Must complete within [Latency Budget].
```

## Anti-Patterns

- **Assuming the Implementation**: Do not start writing SQL schemas or React components during extraction. The [BA] gathers _what_, not _how_.
- **Accepting Ambiguity**: Never accept "just make it work." Define what "work" means objectively.
- **Over-Questioning**: Don't bombard the user with 20 questions. Group them into max 2-3 logical prompts.

---

**[BA] Requirements locked.** We now know exactly what value we are delivering.
