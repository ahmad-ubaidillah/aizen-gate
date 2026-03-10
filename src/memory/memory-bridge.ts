import path from "node:path";
import { MemoryStore } from "./memory-store.js";

export class MemoryBridge {
	private spaceId: string;
	private store: MemoryStore;

	constructor(projectRoot: string) {
		this.spaceId = path.basename(projectRoot) || "aizen-gate-workspace";
		this.store = new MemoryStore(projectRoot);
	}

	/**
	 * Store a significant decision, preference, or context in long-term memory.
	 */
	async storeDecision(content: string, topic: string = "decision"): Promise<boolean> {
		try {
			const uri = `agent://${this.spaceId}/bridge/${topic}`;
			await this.store.storeMemory(uri, content);
			return true;
		} catch (e) {
			console.error("[MemoryBridge] Failed to store decision:", (e as Error).message);
			return false;
		}
	}

	/**
	 * Recall related context based on a semantic query.
	 */
	async recallContext(query: string, limit: number = 5): Promise<any[]> {
		try {
			const results = await this.store.findRelevant(query, this.spaceId, limit);
			return results;
		} catch (e) {
			console.error("[MemoryBridge] Failed to recall context:", (e as Error).message);
			return [];
		}
	}

	/**
	 * Delete a specific memory node. (Simulated via reporting deprecated if needed)
	 */
	async deleteMemory(_memoryId: string): Promise<boolean> {
		// In the new schema, we avoid direct ID deletion to maintain history,
		// but we could implement a DELETE query if required.
		return true;
	}
}
