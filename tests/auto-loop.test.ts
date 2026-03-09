import { afterEach, describe, expect, test, vi } from "vitest";
import fs from "fs-extra";
import { runAutoLoop } from "../src/orchestration/auto-loop.js";

// Mock the heavy domain classes used inside runAutoLoop
vi.mock("../src/orchestration/worktree-manager.js", () => ({
	WorktreeManager: class {
		createWorktree = vi.fn().mockReturnValue("/tmp/wt/backlog-aizen-001");
	}
}));

vi.mock("../src/orchestration/circuit-breaker.js", () => ({
	CircuitBreaker: class {
		isTripped = vi.fn().mockReturnValue(false);
		recordAttempt = vi.fn();
	}
}));

vi.mock("../src/tasks/task-cli.js", () => ({
	TaskCLI: class {
		edit = vi.fn().mockResolvedValue(true);
	}
}));

vi.mock("../src/memory/context-engine.js", () => ({
	ContextEngine: class {
		assembleWPContext = vi.fn().mockResolvedValue({ files: [] });
		formatXMLPrompt = vi.fn().mockResolvedValue("<xml>task context</xml>");
	}
}));

describe("Aizen-Gate Auto Loop", () => {
	test("Identifies next PENDING task and transitions to In Progress", async () => {
		const mockRoot = "/tmp/project";
		const mockTaskFile = "aizen-001 - task-1.md";
		const mockTaskContent = `---
id: aizen-001
status: Todo
assignee: "@DEV"
---
# Task 1
Description here.
`;

		// Mock fs-extra calls
		vi.spyOn(fs, "existsSync").mockImplementation((p: any) => p.includes("backlog/tasks"));
		vi.spyOn(fs, "readdirSync").mockImplementation((p: any) => {
			if (p.includes("backlog/tasks")) return [mockTaskFile] as any;
			return [] as any;
		});
		vi.spyOn(fs, "readFileSync").mockImplementation((p: any) => {
			if (p.includes(mockTaskFile)) return mockTaskContent;
			return "";
		});
		
		const writer = vi.spyOn(fs, "writeFile").mockImplementation(() => Promise.resolve() as any);

		const result = await runAutoLoop(mockRoot);

		expect(result?.success).toBe(true);
		expect(result).toHaveProperty("wave");
		const wave = (result as { wave: any[] }).wave;
		expect(wave[0].id).toBe("aizen-001");

		expect(writer).toHaveBeenCalled();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
