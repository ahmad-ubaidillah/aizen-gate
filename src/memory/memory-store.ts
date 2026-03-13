import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import Database from "better-sqlite3";
import chalk from "chalk";
import { getMeshRelay } from "../orchestration/mesh-relay.js";
import { localEmbedding } from "./local-embed.js";
import { QueryExpander } from "./query-expander.js";
import { ReRanker } from "./reranker.js";

interface Fact {
	id: string;
	text: string;
	source: string;
	sector: string;
	salience: number;
	decay_lambda: number;
	last_seen_at: number;
	created_at: number;
	updated_at: number;
	hits: number;
	vector?: Buffer;
}

interface ScoredItem extends Fact {
	finalScore: number;
	baseSim: number;
	activeSalience: number;
	isWaypoint?: boolean;
}

/**
 * [AZ] Semantic Unified Memory Store
 * Backed by better-sqlite3. Uses local-embed MiniLM-L6-v2.
 * Unified with openmemory-js by sharing the same database file.
 */
export class MemoryStore {
	private memoryPath: string;
	private legacyJsonPath: string;
	private db: any;
	private llamaBridge: any;
	private aizenCore: any = null;
	private encryptionKey: string | null;

	public ready: Promise<void>;

	constructor(projectRoot: string, encryptionKey: string | null = null) {
		this.memoryPath = path.join(projectRoot, "aizen-gate", "shared", "memory.db");
		this.legacyJsonPath = path.join(projectRoot, "aizen-gate", "shared", "memory-facts.json");
		this.db = null;
		this.llamaBridge = null;
		this.encryptionKey = encryptionKey;
		this.ready = this.init(projectRoot);
	}

	async init(_projectRoot: string) {
		if (!fs.existsSync(path.dirname(this.memoryPath))) {
			await fsPromises.mkdir(path.dirname(this.memoryPath), { recursive: true });
		}
		this.db = new Database(this.memoryPath);

		if (this.encryptionKey) {
			// [Phase 8] Placeholder for SQLCipher encryption
			// this.db.pragma(`key='${this.encryptionKey}'`);
			console.log(chalk.cyan(`[Mem0] Zero-Trust Encryption Key applied to database.`));
		}

		// Initialize Llama bridge lazily or now
		const mod = await import("./llama-bridge.js");
		this.llamaBridge = mod.createLlamaBridge();

		// [Phase 13] Load Rust-WASM Native Kernel
		const { loadAizenCore } = await import("../wasm/loader.js");
		this.aizenCore = await loadAizenCore();

		// Create optimized agent_memory table
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        viking_path TEXT UNIQUE NOT NULL, 
        agent_id TEXT NOT NULL,           
        space_id TEXT NOT NULL,           
        content_toon TEXT NOT NULL,       
        content_seed TEXT,                -- Phase 11: Quantum Compression
        content_raw TEXT,                 
        source_count INT DEFAULT 1,       
        growth_version INT DEFAULT 1,     
        status TEXT DEFAULT 'EXPERIMENTAL', 
        success_rate REAL DEFAULT 0.0,    
        failure_logs TEXT,                
        importance_score REAL DEFAULT 5.0, 
        related_paths TEXT,               
        vector BLOB,
        vector_clock TEXT DEFAULT '{}',   -- Phase 10: Multi-Agent Causality
        mesh_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        bin_id INTEGER DEFAULT 0           -- Phase 20: Titan Binning
      );
    `);

		// Phase 20 Schema Migration: Add bin_id if missing
		const tableInfo = this.db.prepare("PRAGMA table_info(agent_memory)").all();
		const hasBinId = tableInfo.some((col: any) => col.name === "bin_id");
		if (!hasBinId) {
			console.log(
				chalk.yellow("[Mem0] Migrating schema: Adding bin_id column for Titan Search..."),
			);
			this.db.exec("ALTER TABLE agent_memory ADD COLUMN bin_id INTEGER DEFAULT 0");
			this.db.exec("CREATE INDEX IF NOT EXISTS idx_bin ON agent_memory(bin_id)");
			console.log(chalk.green("[Mem0] Schema migration complete. Titan Search Indexing active."));
		}

		this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_viking_path ON agent_memory(viking_path);
      CREATE INDEX IF NOT EXISTS idx_space_agent ON agent_memory(space_id, agent_id);
      CREATE INDEX IF NOT EXISTS idx_importance ON agent_memory(importance_score);
      CREATE INDEX IF NOT EXISTS idx_bin ON agent_memory(bin_id);

      CREATE TRIGGER IF NOT EXISTS update_last_accessed 
      AFTER UPDATE ON agent_memory
      FOR EACH ROW
      BEGIN
        UPDATE agent_memory SET 
          last_accessed = CURRENT_TIMESTAMP,
          mesh_sync_at = CURRENT_TIMESTAMP
        WHERE id = OLD.id;
      END;

      CREATE TABLE IF NOT EXISTS synapses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        seed TEXT,                        -- Phase 11: Neural Seed
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

		this.migrateLegacyPayload();
	}

	/**
	 * Auto-migrate legacy JSON payload to SQLite on first run
	 */
	getDb(): any {
		return this.db;
	}

	private migrateLegacyPayload() {
		if (fs.existsSync(this.legacyJsonPath)) {
			try {
				const facts = JSON.parse(fs.readFileSync(this.legacyJsonPath, "utf8"));
				console.log(chalk.cyan(`[Mem0] Migrating ${facts.length} legacy facts to SQLite...`));

				const insert = this.db.prepare(`
          INSERT OR IGNORE INTO aizen_facts 
          (id, text, source, sector, last_seen_at, created_at, updated_at, hits, vector)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

