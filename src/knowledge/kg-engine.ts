import path from "node:path";
import chalk from "chalk";
import { MemoryStore } from "../memory/memory-store.js";

export interface KGNode {
	id: string;
	content: string;
	uri: string;
	status: string;
}

/**
 * [AZ] Knowledge Graph Engine
 *
 * Custom wrapper for MemoryStore to handle structured project entities
 * using OpenViking URIs.
 */
export class KnowledgeGraph {
	private _store: MemoryStore;
	private spaceId: string;

	constructor(projectRoot: string) {
		this._store = new MemoryStore(projectRoot);
		this.spaceId = path.basename(projectRoot) || "default-space";
	}

	/**
	 * Adds or updates a node in the graph using OpenViking URI.
	 * agent://[space]/[type]/[id]
	 */
	async addNode(id: string, type: string, content: string, _metadata: any = {}): Promise<any> {
		const uri = `agent://${this.spaceId}/${type.toLowerCase()}/${id.replace(/[^a-zA-Z0-9]/g, "_")}`;
		const result = await this._store.storeMemory(uri, content);

		console.log(chalk.gray(`[KG] Memory [${result}]: ${uri}`));
		return result;
	}

	/**
	 * Reroute edges to URI links (Simulated for now by adding related_paths metadata)
	 */
	async addEdge(sourceId: string, targetId: string, type: string): Promise<void> {
		// Currently managed via URI topics and implicit semantic linking
		console.log(chalk.gray(`[KG] Edge (Implicit): ${sourceId} --(${type})--> ${targetId}`));
	}

	/**
	 * Queries the graph for relevant nodes.
	 */
	async query(text: string, limit = 5): Promise<KGNode[]> {
		const results = await this._store.findRelevant(text, this.spaceId, limit);

		return results.map((r: any) => ({
			id: r.uri,
			content: r.text,
			uri: r.uri,
			status: r.status,
		}));
	}

	/**
	 * Report outcome of a specific logic node
	 */
	async reportOutcome(uri: string, success: boolean, log?: string) {
		await this._store.reportSkillResult(uri, success, log);
	}
}
