import { afterEach, describe, expect, test, vi } from "vitest";
import fs from "node:fs";
import { detectStack } from "../skill-creator/src/tech-detector.js";

describe("Aizen-Gate Tech Detector", () => {
	test("Identifies Node.js project from package.json", () => {
		const mockProjectRoot = "/tmp/node_project";
		vi.spyOn(fs, "existsSync").mockImplementation((p: any) => p.includes("package.json"));
		vi.spyOn(fs, "readFileSync").mockReturnValue(
			JSON.stringify({
				dependencies: { react: "^18.0.0", next: "^14.0.0" },
			}) as any,
		);
		vi.spyOn(fs, "readdirSync").mockReturnValue([] as any);

		const stack = detectStack(mockProjectRoot);
		expect(stack.languages).toContain("JavaScript/TypeScript");
		expect(stack.frameworks).toContain("React");
		expect(stack.frameworks).toContain("Next.js");
	});

	test("Identifies Python project from requirements.txt", () => {
		const mockProjectRoot = "/tmp/python_project";
		vi.spyOn(fs, "existsSync").mockImplementation((p: any) => p.includes("requirements.txt"));
		vi.spyOn(fs, "readFileSync").mockReturnValue("Django\nfastapi" as any);
		vi.spyOn(fs, "readdirSync").mockReturnValue([] as any);

		const stack = detectStack(mockProjectRoot);
		expect(stack.languages).toContain("Python");
		expect(stack.frameworks).toContain("Django");
		expect(stack.frameworks).toContain("FastAPI");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
