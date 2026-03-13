# ⛩️ [Aizen] Rule: Hybrid AI Protocol

This rule defines how Aizen-Gate functions in "Ultra-Lite" vs "Full AI" modes.

## 1. Dependency Integrity
- Core features (Kanban, CLI, Manifest) MUST NOT depend on `node-llama-cpp` or `transformers`.
- AI features MUST be lazy-loaded and guarded with `try-catch`.

## 2. Global Cache First
- All heavy artifacts (Models, Skills) MUST reside in `~/.aizen-gate/`.
- Project root MUST remain under 50MB (excluding node_modules).

## 3. Fallback Hierarchy (Resilience)
If local AI binaries are missing:
1.  **Search**: Use Jaccard Similarity (Intersection over Union).
2.  **Expansion**: Request synonym list from the AI Assistant (Agent).
3.  **Distillation**: Use Regex Heuristics or Agent-Assisted distillation.

## 4. User UX
- Never throw "Module Not Found" errors to the user.
- Instead, suggest running `npx aizen-gate doctor` to upgrade the platform.
