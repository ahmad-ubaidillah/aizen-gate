import { describe, it, expect } from 'vitest';
const { TokenBudget } = require('../scripts/token-budget');
const { OutputFilter } = require('../scripts/output-filter');

describe('Token Efficiency System', () => {
  const budget = new TokenBudget(process.cwd());
  const filter = new OutputFilter();

  it('should estimate tokens correctly using word boundaries', () => {
    const text = "Hello world, this is a test of the token estimation logic.";
    const estimated = budget.estimate(text);
    expect(estimated).toBeGreaterThanOrEqual(12);
    expect(estimated).toBeLessThanOrEqual(18);
  });

  it('should filter Git Status into compact stats', () => {
    const gitStatusRaw = `
modified:   scripts/token-budget.js
modified:   scripts/output-filter.js
Untracked files:
	tests/smoke.js
`;
    const filteredStatus = filter.filter(gitStatusRaw, 'git_status');
    expect(filteredStatus).toContain('Git Status:');
    expect(filteredStatus).toContain('modified');
    expect(filteredStatus).toContain('[RTK Compact Stats]');
  });

  it('should filter Test Output to keep only failures and stats', () => {
    const testOutputRaw = `
 FAIL  tests/logic.test.js
  ✕ should fail (10ms)
    Error: expect(received).toBe(expected)
Tests:       1 failed, 1 total
`;
    const filteredTest = filter.filter(testOutputRaw, 'npm_test');
    expect(filteredTest).toContain('FAIL');
    expect(filteredTest).toContain('Error:');
    expect(filteredTest).toContain('Tests:');
  });

  it('should enforce budget by truncating huge content', async () => {
    const hugeContent = "A".repeat(20000);
    const enforced = await budget.enforce('spec', hugeContent);
    expect(enforced.length).toBeLessThan(hugeContent.length);
    expect(enforced).toContain('[Aizen Token Budget Enforced:');
  });
});
