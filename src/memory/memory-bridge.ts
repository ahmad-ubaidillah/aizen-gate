import { Memory } from "openmemory-js";

export class MemoryBridge {
	private projectId: string;
	private mem: any;

	constructor(projectId: string) {
		// Unique ID for the current Aizen-Gate workspace
		this.projectId = projectId || "aizen-gate-workspace";
		// Initialize OpenMemory locally (uses SQLite)
		this.mem = new (Memory as any)();
	}

	/**
	 * Store a significant decision, preference, or context in long-term memory.
	 */
	async storeDecision(content: string, tags: string[] = []): Promise<boolean> {
		try {
			await this.mem.add(content, { user_id: this.projectId, tags: tags });
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
			const results = await this.mem.search(query, { user_id: this.projectId, limit: limit });
			return results;
		} catch (e) {
			console.error("[MemoryBridge] Failed to recall context:", (e as Error).message);
			return [];
		}
	}

	/**
	 * Delete a specific memory node.
	 */
	async deleteMemory(memoryId: string): Promise<boolean> {
		try {
			await this.mem.delete(memoryId);
			return true;
		} catch (e) {
			console.error("[MemoryBridge] Failed to delete memory:", (e as Error).message);
			return false;
		}
	}
}
