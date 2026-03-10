import crypto from "node:crypto";
import path from "node:path";
import Database from "better-sqlite3";
import chalk from "chalk";
import fs from "fs-extra";
import { localEmbedding } from "./local-embed.js";

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

	public ready: Promise<void>;

	constructor(projectRoot: string) {
		this.memoryPath = path.join(projectRoot, "aizen-gate", "shared", "memory.db");
		this.legacyJsonPath = path.join(projectRoot, "aizen-gate", "shared", "memory-facts.json");
		this.db = null;
		this.llamaBridge = null;
		this.ready = this.init(projectRoot);
	}

	async init(projectRoot: string) {
		fs.ensureDirSync(path.dirname(this.memoryPath));
		this.db = new Database(this.memoryPath);

		// Initialize Llama bridge lazily or now
		const mod = await import("./llama-bridge.js");
		this.llamaBridge = mod.createLlamaBridge(projectRoot);

		// Create optimized agent_memory table
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        viking_path TEXT UNIQUE NOT NULL, 
        agent_id TEXT NOT NULL,           
        space_id TEXT NOT NULL,           
        content_toon TEXT NOT NULL,       
        content_raw TEXT,                 
        source_count INT DEFAULT 1,       
        growth_version INT DEFAULT 1,     
        status TEXT DEFAULT 'EXPERIMENTAL', 
        success_rate REAL DEFAULT 0.0,    
        failure_logs TEXT,                
        importance_score REAL DEFAULT 5.0, 
        related_paths TEXT,               
        vector BLOB, -- Added for semantic search support
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_viking_path ON agent_memory(viking_path);
      CREATE INDEX IF NOT EXISTS idx_space_agent ON agent_memory(space_id, agent_id);
      CREATE INDEX IF NOT EXISTS idx_importance ON agent_memory(importance_score);

      CREATE TRIGGER IF NOT EXISTS update_last_accessed 
      AFTER UPDATE ON agent_memory
      FOR EACH ROW
      BEGIN
        UPDATE agent_memory SET last_accessed = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

		this.migrateLegacyPayload();
	}

	/**
	 * Auto-migrate legacy JSON payload to SQLite on first run
	 */
	migrateLegacyPayload() {
		if (fs.existsSync(this.legacyJsonPath)) {
			try {
				const facts = fs.readJsonSync(this.legacyJsonPath);
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

	/**
	 * [Phase 1-2-3] Store Memory with URI and Distillation
	 */
	async storeMemory(uri: string, rawContent: string, importance = 5.0) {
		const parsed = this.parseVikingUri(uri);
		if (!parsed) throw new Error(`Invalid OpenViking URI: ${uri}`);

		const { space_id, agent_id } = parsed;

		// Phase 2: Distillation
		const contentToon = this.llamaBridge ? await this.llamaBridge.distill(rawContent) : rawContent; // Fallback if llama not ready

		// Phase 3: Embedding
		const vector = await localEmbedding.embed(contentToon);
		const vecBlob = vector ? Buffer.from(new Float32Array(vector).buffer) : null;

		const existing = this.db
			.prepare("SELECT id, growth_version, source_count FROM agent_memory WHERE viking_path = ?")
			.get(uri);

		if (existing) {
			// Phase 4: Skill Fusion (Simplified: increment version and count)
			this.db
				.prepare(`
				UPDATE agent_memory 
				SET content_toon = ?, content_raw = ?, vector = ?, 
				    source_count = source_count + 1, growth_version = growth_version + 1,
				    last_accessed = CURRENT_TIMESTAMP
				WHERE viking_path = ?
			`)
				.run(contentToon, rawContent, vecBlob, uri);
			return "UPDATED";
		}

		this.db
			.prepare(`
			INSERT INTO agent_memory 
			(viking_path, agent_id, space_id, content_toon, content_raw, importance_score, vector)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`)
			.run(uri, agent_id, space_id, contentToon, rawContent, importance, vecBlob);

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
	 * Phase 6: Multi-Strategy Recall
	 */
	async findRelevant(query: string, spaceId: string, topK: number = 3): Promise<any[]> {
		if (!query) return [];

		const queryVector = await localEmbedding.embed(query);

		// 1. Fetch memory candidates for the current space
		const items = this.db
			.prepare(`
			SELECT *, 
			(julianday('now') - julianday(last_accessed)) as days_since
			FROM agent_memory 
			WHERE space_id = ? 
			ORDER BY last_accessed DESC LIMIT 100
		`)
			.all(spaceId);

		const scored = items.map((item: any) => {
			let simScore = 0;
			if (queryVector && item.vector) {
				const dbVec = new Float32Array(
					item.vector.buffer,
					item.vector.byteOffset,
					item.vector.byteLength / 4,
				);
				simScore = localEmbedding.similarity(queryVector, Array.from(dbVec));
			}

			// Penalize BROKEN nodes, reward STABLE
			const statusMultiplier =
				item.status === "BROKEN" ? 0.1 : item.status === "STABLE" ? 1.2 : 1.0;
			const recency = Math.max(0, 1.0 - item.days_since / 7); // Reward within 7 days
			const importance = item.importance_score / 10;

			const finalScore = (simScore * 0.6 + recency * 0.2 + importance * 0.2) * statusMultiplier;

			return { ...item, finalScore };
		});

		return scored
			.sort((a: any, b: any) => b.finalScore - a.finalScore)
			.slice(0, topK)
			.map((r: any) => ({
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
				block += `${i + 1}. [${statusIcon} ${f.uri}] ${f.text}\n`;
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
}
