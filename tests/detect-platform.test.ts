import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import fs from "node:fs";
import { detectPlatform } from "../installer/src/detect-platform.js";

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
		vi.spyOn(fs, "existsSync").mockImplementation((p: any) => p.includes(".cursor"));
		expect(detectPlatform()).toBe("cursor");
	});

	test("Detects Antigravity (Gemini) from home env", () => {
		vi.spyOn(fs, "existsSync").mockReturnValue(false);
		vi.stubEnv("GEMINI_HOME", "/root/.gemini");
		expect(detectPlatform()).toBe("antigravity");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});
});
