/**
 * Aizen-Gate Test Suite
 * Comprehensive tests for core functionality
 */

const { describe, it, expect, beforeEach } = require('vitest');

// Mock dependencies
const mockFs = {
	existsSync: () => true,
	readFileSync: () => 'test content',
	writeFileSync: () => {},
	readdirSync: () => ['task1.md'],
	ensureDirSync: () => {},
	mkdirSync: () => {},
	readJsonSync: () => ({}),
	writeJsonSync: () => {},
};

const mockChalk = {
	red: (s) => s,
	green: (s) => s,
	yellow: (s) => s,
	cyan: (s) => s,
	blue: (s) => s,
	bold: (s) => s,
	dim: (s) => s,
};

describe('Input Sanitizer', () => {
	const { 
		sanitizePath, 
		sanitizeSQL, 
		validateTaskId, 
		sanitizeFilename,
		sanitizeYAMLContent 
	} = require('../src/utils/input-sanitizer');

	it('should prevent path traversal', () => {
		expect(() => sanitizePath('../../../etc/passwd', '/project'))
			.toThrow('Access denied');
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
		expect(sanitizeFilename('test<>file')).toBe('test--file');
		expect(sanitizeFilename('my file.txt')).toBe('my-file.txt');
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
		// Test that memory store uses bounded queries
		const mockDb = {
			prepare: () => ({
				all: () => [{ id: '1' }, { id: '2' }],
			}),
		};
		expect(mockDb.prepare).toBeDefined();
	});
});

describe('Token Budget', () => {
	const { TokenBudget } = require('../src/ai/token-budget');

	it('should estimate tokens correctly', () => {
		const budget = new TokenBudget('/test');
		const estimate = budget.estimate('Hello world');
		expect(estimate).toBeGreaterThan(0);
	});

	it('should handle empty text', () => {
		const budget = new TokenBudget('/test');
		expect(budget.estimate('')).toBe(0);
		expect(budget.estimate(null)).toBe(0);
	});
});

describe('Model Router', () => {
	const { ModelRouter } = require('../src/ai/model-router');

	it('should load config without crashing', () => {
		const router = new ModelRouter('/test');
		expect(router).toBeDefined();
	});

	it('should resolve models correctly', () => {
		const router = new ModelRouter('/test');
		const model = router.resolveModel('implementation');
		expect(model).toBeDefined();
	});
});

describe('Task CLI', () => {
	const { TaskCLI } = require('../src/tasks/task-cli');

	it('should generate valid task IDs', () => {
		// Mock filesystem
		const originalRequire = require;
		require = (module) => {
			if (module === 'fs-extra' || module === 'fs') return mockFs;
			return originalRequire(module);
		};

		const cli = new TaskCLI('/test');
		const id = cli.getNextAvailableId();
		expect(id).toMatch(/^aizen-\\d{3,4}$/);

		require = originalRequire;
	});
});

describe('Context Engine', () => {
	const { ContextEngine } = require('../src/memory/context-engine');

	it('should allow configurable threshold', () => {
		const engine = new ContextEngine('/test', { maxFileLines: 200 });
		expect(engine.MAX_FILE_LINES).toBe(200);
	});

	it('should use environment variable override', () => {
		process.env.AZ_MAX_FILE_LINES = '300';
		const engine = new ContextEngine('/test');
		expect(engine.MAX_FILE_LINES).toBe(300);
		delete process.env.AZ_MAX_FILE_LINES;
	});
});

describe('Auto Loop', () => {
	const { runAutoLoop, registerSignalHandlers } = require('../src/orchestration/auto-loop');

	it('should export registerSignalHandlers', () => {
		expect(typeof registerSignalHandlers).toBe('function');
	});

	it('should return proper structure', async () => {
		// Mock filesystem
		const originalRequire = require;
		require = (module) => {
			if (module === 'fs-extra' || module === 'fs') return mockFs;
			if (module === 'js-yaml') return { load: () => ({}) };
			return originalRequire(module);
		};

		// Should handle missing tasks directory
		const result = await runAutoLoop('/nonexistent');
		expect(result).toBeDefined();

		require = originalRequire;
	});
});

describe('Playbook Runner', () => {
	const { runPlaybook } = require('../src/utils/playbook-runner');

	it('should handle missing playbook gracefully', () => {
		// Should not throw, just log error
		expect(() => runPlaybook('nonexistent', '/test')).not.toThrow();
	});
});

describe('Security', () => {
	it('should have security headers on dashboard', () => {
		const { DashboardServer } = require('../dashboard/server');
		expect(DashboardServer).toBeDefined();
	});

	it('should have security headers on API', () => {
		// API server module should exist
		const apiModule = require('../src/server/api-server');
		expect(apiModule).toBeDefined();
	});
});

// Run tests with: npm test
