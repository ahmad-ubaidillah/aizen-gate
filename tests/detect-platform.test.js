import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const fs = require("node:fs");
const _path = require("node:path");
const { detectPlatform } = require("../installer/src/detect-platform");

describe("AI Platform Detector", () => {
	beforeEach(() => {
		vi.stubEnv("CLAUDE_CODE_VERSION", "");
		vi.stubEnv("CURSOR_VERSION", "");
		vi.stubEnv("GEMINI_HOME", "");
		vi.stubEnv("GITHUB_COPILOT_CMD", "");
	});

	test("Detects Claude Code from environment variable", () => {
		vi.stubEnv("CLAUDE_CODE_VERSION", "1.0.0");
		expect(detectPlatform()).toBe("claude-code");
	});

	test("Detects Cursor from filesystem", () => {
		vi.spyOn(fs, "existsSync").mockImplementation((p) => p.includes(".cursor"));
		expect(detectPlatform()).toBe("cursor");
	});

	test("Detects Antigravity (Gemini) from home env", () => {
		vi.stubEnv("CLAUDE_CODE_VERSION", "");
		vi.stubEnv("GEMINI_HOME", "/root/.gemini");
		expect(detectPlatform()).toBe("antigravity");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});
});
