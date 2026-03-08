import { afterEach, describe, expect, test, vi } from "vitest";

const fs = require("fs-extra");
const path = require("node:path");
const { runAutoLoop } = require('../dist/src/orchestration/auto-loop.js');

describe("Aizen-Gate Auto Loop", () => {
	test("Identifies next PENDING task and transitions to In Progress", async () => {
		const mockRoot = "/tmp/project";
		const _tasksDir = path.join(mockRoot, "backlog", "tasks");
		const mockTaskFile = "aizen-001 - task-1.md";
		const mockTaskContent = `---
id: aizen-001
status: Todo
assignee: "@DEV"
---
# Task 1
Description here.
`;

		vi.spyOn(fs, "existsSync").mockImplementation((p) => {
			if (p.includes("backlog/tasks")) return true;
			return false;
		});

		vi.spyOn(fs, "readdirSync").mockImplementation((p) => {
			if (p.includes("backlog/tasks")) return [mockTaskFile];
			return [];
		});

		vi.spyOn(fs, "readFileSync").mockImplementation((p) => {
			if (p.includes(mockTaskFile)) return mockTaskContent;
			return "";
		});

		const writer = vi.spyOn(fs, "writeFile").mockImplementation(() => Promise.resolve());
		// Mock TaskCLI's edit which also writes to file
		vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

		const result = await runAutoLoop(mockRoot);

		expect(result.success).toBe(true);
		expect(result.wave).toBeDefined();
		expect(result.wave[0].id).toBe("aizen-001");

		// Verify it called TaskCLI update (which eventually writes to file)
		expect(writer).toHaveBeenCalled();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
