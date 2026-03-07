import { afterAll, beforeEach, describe, expect, it } from "vitest";

const fs = require("fs-extra");
const path = require("node:path");
const { MemoryStore } = require("../scripts/memory-store");

describe("MemoryStore - Suite", () => {
	const testRoot = path.join(__dirname, "test-env-mem");
	let store;

	beforeEach(() => {
		// Setup temp env
		fs.ensureDirSync(path.join(testRoot, "aizen-gate", "shared"));

		// Seed legacy JSON
		const legacyPath = path.join(testRoot, "aizen-gate", "shared", "memory-facts.json");
		fs.writeJsonSync(legacyPath, [
			{
				id: "123",
				text: "Legacy fact test",
				created_at: Date.now(),
				updated_at: Date.now(),
				hits: 0,
			},
		]);

		store = new MemoryStore(testRoot); // triggers migration
	});

	afterAll(() => {
		fs.removeSync(testRoot);
	});

	it("Task 1: SQLite Backend & Auto-Migration", () => {
		const legacyPath = path.join(testRoot, "aizen-gate", "shared", "memory-facts.json");

		// Check SQLite file exists
		expect(fs.existsSync(store.memoryPath)).toBe(true);

		// Check legacy file renamed
		expect(fs.existsSync(`${legacyPath}.migrated`)).toBe(true);

		// Check fact is in DB
		const res = store.db.prepare("SELECT * FROM aizen_facts WHERE id = ?").get("123");
		expect(res.text).toBe("Legacy fact test");
		expect(res.sector).toBe("semantic"); // Default sector
	});

	it("Task 2: Multi-Sector Classification", () => {
		const r1 = store.classifySector("I feel really excited about this!");
		expect(r1.primary).toBe("emotional");

		const r2 = store.classifySector("I realize now how to proceed.");
		expect(r2.primary).toBe("reflective");

		const r3 = store.classifySector("Step 1 involves setting up the DB.");
		expect(r3.primary).toBe("procedural");

		const r4 = store.classifySector("Yesterday the build failed.");
		expect(r4.primary).toBe("episodic");

		const r5 = store.classifySector("Jupiter has 79 moons.");
		expect(r5.primary).toBe("semantic");
	});

	it("Task 3: Decay Engine Tracking", () => {
		const initialSalience = 1.0;
		const lambda = 0.015;
		// Simulate 10 days ago
		const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
		const decayed = store.calculateDecay(initialSalience, lambda, Date.now() - tenDaysMs);

		// Salience should be roughly 1.0 * e^(-0.15) ~ 0.86
		expect(decayed).toBeLessThan(1.0);
		expect(decayed).toBeGreaterThan(0.8);
	});

	it("Task 4 & 5: CRUD, Graph Expansion & Explainable Recall", async () => {
		// Add two conceptually related facts
		await store.add("How to setup docker properly.", "user");
		await store.add("Docker procedure involves using docker-compose up.", "user");

		const results = await store.findRelevant("procedure for docker");
		expect(results.length).toBeGreaterThan(0);

		// Explainable Recall
		expect(results[0].trace).toBeDefined();
		expect(results[0].trace.sector).toBeDefined();
		expect(typeof results[0].trace.similarity).toBe("number");

		// Check hit tracking incremented
		expect(results[0].hits).toBeGreaterThan(0);
	});
});
