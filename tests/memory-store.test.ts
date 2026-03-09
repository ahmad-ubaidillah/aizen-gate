import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MemoryStore } from "../src/memory/memory-store.js";

// Mock the heavy embedding logic
vi.mock("../src/memory/local-embed.js", () => ({
	localEmbedding: {
		init: vi.fn().mockResolvedValue(undefined),
		embed: vi.fn().mockImplementation((text: string) => Promise.resolve(new Array(384).fill(0.1))),
		similarity: vi.fn().mockReturnValue(0.8)
	}
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("MemoryStore - Suite", () => {
	const testRoot = path.join(__dirname, "test-env-mem");
	let store: MemoryStore;

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
		expect(fs.existsSync((store as any).memoryPath)).toBe(true);

		// Check legacy file renamed
		expect(fs.existsSync(`${legacyPath}.migrated`)).toBe(true);

		// Check fact is in DB
		const res = (store as any).db.prepare("SELECT * FROM aizen_facts WHERE id = ?").get("123") as any;
		expect(res.text).toBe("Legacy fact test");
		expect(res.sector).toBe("semantic"); // Default sector
	});

	it("Task 2: Multi-Sector Classification", () => {
		const r1 = (store as any).classifySector("I feel really excited about this!");
		expect(r1.primary).toBe("emotional");

		const r2 = (store as any).classifySector("I realize now how to proceed.");
		expect(r2.primary).toBe("reflective");

		const r3 = (store as any).classifySector("Step 1 involves setting up the DB.");
		expect(r3.primary).toBe("procedural");

		const r4 = (store as any).classifySector("Yesterday the build failed.");
		expect(r4.primary).toBe("episodic");

		const r5 = (store as any).classifySector("Jupiter has 79 moons.");
		expect(r5.primary).toBe("semantic");
	});

	it("Task 3: Decay Engine Tracking", () => {
		const initialSalience = 1.0;
		const lambda = 0.015;
		// Simulate 10 days ago
		const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
		const decayed = (store as any).calculateDecay(initialSalience, lambda, Date.now() - tenDaysMs);

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
		expect(results[0].trace!.sector).toBeDefined();
		expect(typeof results[0].trace!.similarity).toBe("number");

		// Check hit tracking incremented
		expect(results[0].hits).toBeGreaterThan(0);
	});
});
