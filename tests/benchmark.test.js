import { afterEach, describe, expect, test, vi } from "vitest";
const fs = require("fs-extra");
const path = require("node:path");
const { runBenchmark } = require("../dist/src/quality/benchmark.js");

describe("Aizen-Gate Benchmark Evaluation", () => {
	test("Calculates perfect score when all artifacts are valid", async () => {
		const mockRoot = "/tmp/project";
		const saDir = path.join(mockRoot, "aizen-gate");
		const _sharedDir = path.join(saDir, "shared");

		vi.spyOn(fs, "existsSync").mockImplementation((p) => {
			// Structural checks
			if (p === saDir) return true;
			if (p.includes("shared/constitution.md")) return true;
			if (p.includes("shared/state.md")) return true;
			// Feature checks - none in this test to keep it simple, but we need to satisfy basic score
			if (p === path.join(saDir, "specs")) return false; // skip feature checks for now
			// Env checks
			if (p.includes(".worktrees")) return true;
			if (p.includes("dashboard/server.js")) return true;
			return false;
		});

		const result = await runBenchmark(mockRoot);

		expect(result.success).toBe(true);
		expect(result.score).toBe(100);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
