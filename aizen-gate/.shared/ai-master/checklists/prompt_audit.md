# Prompt Audit Checklist

## Pre-Deployment Checklist

### Clarity & Specificity
- [ ] Task is clearly defined in first sentence
- [ ] No ambiguous pronouns or references
- [ ] Output format is explicitly specified
- [ ] Constraints are clearly stated

### Context Management
- [ ] Relevant context provided (not too much, not too little)
- [ ] Examples included for complex tasks (few-shot)
- [ ] Chain-of-thought used for multi-step reasoning
- [ ] Token budget calculated and respected

### Safety & Ethics
- [ ] No requests for harmful content
- [ ] Privacy/PII handling addressed
- [ ] Hallucination prevention measures in place
- [ ] Confidence levels specified for uncertain outputs

### Output Formatting
- [ ] Exact output format demonstrated
- [ ] JSON schemas validated if using JSON
- [ ] Error responses standardized
- [ ] Consistent terminology used

## Runtime Checks

### Performance Monitoring
- [ ] Response time within SLA
- [ ] Token usage tracked
- [ ] Success/failure rate monitored
- [ ] User satisfaction scores collected

### Quality Metrics
- [ ] Accuracy rate measured
- [ ] Consistency score calculated
- [ ] Hallucination rate tracked
- [ ] Latency percentiles recorded

## Iteration Protocol

1. **A/B Testing**: Test prompt variations with real users
2. **Gradual Rollout**: Deploy to 5% → 25% → 100%
3. **Fallback Ready**: Have backup prompt for failures
4. **Rollback Plan**: Quick revert mechanism in place
