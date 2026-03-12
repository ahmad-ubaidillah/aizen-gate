# AI Best Patterns Collection

## Prompt Templates

### Classification Prompt
```markdown
Classify the following text into one of these categories: [categories].

Text: {input}

Category:
```

### Extraction Prompt
```markdown
Extract the following entities from the text:
- Person names
- Dates
- Organizations

Text: {input}

Extracted information:
```

### Summarization Prompt
```markdown
Summarize the following text in 3 bullet points, focusing on key insights:

{text}

Summary:
```

### Code Review Prompt
```markdown
Review the following code for:
1. Security vulnerabilities
2. Performance issues
3. Code quality
4. Best practices violations

Code:
```{language}
{code}
```

Review:
```

## Context Injection Patterns

### Pattern 1: Prepending Context
```
[CONTEXT]
{relevant_information}
[/CONTEXT]

User question: {question}
```

### Pattern 2: Few-Shot Examples
```
Example 1:
Input: {example_input}
Output: {example_output}

Example 2:
Input: {example_input}
Output: {example_output}

Now complete:
Input: {actual_input}
```

### Pattern 3: Chain-of-Thought
```
Problem: {problem}

Let's solve this step by step:

Step 1: {first_step}
Step 2: {second_step}
...
Final answer: {answer}
```

## Error Handling Patterns

### Graceful Degradation
1. Detect failure mode
2. Return safe default response
3. Log error for debugging
4. Optionally retry with backoff

###hallucination Prevention
- Always cite sources when using RAG
- Include confidence scores
- Flag uncertain responses
- Implement human-in-the-loop for critical decisions
