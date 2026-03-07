# Logic Optimizer: Token Saving & Efficiency (SKILL-016)

Efficient token management is a first-class citizen in Aizen Gate. Every agent must apply these strategies to ensure cost-effective, high-performance orchestration across all 7 phases of the pipeline.

## Core Optimization Strategies

### 1. Output Filtering (RTK-style)

Always use `RTK` filtering for command results before injecting them into context.

- **`git_status`**: Extract summary stats (staged/modified/untracked).
- **`npm_test`**: Show failures and summary stats ONLY. Omit trace headers.
- **`ls_la`**: Compress file listings into a hierarchical summary if >20 items.
- **`json`**: Use schema-only extraction for unknown large datasets.
- **`logs`**: Deduplicate repeated lines with `[×N]` frequency suffixes.

### 2. Semantic Memory Patterns (Mem0-style)

Don't re-send full conversation history. Use the `MemoryStore` to:

- **Classify**: Differentiate between _declarations_ (save to memory) and _queries_ (pull from memory).
- **Extract Facts**: Distill long explanations into single-line atomic facts.
- **Retrieve**: Fetch only the top 3 relevant memories for the current task.

### 3. Context Engineering (Structural)

- **Positional Optimization**: Place critical instructions at the very START and END of a prompt.
- **XML Tagging**: Wrap different context artifacts (`<spec>`, `<plan>`, `<tool_output>`) in clear XML delimiters.
- **Instruction Referencing**: Instead of repeating instructions, reference them by ID or tag.

### 4. Sliding Windows & Compaction

- **Board Pruning**: Archive completed tasks out of the active board once they are reviewed.
- **State.md Sliding Window**: Keep only the 10 most recent project events. Extract facts from older ones before discarding.
- **Artifact Summarization**: If a Spec or Plan exceeds 4K tokens, generate a high-level `Artifact Digest` instead of sending the full file.

### 5. Escalation Routing

- **Haiku/Flash**: Use for classification, summary, and formatting checks.
- **Sonnet/GPT-4o**: Use for standard implementation and implementation planning.
- **Opus/o1**: Use for architecture, deep research, and complex debugging.

## Implementation Workflow (Token-Aware)

| Phase         | Strategy                                              | Budget   |
| ------------- | ----------------------------------------------------- | -------- |
| **Specify**   | Distill raw requirements into atomic user stories.    | 4K       |
| **Research**  | Filter and summarize search/file results.             | 8K       |
| **Plan**      | Focus on clear dependency graphs and WPs.             | 6K       |
| **Tasks**     | Inject only local WP context + recent memory.         | 3K       |
| **Auto**      | Apply RTK filters to every tool output.               | Variable |
| **Implement** | Use Sonnet for implementation, Haiku for small fixes. | Variable |
| **Review**    | Compare diffs against specs using summary stats.      | 4K       |

## Checklist for AI Agents

- [ ] Did I filter this tool output before injecting it into my context?
- [ ] Is my context payload within the phase budget?
- [ ] Have I extracted the key facts from this session for memory store?
- [ ] Am I using the most cost-efficient model for this specific sub-task?

## Anti-Patterns (Avoid)

- **Full History Replay**: Sending more than 5-10 turns of chat history.
- **Redundant Context**: Sending the full spec.md when only one WP is changing.
- **Unfiltered Tool Output**: Dumping 1000 lines of console logs or `cat` output.
- **Mono-Model Locked**: Using Opus for every single API call.
