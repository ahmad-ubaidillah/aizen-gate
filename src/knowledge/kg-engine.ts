/**
 * [AZ] Knowledge Graph Engine
 *
 * High-level wrapper for openmemory-js to handle structured project entities
 * and their relationships.
 *
 * Note: Uses dynamic import to handle CommonJS/ESM compatibility with openmemory-js
 */

import path from "node:path";
import chalk from "chalk";

// Lazy-load openmemory-js to handle potential ESM/CJS mismatch
let _MemoryClass: any = null;
async function getMemoryClass(): Promise<any> {
	if (_MemoryClass) return _MemoryClass;
	try {
		// Try the dist path first
		const mod = await import("openmemory-js/dist/core/memory.js");
		_MemoryClass = mod.Memory || mod.default?.Memory;
	} catch (_e1) {
		try {
			// Fallback to main package
			const mod = await import("openmemory-js");
			_MemoryClass = mod.Memory || mod.default?.Memory;
		} catch (e2: any) {
			console.error("[KG] Failed to load openmemory-js:", e2.message);
			throw e2;
		}
	}
	return _MemoryClass;
}

// [AZ] Memory logging is now managed per-instance or via environment flags.
// Global console hijacking is disabled for better system transparency.

// Ensure OpenMemory defaults are set to avoid noise and server conflicts
process.env.OM_TIER = process.env.OM_TIER || "fast";
process.env.OM_PORT = process.env.OM_PORT || "8081"; // Avoid 8080 conflict
process.env.OM_DB_PATH =
	process.env.OM_DB_PATH || path.join(process.cwd(), "aizen-gate", "shared", "memory.db");

export interface KGNodeMetadata {
	id?: string;
	type?: string;
	tags?: string[];
	valid_from?: string;
	valid_to?: string;
	relation?: string;
	source?: string;
	target?: string;
	[key: string]: any;
}

export interface KGNode {
	id: string;
	content: string;
	meta: KGNodeMetadata;
	type?: string;
	score?: number;
}

export interface KGAddNodeOptions {
	tags?: string[];
	valid_from?: string;
	valid_to?: string;
	[key: string]: any;
}

/**
 * [AZ] Knowledge Graph Engine
 *
 * High-level wrapper for openmemory-js to handle structured project entities
 * and their relationships.
 */
export class KnowledgeGraph {
	private _memory: any = null;
	private namespace = "aizen-kg";

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
	}

	/**
	 * Get or initialize memory instance (lazy init)
	 */
	async _getMemory(): Promise<any> {
		if (this._memory) return this._memory;
		const MemoryClass = await getMemoryClass();
		this._memory = new MemoryClass();
		return this._memory;
	}

	/**
	 * Get the memory instance (with lazy initialization) - exposed for external access
	 */
	get memory(): Promise<any> {
		return this._getMemory();
	}

	/**
	 * Adds or updates a node in the graph.
	 * @param id Unique identifier (e.g., file path, task ID)
	 * @param type Node type (FILE, FEAT, TASK, FUNC)
	 * @param content Text description or code content
	 * @param metadata Additional attributes
	 */
	async addNode(
		id: string,
		type: string,
		content: string,
		metadata: KGAddNodeOptions = {},
	): Promise<any> {
		const memory = await this._getMemory();
		const tags: string[] = [`lgm:node:${type.toLowerCase()}`, `lgm:id:${id}`];
		if (metadata.tags) tags.push(...metadata.tags);

		const validFrom = metadata.valid_from || new Date().toISOString();
		const validTo = metadata.valid_to || "9999-12-31T23:59:59.999Z";

		const mem = await memory.add(content, {
			...metadata,
			id,
			type,
			tags,
			valid_from: validFrom,
			valid_to: validTo,
			namespace: this.namespace,
			updated_at: Date.now(),
		});

		console.log(chalk.gray(`[KG] Temporal Node added: [${type}] ${id} (Valid from: ${validFrom})`));
		return mem;
	}

	/**
	 * Adds a relationship between two nodes.
	 * Uses waypoints in openmemory-js.
	 */
	async addEdge(
		sourceId: string,
		targetId: string,
		type: string,
		weight = 1.0,
		metadata: KGAddNodeOptions = {},
	): Promise<any> {
		const memory = await this._getMemory();
		const _finalWeight = this._getEdgeWeight(type, weight);
		const validFrom = metadata.valid_from || new Date().toISOString();
		const validTo = metadata.valid_to || "9999-12-31T23:59:59.999Z";

		await memory.add(`Relation: ${sourceId} ${type} ${targetId}`, {
			source: sourceId,
			target: targetId,
			relation: type,
			valid_from: validFrom,
			valid_to: validTo,
			tags: [`lgm:edge:${type.toLowerCase()}`, `source:${sourceId}`, `target:${targetId}`],
			namespace: this.namespace,
		});

		console.log(chalk.gray(`[KG] Edge created: ${sourceId} --(${type})--> ${targetId}`));
	}

	private _getEdgeWeight(type: string, baseWeight: number): number {
		const weights: Record<string, number> = {
			DEPENDS_ON: 1.0,
			IMPLEMENTS: 1.2,
			DEFINES: 0.9,
			AFFECTS: 1.1,
			REFERENCES: 0.7,
		};
		return (weights[type] || 0.5) * baseWeight;
	}

	/**
	 * Queries the graph for relevant nodes with Point-in-Time filtering.
	 */
	async query(text: string, limit = 5, asOfDate = new Date().toISOString()): Promise<KGNode[]> {
		const memory = await this._getMemory();
		const rawResults = await memory.search(text, {
			namespace: this.namespace,
			limit: limit * 2, // Fetch extra to account for temporal filtering
		});

		// Temporal point-in-time filter
		const validResults = rawResults.filter((r: KGNode) => {
			const from = r.meta?.valid_from || "1970-01-01T00:00:00.000Z";
			const to = r.meta?.valid_to || "9999-12-31T23:59:59.999Z";
			return asOfDate >= from && asOfDate <= to;
		});

		return validResults.slice(0, limit);
	}

	/**
	 * Explains relationships for a specific node.
	 */
	async getTrace(nodeId: string): Promise<KGNode[]> {
		const memory = await this._getMemory();
		const results = await memory.search(nodeId, {
			namespace: this.namespace,
			limit: 20,
		});

		return results.map((r: KGNode) => ({
			id: r.id,
			content: r.content,
			type: r.meta?.type || "EDGE",
			score: r.score,
		}));
	}
}
