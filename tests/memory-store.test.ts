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

// Mock llama bridge to avoid GGUF downloads in tests
vi.mock("../src/memory/llama-bridge.js", () => ({
	createLlamaBridge: vi.fn().mockReturnValue({
		distill: vi.fn().mockImplementation((text: string) => Promise.resolve(`TOON: ${text}`))
	})
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("MemoryStore - Suite", () => {
	const testRoot = path.join(__dirname, "test-env-mem");
	let store: MemoryStore;

	beforeEach(async () => {
		// Setup temp env
		fs.ensureDirSync(path.join(testRoot, "aizen-gate", "shared"));
		if (store) {
			// Clear DB table instead of deleting file to avoid locked handles
			(store as any).db.prepare("DELETE FROM agent_memory").run();
		} else {
			store = new MemoryStore(testRoot);
			await store.ready;
		}
	});

	afterAll(() => {
		if (store) {
			(store as any).db.close();
		}
		fs.removeSync(testRoot);
	});

	it("Phase 1-3: storeMemory and URI Parsing", async () => {
		const uri = "agent://test-space/bot/intelligence";
		const content = "The sun is a star.";
		
		const result = await store.storeMemory(uri, content);
		expect(result).toBe("CREATED");

		// Verify entry in DB
		const res = (store as any).db.prepare("SELECT * FROM agent_memory WHERE viking_path = ?").get(uri) as any;
		expect(res.space_id).toBe("test-space");
		expect(res.agent_id).toBe("bot");
		expect(res.content_raw).toBe(content);
		expect(res.content_toon).toContain("TOON:");
	});

	it("Phase 4: Skill Fusion (Updates)", async () => {
		const uri = "agent://test-space/bot/fusion";
		await store.storeMemory(uri, "Initial state");
		const result = await store.storeMemory(uri, "Updated state");
		
		expect(result).toBe("UPDATED");
		
		const res = (store as any).db.prepare("SELECT growth_version, source_count FROM agent_memory WHERE viking_path = ?").get(uri) as any;
		expect(res.growth_version).toBe(2);
		expect(res.source_count).toBe(2);
	});

	it("Phase 5: Immune System Response", async () => {
		const uri = "agent://test-space/bot/immune";
		await store.storeMemory(uri, "Critical logic");
		
		// Report 3 failures
		store.reportSkillResult(uri, false, "Timeout");
		store.reportSkillResult(uri, false, "Error 500");
		store.reportSkillResult(uri, false, "Crash");

		const res = (store as any).db.prepare("SELECT status, success_rate FROM agent_memory WHERE viking_path = ?").get(uri) as any;
		expect(res.status).toBe("BROKEN");
		expect(res.success_rate).toBeLessThan(0.3);
	});

	it("Phase 6: Multi-Strategy Recall", async () => {
		const spaceId = "test-space";
		await store.storeMemory(`agent://${spaceId}/bot/fact1`, "Docker is great for scaling.");
		await store.storeMemory(`agent://${spaceId}/bot/fact2`, "Kubernetes manages containers.");
		
		const results = await store.findRelevant("How to scale docker?", spaceId);
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].uri).toContain("fact1");
		expect(results[0].score).toBeDefined();
	});
});
