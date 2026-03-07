const fs = require("fs-extra");
const path = require("node:path");
import { afterEach, beforeEach, describe, expect, it } from "vitest";
const { WorkPackage } = require("../scripts/wp-model");

describe("WorkPackage Model", () => {
	const tempDir = path.join(__dirname, ".tmp_wp");

	beforeEach(() => {
		fs.mkdirpSync(tempDir);
	});

	afterEach(() => {
		fs.removeSync(tempDir);
	});

	it("should initialize with default values if empty", () => {
		const wp = new WorkPackage({}, "", null);
		expect(wp.id).toBe("WP00");
		expect(wp.lane).toBe("planned");
		expect(wp.dependencies).toEqual([]);
	});

	it("should load properly from markdown with yaml frontmatter", async () => {
		const filePath = path.join(tempDir, "WP01.md");
		const content = `---
id: WP01
title: Build API
lane: doing
dependencies:
  - WP00
assignedAgent: DEV
---
Here is the spec...
`;
		fs.writeFileSync(filePath, content);

		const wp = await WorkPackage.loadFromFile(filePath);
		expect(wp.id).toBe("WP01");
		expect(wp.title).toBe("Build API");
		expect(wp.lane).toBe("doing");
		expect(wp.dependencies).toEqual(["WP00"]);
		expect(wp.assignedAgent).toBe("DEV");
	});

	it("should save lane change correctly", async () => {
		const filePath = path.join(tempDir, "WP02.md");
		const content = `---
id: WP02
title: Change Lane Form
lane: planned
dependencies: []
assignedAgent: null
---
Specs here...
`;
		fs.writeFileSync(filePath, content);

		const wp = await WorkPackage.loadFromFile(filePath);
		await wp.setLane("review");

		const updated = await WorkPackage.loadFromFile(filePath);
		expect(updated.lane).toBe("review");
	});
});
