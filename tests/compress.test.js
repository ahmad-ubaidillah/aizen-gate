import { afterEach, describe, expect, test, vi } from "vitest";

const fs = require("fs-extra");
const { compressContext } = require("../src/memory/compress");

describe("Aizen-Gate Token Compressor", () => {
	test("Moves done tasks from board.md to archive.md", async () => {
		const mockRoot = "/tmp/project";
		const mockBoard = `## Current Sprint\n\n| ID | Status |\n|:---|:---|\n| T-001 | ⬜ Todo |\n\n## Completed Tasks\n| ID | Task | Completed By | Date | Review Result |\n|:---|:---|:---|:---|:---|\n| T-000 | Old Task | Agent | 2026 | OK |\n\n## Backlog\n- Nothing\n`;
		const mockArchive = `# Board History Archive`;

		vi.spyOn(fs, "existsSync").mockReturnValue(true);
		vi.spyOn(fs, "ensureDir").mockResolvedValue();

		vi.spyOn(fs, "readFileSync").mockImplementation((p) => {
			if (p.includes("board.md")) return mockBoard;
			if (p.includes("board-history.md")) return mockArchive;
			return "";
		});

		const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

		const result = await compressContext(mockRoot);

		expect(result.success).toBe(true);
		expect(writeSpy).toHaveBeenCalledTimes(2); // one for board, one for archive

		// Ensure the written board does NOT contain T-000
		const updatedBoardArgs = writeSpy.mock.calls.find((c) => c[0].includes("board.md"));
		expect(updatedBoardArgs[1]).not.toContain("T-000");

		// Ensure the written archive DOES contain T-000
		const updatedArchiveArgs = writeSpy.mock.calls.find((c) => c[0].includes("board-history.md"));
		expect(updatedArchiveArgs[1]).toContain("T-000");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
