import { afterEach, describe, expect, test, vi } from "vitest";
import fs from "fs-extra";
import { compressContext } from "../src/memory/compress.js";

// Mock heavy dependencies
vi.mock("../src/memory/memory-bridge.js", () => {
	return {
		MemoryBridge: class {
			storeDecision = vi.fn().mockResolvedValue(true);
		},
	};
});

vi.mock("../src/memory/memory-store.js", () => {
	return {
		MemoryStore: class {
			add = vi.fn().mockResolvedValue(true);
		},
	};
});

describe("Aizen-Gate Token Compressor", () => {
	test("Moves done tasks from board.md to archive.md", async () => {
		const mockRoot = "/tmp/project";
		const mockBoard = `## Current Sprint\n\n| ID | Status |\n|:---|:---|\n| T-001 | ⬜ Todo |\n\n## Completed Tasks\n| ID | Task | Completed By | Date | Review Result |\n|:---|:---|:---|:---|:---|\n| T-000 | Old Task | Agent | 2026 | OK |\n\n## Backlog\n- Nothing\n`;
		const mockArchive = `# Board History Archive`;

		vi.spyOn(fs, "existsSync").mockReturnValue(true);
		vi.spyOn(fs, "ensureDir").mockImplementation(() => Promise.resolve());

		vi.spyOn(fs, "readFileSync").mockImplementation((p: any) => {
			if (p.includes("board.md")) return mockBoard;
			if (p.includes("board-history.md")) return mockArchive;
			return "";
		});

		const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

		const result = await compressContext(mockRoot);

		expect(result.success).toBe(true);
		expect(writeSpy).toHaveBeenCalledTimes(2);

		const updatedBoardArgs = writeSpy.mock.calls.find((c: any) => c[0].includes("board.md"));
		expect(updatedBoardArgs![1]).not.toContain("T-000");

		const updatedArchiveArgs = writeSpy.mock.calls.find((c: any) => c[0].includes("board-history.md"));
		expect(updatedArchiveArgs![1]).toContain("T-000");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