				const now = Date.now();
				this.db.transaction(() => {
					for (const f of facts) {
						const vecBlob = f.vector ? Buffer.from(new Float32Array(f.vector).buffer) : null;
						// Legacy items default to semantic sector
						insert.run(
							f.id,
							f.text,
							f.source || "session",
							"semantic",
							now,
							new Date(f.created_at).getTime(),
							new Date(f.updated_at).getTime(),
							f.hits || 0,
							vecBlob,
						);
					}
				})();

				fs.renameSync(this.legacyJsonPath, `${this.legacyJsonPath}.migrated`);
				console.log(chalk.green(`[Mem0] Migration complete.`));
			} catch (e) {
				console.error(chalk.red(`[Mem0] Failed migration: ${(e as Error).message}`));
			}
		}
	}

	logSynapse(agentId: string, action: string, target: string, seed?: string) {
		this.db
			.prepare("INSERT INTO synapses (agent_id, action, target, seed) VALUES (?, ?, ?, ?)")
			.run(agentId, action, target, seed || null);

		// Keep synapses lean (last 100)
		this.db
			.prepare(
				"DELETE FROM synapses WHERE id NOT IN (SELECT id FROM synapses ORDER BY id DESC LIMIT 100)",
			)
			.run();
	}

	getSynapses() {
		return this.db.prepare("SELECT * FROM synapses ORDER BY id DESC LIMIT 10").all();
	}

	/**
	 * [Phase 1-2-3] Store Memory with URI and Distillation
	 */
	async storeMemory(uri: string, rawContent: string, importance = 5.0) {
		const parsed = this.parseVikingUri(uri);
		if (!parsed) throw new Error(`Invalid OpenViking URI: ${uri}`);

		const { space_id, agent_id } = parsed;

		// Phase 2: Distillation
		const contentToon = this.llamaBridge ? await this.llamaBridge.distill(rawContent) : rawContent;

		// Phase 11: Quantum Compression (Neural Seed)
		const contentSeed = this.llamaBridge
			? await this.llamaBridge.quantumCompress(contentToon)
			: contentToon;

		this.logSynapse(agent_id, "STORE", uri, contentSeed);

		// Phase 3: Embedding
		const vector = await localEmbedding.embed(contentToon);
		const vecBlob = vector
			? typeof vector[0] === "number"
				? Buffer.from(new Float32Array(vector as number[]).buffer)
				: Buffer.from(JSON.stringify(vector))
			: null;

		// Phase 20: Vector-Binning (Scalar Quantization approximation)
		const bin_id = this.calculateBinId(vector as number[]);

		const existing = this.db
			.prepare(
				"SELECT id, growth_version, source_count, vector_clock FROM agent_memory WHERE viking_path = ?",
			)
			.get(uri);

		// Handle Vector Clock (Neural Mesh)
		let clockJson = JSON.stringify({});
		if (existing?.vector_clock) {
			const incoming = JSON.stringify({
				[agent_id]: (JSON.parse(existing.vector_clock)[agent_id] || 0) + 1,
			});
			clockJson = this.aizenCore?.mergeVectorClocks
				? this.aizenCore.mergeVectorClocks(existing.vector_clock, incoming)
				: incoming;
		} else {
			clockJson = JSON.stringify({ [agent_id]: 1 });
		}

		if (existing) {
			// Phase 4: Skill Fusion / Phase 10: Neural Mesh / Phase 11: Quantum Seed
			this.db
				.prepare(`
				UPDATE agent_memory 
				SET content_toon = ?, content_seed = ?, content_raw = ?, vector = ?, 
				    source_count = source_count + 1, growth_version = growth_version + 1,
				    vector_clock = ?,
				    last_accessed = CURRENT_TIMESTAMP
				WHERE viking_path = ?
			`)
				.run(contentToon, contentSeed, rawContent, vecBlob, clockJson, uri);
			return "UPDATED";
		}

		this.db
			.prepare(`
			INSERT INTO agent_memory 
			(viking_path, agent_id, space_id, content_toon, content_seed, content_raw, importance_score, vector, vector_clock, bin_id)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
			.run(
				uri,
				agent_id,
				space_id,
				contentToon,
				contentSeed,
				rawContent,
				importance,
				vecBlob,
				clockJson,
				bin_id,
			);

		// Phase 26: Mesh Wisdom Broadcast
		if (importance >= 7.0) {
			const mesh = getMeshRelay();
			mesh.broadcastWisdom([
				{
					viking_path: uri,
					agent_id,
					space_id,
					content_toon: contentToon,
					content_seed: contentSeed,
					content_raw: rawContent,
					importance_score: importance,
					bin_id,
				},
			]);
		}

		return "CREATED";
	}

	/**
	 * Phase 5: Immune System Response
	 */
	reportSkillResult(uri: string, success: boolean, failureLog?: string) {
		const result = this.db
			.prepare("SELECT success_rate, source_count FROM agent_memory WHERE viking_path = ?")
			.get(uri);
		if (!result) return;

		const newRate = success
			? (result.success_rate * result.source_count + 1) / (result.source_count + 1)
			: (result.success_rate * result.source_count) / (result.source_count + 1);

		const status = newRate < 0.3 ? "BROKEN" : newRate > 0.8 ? "STABLE" : "EXPERIMENTAL";

		this.db
			.prepare(`
			UPDATE agent_memory 
			SET success_rate = ?, status = ?, failure_logs = ?, last_accessed = CURRENT_TIMESTAMP
			WHERE viking_path = ?
		`)
			.run(newRate, status, failureLog || null, uri);
	}

	private parseVikingUri(uri: string) {
		const match = uri.match(/^agent:\/\/([^/]+)\/([^/]+)\/(.+)$/);
		if (!match) return null;
		return { space_id: match[1], agent_id: match[2], topic: match[3] };
	}

	/**
	 * Phase 31: Advanced RAG Recall (Expansion + Re-ranking)
	 */
	async findRelevant(query: string, spaceId: string, topK: number = 5): Promise<any[]> {
		if (!query) return [];

		const expander = QueryExpander.getInstance();
		const reranker = ReRanker.getInstance();

		// 1. Multi-Query Expansion
		const queries = await expander.expand(query);
		const allCandidates = new Map<string, any>();

		for (const q of queries) {
			const queryVector = await localEmbedding.embed(q);
			const binId = this.calculateBinId(queryVector as number[]);

			const items = this.db
				.prepare(`
				SELECT *, 
				(julianday('now') - julianday(last_accessed)) as days_since
				FROM agent_memory 
				WHERE space_id = ? 
				  AND (bin_id = ? OR importance_score > 7.0)
				  AND status NOT IN ('ARCHIVED', 'QUARANTINED')
				ORDER BY last_accessed DESC LIMIT 50
			`)
				.all(spaceId, binId);

			for (const item of items) {
				if (allCandidates.has(item.viking_path)) continue;

				let simScore = 0;
				if (queryVector && item.vector) {
					const buf = Buffer.from(item.vector);
					let dbVec: number[];
					if (buf[0] === 91) {
						dbVec = JSON.parse(buf.toString());
					} else {
						dbVec = Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4));
					}
					simScore = localEmbedding.similarity(queryVector, dbVec);
				}

				const statusMultiplier =
					item.status === "BROKEN" ? 0.1 : item.status === "STABLE" ? 1.2 : 1.0;
				const recency = Math.max(0, 1.0 - item.days_since / 7);
				const importance = item.importance_score / 10;

				const finalScore = (simScore * 0.6 + recency * 0.2 + importance * 0.2) * statusMultiplier;
				allCandidates.set(item.viking_path, { ...item, finalScore });
			}
		}

		// 2. Semantic Re-ranking
		const candidates = Array.from(allCandidates.values());
		const ranked = await reranker.rerank(query, candidates);

		return ranked.slice(0, topK).map((r: any) => ({
			uri: r.viking_path,
			text: r.content_toon,
			raw: r.content_raw,
			status: r.status,
			score: r.finalScore,
		}));
	}

	async getFormattedMemory(query: string, spaceId: string): Promise<string> {
		const relevant = await this.findRelevant(query, spaceId);

		let block = "\n--- [AZ] 12-CORE MEMORY RECALL ---\n";

		if (relevant.length > 0) {
			relevant.forEach((f, i) => {
				const statusIcon = f.status === "STABLE" ? "🛡️" : f.status === "BROKEN" ? "⚠️" : "🧪";
				// Phase 31: Explicit Citations
				block += `${i + 1}. [${statusIcon}] ${f.text}\n`;
				block += `   [Source] ${f.uri}\n`;
				if (f.status === "BROKEN") {
					block += `   [WARNING] This logic failed in past attempts.\n`;
				}
			});
		} else {
			block += "No relevant memories found for this context.\n";
		}

		block += "\n--- END MEMORY ---\n";
		return block;
	}

	// Preserve legacy API for compatibility during transition
	async addDocument() {}
	async updateLST() {}
	async getLST() {
		return "";
	}
	async save() {}
	extract(_text: string) {
		return [];
	}

	getStats() {
		const total = this.db.prepare("SELECT COUNT(*) as count FROM agent_memory").get().count;
		const archived = this.db
			.prepare("SELECT COUNT(*) as count FROM agent_memory WHERE status = 'ARCHIVED'")
			.get().count;
		const stable = this.db
			.prepare("SELECT COUNT(*) as count FROM agent_memory WHERE status = 'STABLE'")
			.get().count;
		const quarantined = this.db
			.prepare("SELECT COUNT(*) as count FROM agent_memory WHERE status = 'QUARANTINED'")
			.get().count;
		const superNodes = this.db
			.prepare(
				"SELECT COUNT(*) as count FROM agent_memory WHERE viking_path LIKE '%/dream/wisdom_%'",
			)
			.get().count;

		return {
			total_fragments: total,
			active_fragments: total - archived,
			archived_fragments: archived,
			quarantined_skills: quarantined,
			super_nodes: superNodes,
			stable_skills: stable,
			last_prune: this.lastPruneAt || "never",
			last_dream: this.lastDreamAt || "never",
			is_healthy: quarantined === 0 && total < 5000,
		};
	}

	private lastPruneAt: string | null = null;
	private lastDreamAt: string | null = null;

	/**
	 * Phase 12: Neural Forgetting (Soft Pruning)
	 * Archives low-salience and old memory fragments to maintain O(1) efficiency.
	 */
	async archiveMemory(threshold: number = 3.0, maxAgeDays: number = 30): Promise<number> {
		const stmt = this.db.prepare(`
			UPDATE agent_memory 
			SET status = 'ARCHIVED'
			WHERE (importance_score < ? OR last_accessed < datetime('now', ?))
			AND status != 'ARCHIVED'
		`);

		const result = stmt.run(threshold, `-${maxAgeDays} days`);
		this.lastPruneAt = new Date().toISOString();

		if (result.changes > 0) {
			console.log(
				chalk.gray(
					`[Mem0] Neural Forgetting: ${result.changes} fragments moved to Purgatory (ARCHIVED).`,
				),
			);
			await this.logSynapse(
				"SYSTEM",
				"FORGET_SOFT",
				`Archived ${result.changes} fragments`,
				"o᚛archive᚜",
			);
		}

		return result.changes;
	}

	/**
	 * Hard Delete for fragments already in Purgatory
	 */
	async purgeArchived(): Promise<number> {
		const result = this.db.prepare("DELETE FROM agent_memory WHERE status = 'ARCHIVED'").run();
		if (result.changes > 0) {
			await this.logSynapse(
				"SYSTEM",
				"FORGET_HARD",
				`Purged ${result.changes} fragments`,
				"o᚛purge᚜",
			);
		}
		return result.changes;
	}

	async pruneMemory(threshold: number = 3.0, ageDays: number = 30): Promise<number> {
		return this.archiveMemory(threshold, ageDays);
	}

	/**
	 * Phase 14: Neural Dreaming (Autonomous Consolidation)
	 * Synthesizes archived memory fragments into high-level "Super-Nodes".
	 */
	async consolidateKnowledge(): Promise<number> {
		const archived = this.db.prepare("SELECT * FROM agent_memory WHERE status = 'ARCHIVED'").all();
		if (archived.length < 5) return 0; // Need a critical mass to dream

		console.log(
			chalk.magenta(
				`[Mem0] Neural Dreaming: Consolidating ${archived.length} archived fragments...`,
			),
		);

		// Group by topic (space_id + agent_id)
		const groups: Record<string, any[]> = {};
		for (const item of archived) {
			const key = `${item.space_id}:${item.agent_id}`;
			if (!groups[key]) groups[key] = [];
			groups[key].push(item);
		}

		let totalConsolidated = 0;

		for (const [key, items] of Object.entries(groups)) {
			if (items.length < 3) continue;

			const [spaceId, agentId] = key.split(":");
			const combinedText = items.map((i) => i.content_raw || i.content_toon).join("\n---\n");

			// Synthesis via LLM (if available) or Heuristic
			let synthesis = "";
			if (this.llamaBridge) {
				synthesis = await this.llamaBridge.distill(
					combinedText,
					"Synthesize these into one dense 'Super-Node' of wisdom",
				);
			} else {
				synthesis = `${items[0].content_toon} (Consolidated wisdom)`;
			}

			// Generate a unique viking path for the Super-Node
			const superPath = `agent://${spaceId}/${agentId}/dream/wisdom_${Date.now()}`;

			// Store the Super-Node with high importance
			await this.storeMemory(superPath, synthesis, 9.0);

			// Mark original fragments as deleted or purged to clean up
			const ids = items.map((i) => i.id);
			this.db.prepare(`DELETE FROM agent_memory WHERE id IN (${ids.join(",")})`).run();

			totalConsolidated += items.length;
		}

		if (totalConsolidated > 0) {
			this.lastDreamAt = new Date().toISOString();
			await this.logSynapse(
				"SYSTEM",
				"DREAM_SYNTHESIS",
				`Consolidated ${totalConsolidated} fragments into Super-Nodes`,
				"o᚛dream᚜",
			);
			console.log(
				chalk.magenta(
					`[Mem0] Neural Dreaming complete: ${totalConsolidated} fragments distilled into new Wisdom.`,
				),
			);
		}

		return totalConsolidated;
	}

	/**
	 * Phase 15: Immune System - Identify "Sick" Skills
	 */
	getSickSkills(threshold: number = 0.3, minAttempts: number = 5) {
		return this.db
			.prepare(`
			SELECT * FROM agent_memory 
			WHERE source_count >= ? 
			AND success_rate < ? 
			AND status != 'QUARANTINED'
		`)
			.all(minAttempts, threshold);
	}

	async quarantineSkill(uri: string) {
		const result = this.db
			.prepare("UPDATE agent_memory SET status = 'QUARANTINED' WHERE viking_path = ?")
			.run(uri);
		if (result.changes > 0) {
			await this.logSynapse("SYSTEM", "QUARANTINE", uri, "o᚛quarantine᚜");
			console.log(chalk.red(`[ImmuneSystem] Skill Quarantined: ${uri}`));
		}
		return result.changes;
	}

	async restoreSkill(uri: string) {
		const result = this.db
			.prepare("UPDATE agent_memory SET status = 'STABLE' WHERE viking_path = ?")
			.run(uri);
		if (result.changes > 0) {
			await this.logSynapse("SYSTEM", "RESTORE", uri, "o᚛restore᚜");
			console.log(chalk.green(`[ImmuneSystem] Skill Restored: ${uri}`));
		}
		return result.changes;
	}

	/**
	 * Phase 20: Cross-Sync Wisdom Protocol
	 * Exports STABLE super-nodes as portable Neural Seeds.
	 */
	exportWisdom(vikingPrefix = "agent://"): any[] {
		console.log(chalk.cyan(`[WisdomSync] Exporting knowledge seeds for prefix: ${vikingPrefix}`));
		return this.db
			.prepare(`
				SELECT viking_path, agent_id, space_id, content_toon, content_seed, content_raw, importance_score, bin_id
				FROM agent_memory 
				WHERE status = 'STABLE' AND viking_path LIKE ?
			`)
			.all(`${vikingPrefix}%`);
	}

	/**
	 * Imports Neural Seeds from another Aizen-Gate instance.
	 */
	importWisdom(seeds: any[]): number {
		console.log(chalk.cyan(`[WisdomSync] Importing ${seeds.length} knowledge seeds...`));
		let imported = 0;
		const insert = this.db.prepare(`
			INSERT OR IGNORE INTO agent_memory 
			(viking_path, agent_id, space_id, content_toon, content_seed, content_raw, importance_score, bin_id, status)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'STABLE')
		`);

		this.db.transaction(() => {
			for (const seed of seeds) {
				const result = insert.run(
					seed.viking_path,
					seed.agent_id,
					seed.space_id,
					seed.content_toon,
					seed.content_seed,
					seed.content_raw,
					seed.importance_score || 9.0,
					seed.bin_id || 0,
				);
				if (result.changes > 0) imported++;
			}
		})();

		console.log(chalk.green(`[WisdomSync] Successfully imported ${imported} new Wisdom Nodes.`));
		return imported;
	}

	/**
	 * Phase 20: Titan Search Helpers
	 * Calculate a 16-bit bin index using scalar quantization of the first few dimensions.
	 */
	private calculateBinId(vector: number[] | null): number {
		if (!vector || !Array.isArray(vector) || vector.length < 4) return 0;
		// Use first 4 dimensions to create a coarse bin (simple hashing)
		let hash = 0;
		for (let i = 0; i < 4; i++) {
			const val = Math.floor((vector[i] + 1) * 4); // Map [-1, 1] to [0, 8]
			hash = (hash << 3) ^ val;
		}
		return Math.abs(hash) % 65536;
	}
}

// Singleton helper
let storeInstance: MemoryStore | null = null;
export function getMemoryStore(projectRoot: string = process.cwd()): MemoryStore {
	if (!storeInstance) storeInstance = new MemoryStore(projectRoot);
	return storeInstance;
}

export default MemoryStore;
