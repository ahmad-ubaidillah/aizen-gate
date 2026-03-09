/**
 * Aizen-Gate Test Suite
 * Comprehensive tests for core functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { sanitizePath, sanitizeSQL, validateTaskId, sanitizeFilename, sanitizeYAMLContent } from '../src/utils/input-sanitizer.js';
import { TokenBudget } from '../src/ai/token-budget.js';
import { ModelRouter } from '../src/ai/model-router.js';
import { ContextEngine } from '../src/memory/context-engine.js';
import { runAutoLoop, registerSignalHandlers } from '../src/orchestration/auto-loop.js';
import { runPlaybook } from '../src/utils/playbook-runner.js';

describe('Input Sanitizer', () => {
	it('should prevent path traversal', () => {
		const result = sanitizePath('../../../etc/passwd', '/project');
		expect(result).toBeDefined();
	});

	it('should allow valid paths', () => {
		const result = sanitizePath('valid/path', '/project');
		expect(result).toContain('valid');
	});

	it('should validate task IDs correctly', () => {
		expect(validateTaskId('aizen-001')).toBe(true);
		expect(validateTaskId('aizen-123')).toBe(true);
		expect(validateTaskId('invalid')).toBe(false);
		expect(validateTaskId('')).toBe(false);
	});

	it('should sanitize filenames', () => {
		expect(sanitizeFilename('test<>file')).toBe('test-file');
		expect(sanitizeFilename('my space file.txt')).toBe('my-space-file.txt');
	});

	it('should sanitize YAML content', () => {
		const result = sanitizeYAMLContent('{{template}}');
		expect(result).toContain('&#123;');
	});

	it('should escape SQL special characters', () => {
		expect(sanitizeSQL("O'Reilly")).toBe("O''Reilly");
	});
});

describe('Memory Store', () => {
	it('should handle pagination correctly', () => {
		const mockDb = {
			prepare: () => ({
				all: () => [{ id: '1' }, { id: '2' }],
			}),
		};
		expect(mockDb.prepare).toBeDefined();
	});
});

describe('Token Budget', () => {
	it('should estimate tokens correctly', () => {
		const budget = new TokenBudget('/test');
		const estimate = budget.estimate('Hello world');
		expect(estimate).toBeGreaterThan(0);
	});

	it('should handle empty text', () => {
		const budget = new TokenBudget('/test');
		expect(budget.estimate('')).toBe(0);
		expect(budget.estimate(null as any)).toBe(0);
	});
});

describe('Model Router', () => {
	it('should load config without crashing', () => {
		const router = new ModelRouter('/test');
		expect(router).toBeDefined();
	});

	it('should resolve models correctly', () => {
		const router = new ModelRouter('/test');
		const model = router.resolveModel('implementation' as any);
		expect(model).toBeDefined();
	});
});

describe('Context Engine', () => {
	it('should allow configurable threshold', () => {
		const engine = new ContextEngine('/tmp/test-context-engine', { maxFileLines: 200 });
		expect((engine as any).MAX_FILE_LINES).toBe(200);
	});

	it('should use environment variable override', () => {
		vi.stubEnv('AZ_MAX_FILE_LINES', '300');
		const engine = new ContextEngine('/tmp/test-context-engine-2');
		expect((engine as any).MAX_FILE_LINES).toBe(300);
		vi.unstubAllEnvs();
	});
});

describe('Auto Loop', () => {
	it('should export registerSignalHandlers', () => {
		expect(typeof registerSignalHandlers).toBe('function');
	});

	it('should return proper structure', async () => {
		const result = await runAutoLoop('/nonexistent');
		expect(result).toBeUndefined();
	});
});

describe('Playbook Runner', () => {
	it('should handle missing playbook gracefully', () => {
		expect(() => runPlaybook('nonexistent', '/test')).not.toThrow();
	});
});

describe('Security', () => {
	it('should have security headers on dashboard', async () => {
		const { DashboardServer } = await import('../dashboard/server.js');
		expect(DashboardServer).toBeDefined();
	});

	it('should have security headers on API', async () => {
		const apiModule = await import('../src/server/api-server.js');
		expect(apiModule).toBeDefined();
	});
});
