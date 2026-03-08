/**
 * Playwright E2E Configuration
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	// Test directory
	testDir: "./tests/e2e",

	// Run tests in parallel
	fullyParallel: true,

	// Fail build on CI if test fails
	forbidOnly: !!process.env.CI,

	// Retry on CI
	retries: process.env.CI ? 2 : 0,

	// Workers on CI
	workers: process.env.CI ? 1 : undefined,

	// Reporter
	reporter: [
		["html", { outputFolder: "playwright-report" }],
		["json", { outputFile: "playwright-report/results.json" }],
		["list"],
	],

	// Shared settings
	use: {
		// Base URL
		baseURL: process.env.BASE_URL || "http://localhost:3000",

		// Collect traces on failure
		trace: "on-first-retry",

		// Collect screenshots on failure
		screenshot: "only-on-failure",

		// Video on failure
		video: "retain-on-failure",
	},

	// Configure projects
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	// Local dev server
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
