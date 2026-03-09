import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DependencyGraph } from "../src/orchestration/dependency-graph.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("DependencyGraph Engine", () => {
	const tempFeatureDir = path.join(__dirname, ".tmp_graph");
	const tasksDir = path.join(tempFeatureDir, "tasks");

	beforeEach(() => {
		fs.mkdirpSync(tasksDir);
	});

	afterEach(() => {
		fs.removeSync(tempFeatureDir);
	});

	const createWP = (id: string, deps: string[]) => {
		const filePath = path.join(tasksDir, `${id}.md`);
		const content = `---
id: ${id}
title: Dummy
lane: planned
dependencies: ${JSON.stringify(deps)}
assignedAgent: DEV
---
Spec...
`;
		fs.writeFileSync(filePath, content);
	};

	it("should build a valid graph with sequential dependencies", async () => {
		createWP("WP01", []);
		createWP("WP02", ["WP01"]);
		createWP("WP03", ["WP02"]);

		const graph = new DependencyGraph(tempFeatureDir);
		await graph.build();

		expect(graph.graph.WP01).toEqual([]);
		expect(graph.graph.WP02).toEqual(["WP01"]);
		expect(graph.graph.WP03).toEqual(["WP02"]);
	});

	it("should perform Kahn topological sort perfectly", async () => {
		createWP("WP02", ["WP01"]);
		createWP("WP03", ["WP01", "WP02"]);
		createWP("WP01", []); // Out of order creation

		const graph = new DependencyGraph(tempFeatureDir);
		await graph.build();

		const sort = graph.topologicalSort();
		expect(sort).toEqual(["WP01", "WP02", "WP03"]);
	});

	it("should detect cycles and throw", async () => {
		createWP("WP01", ["WP02"]);
		createWP("WP02", ["WP03"]);
		createWP("WP03", ["WP01"]); // Cycle

		const graph = new DependencyGraph(tempFeatureDir);
		await graph.build();

		const cycles = graph.detectCycles();
		expect(cycles).not.toBeNull();
		expect(cycles!.length).toBeGreaterThan(0);

		expect(() => graph.topologicalSort()).toThrow(/cycle/i);
	});
});
