import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// Exclude e2e tests from vitest - they should run with playwright
		exclude: [
			'**/e2e/**',
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.git/**',
		],
		// Use Node environment
		environment: 'node',
		// Use globals so we don't need to import describe, it, expect etc.
		globals: true,
		// Coverage
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/*.test.{js,ts}',
				'**/*.spec.{js,ts}',
			],
		},
	},
});
