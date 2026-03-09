import { afterEach, describe, expect, test, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { runBenchmark } from "../src/quality/benchmark.js";

describe("Aizen-Gate Benchmark Evaluation", () => {
	test("Calculates perfect score when all artifacts are valid", async () => {
		const mockRoot = "/tmp/project";
		const saDir = path.join(mockRoot, "aizen-gate");

		vi.spyOn(fs, "existsSync").mockImplementation((p: any) => {
			// Structural checks
			if (p === saDir) return true;
			if (p.includes("shared/constitution.md")) return true;
			if (p.includes("shared/state.md")) return true;
			// Feature checks
			if (p === path.join(saDir, "specs")) return false;
			// Env checks
			if (p.includes(".worktrees")) return true;
			if (p.includes("dashboard/server.ts")) return true; // Updated to .ts
			if (p.includes("dashboard/server.js")) return true; // Compatibility
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
