# AI Master - LLM Patterns & RAG Best Practices

## Overview
This module provides comprehensive guidelines for prompt engineering, RAG architecture, and context management for AI-powered applications.

## Prompt Engineering Patterns

### 1. Chain of Thought (CoT)
```
Task → Reasoning Steps → Final Answer
```
- Break complex problems into sequential reasoning steps
- Include examples in prompts for few-shot learning
- Use "Let me think step by step" prefix for math/logic tasks

### 2. ReAct (Reasoning + Acting)
```
Thought → Action → Observation → Thought...
```
- Combine reasoning with tool/actions
- Useful for multi-step tasks requiring external data
- Format: `Thought: {reasoning}\nAction: {tool}\nObservation: {result}`

### 3. Self-Consistency
- Generate multiple reasoning paths
- Select most consistent answer via majority voting
- Improves reliability for complex推理 tasks

## RAG Architecture

### Components
1. **Document Processing**
   - Chunk size: 500-1000 tokens optimal
   - Overlap: 10-20% for context continuity
   - Metadata extraction for filtering

2. **Vector Store**
   - Recommended: Pinecone, Weaviate, Qdrant
   - Use semantic embeddings (text-embedding-3-small)
   - Implement hybrid search (dense + sparse)

3. **Retrieval Strategy**
   - Query expansion with LLM
   - Re-ranking with cross-encoder
   - Maximum relevance threshold: 0.7

### Context Management

#### Token Budget Strategy
```
System: 2000 tokens
Context (RAG): 4000 tokens
User Input: 1000 tokens
Reserved: 1000 tokens
─────────────────────
Total: 8000 tokens
```

#### Conversation History
- Summarize after 10 turns
- Keep last 5 turns full context
- Use sliding window for long conversations

## Best Practices

| Pattern | Use Case | Example |
|---------|----------|---------|
| Few-shot | Classification | Provide 3 labeled examples |
| Zero-shot | Simple tasks | Direct instruction without examples |
| Chain | Multi-step | "First X, then Y, finally Z" |
| Tree-of-Thought | Exploration | Generate and evaluate multiple paths |

## Tools & Libraries
- LangChain, LlamaIndex for orchestration
- LangSmith for prompt evaluation
- Weights & Biases for tracing
