import { afterEach, describe, expect, test, vi } from "vitest";
import fs from "fs-extra";
import { setupCI } from "../src/setup/ci-setup.js";

describe("Aizen-Gate CI/CD Orchestrator", () => {
	test("Injects GitHub Actions config file", async () => {
		const mockRoot = "/tmp/project";

		vi.spyOn(fs, "existsSync").mockReturnValue(false);
		const ensureSpy = vi.spyOn(fs, "ensureDir").mockImplementation(() => Promise.resolve());
		const writeSpy = vi.spyOn(fs, "writeFile").mockImplementation(() => Promise.resolve() as any);

		const result = await setupCI(mockRoot);

		expect(result.success).toBe(true);
		expect(ensureSpy).toHaveBeenCalled();
		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining("az-compliance.yml"),
			expect.stringContaining("name: Aizen-Gate AI Compliance"),
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
