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

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.memoryPath = path.join(projectRoot, "aizen-gate", "shared", "memory.db");
		this.legacyJsonPath = path.join(projectRoot, "aizen-gate", "shared", "memory-facts.json");
		this.db = null;
		this.init();
	}

	init() {
		fs.ensureDirSync(path.dirname(this.memoryPath));
		this.db = new Database(this.memoryPath);

		// Create unified tables specifically for the local-embed
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS aizen_facts (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        source TEXT,
        sector TEXT, -- working, episodic, semantic, document, summary
        salience REAL DEFAULT 1.0,
        decay_lambda REAL DEFAULT 0.015,
        last_seen_at INTEGER,
        created_at INTEGER,
        updated_at INTEGER,
        hits INTEGER DEFAULT 0,
        vector BLOB
      );
      CREATE TABLE IF NOT EXISTS aizen_waypoints (
        source_id TEXT,
        target_id TEXT,
        weight REAL DEFAULT 1.0,
        PRIMARY KEY (source_id, target_id)
      );
      CREATE TABLE IF NOT EXISTS aizen_documents (
        id TEXT PRIMARY KEY,
        name TEXT,
        path TEXT,
        content TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        vector BLOB
      );
      CREATE TABLE IF NOT EXISTS aizen_summary (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        thread TEXT,
        updated_at INTEGER
      );
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
	 * Robust Classifier into 5 Strategic Tiers
	 * Returns: { primary: string, decay: number }
	 */
	classifySector(text: string) {
		const t = text.toLowerCase();

		// Document Memory (DM): Architecture, Specs, etc.
		if (/(spec|specification|architecture|blueprint|design document|planning artifact)/i.test(t)) {
			return { primary: "document", decay: 0.0001 };
		}

		// Emotional/Inspirational: Excitement, feelings, vision.
		if (/(feel|excited|love|hate|happy|sad|frustrated|awesome)/i.test(t)) {
			return { primary: "emotional", decay: 0.02 };
		}

		// Reflective: Realizations, logic jumps, insights.
		if (/(realize|think|reflect|insight|understand|learned)/i.test(t)) {
			return { primary: "reflective", decay: 0.01 };
		}

		// Procedural: Steps, how-to, instructions.
		if (/(step|involves|process|how to|procedure|setup)/i.test(t)) {
			return { primary: "procedural", decay: 0.005 };
		}

		// Semantic Memory (SM): Patterns, preferences, knowledge.
		if (/(preference|pattern|standard|learned|habit|user likes|convention)/i.test(t)) {
			return { primary: "semantic", decay: 0.002 };
		}

		// Episodic Memory (EM): Events, session history, decisions.
		if (
			/(decided|completed|occurred|happened|session|meeting|sprint|yesterday|last week)/i.test(t)
		) {
			return { primary: "episodic", decay: 0.01 };
		}

		// Working Memory (WM): Immediate task context.
		if (/(currently|now|working on|task|wp|input|instruction)/i.test(t)) {
			return { primary: "working", decay: 0.05 };
		}

		// Default to semantic (facts)
		return { primary: "semantic", decay: 0.005 };
	}

	/**
	 * Adds a new fact or updates an existing one if similar.
	 */
	async add(factText: string, source: string = "session", forceSector: string | null = null) {
		const id = crypto.createHash("md5").update(factText.toLowerCase().trim()).digest("hex");
		const existing = this.db.prepare("SELECT id FROM aizen_facts WHERE id = ?").get(id);

		const now = Date.now();
		const vector = await localEmbedding.embed(factText);
		const vecBlob = vector ? Buffer.from(new Float32Array(vector).buffer) : null;

		if (existing) {
			this.db
				.prepare(`
        UPDATE aizen_facts 
        SET updated_at = ?, last_seen_at = ?, hits = hits + 1, vector = ?
        WHERE id = ?
      `)
				.run(now, now, vecBlob, id);
			return "UPDATE";
		}

		const { primary: sector, decay } = forceSector
			? { primary: forceSector, decay: 0.01 }
			: this.classifySector(factText);

		this.db
			.prepare(`
      INSERT INTO aizen_facts (id, text, source, sector, decay_lambda, last_seen_at, created_at, updated_at, hits, vector)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `)
			.run(id, factText, source, sector, decay, now, now, now, vecBlob);

		// Waypoint Linking: Find best match and create an edge
		if (vector) {
			this.createWaypointLink(id, vector);
		}

		return "ADD";
	}

	/**
	 * Specialized Document Memory (DM) storage
	 */
	async addDocument(name: string, path: string, content: string) {
		const id = crypto.createHash("md5").update(path).digest("hex");
		const vector = await localEmbedding.embed(content.slice(0, 2000)); // Embed start of doc
		const vecBlob = vector ? Buffer.from(new Float32Array(vector).buffer) : null;
		const now = Date.now();

		this.db
			.prepare(`
      INSERT OR REPLACE INTO aizen_documents (id, name, path, content, created_at, updated_at, vector)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
			.run(id, name, path, content, now, now, vecBlob);

		return id;
	}

	/**
	 * Long Summary Thread (LST) management
	 */
	async updateLST(newSummary: string) {
		const now = Date.now();
		this.db
			.prepare(`
      INSERT OR REPLACE INTO aizen_summary (id, thread, updated_at)
      VALUES (1, ?, ?)
    `)
			.run(newSummary, now);
	}

	async getLST() {
		const row = this.db.prepare("SELECT thread FROM aizen_summary WHERE id = 1").get();
		return row ? row.thread : "";
	}

	/**
	 * Find highest similarity match and link it via waypoint table
	 */
	createWaypointLink(id: string, vector: number[]) {
		const facts = this.db
			.prepare("SELECT id, vector FROM aizen_facts WHERE id != ? AND vector IS NOT NULL")
			.all(id);
		let bestMatch: string | null = null;
		let maxSim = 0;

		for (const f of facts) {
			const dbVec = new Float32Array(f.vector.buffer, f.vector.byteOffset, f.vector.byteLength / 4);
			const sim = localEmbedding.similarity(vector, Array.from(dbVec));
			if (sim > maxSim) {
				maxSim = sim;
				bestMatch = f.id;
			}
		}

		if (maxSim >= 0.75 && bestMatch) {
			this.db
				.prepare(
					`INSERT OR IGNORE INTO aizen_waypoints (source_id, target_id, weight) VALUES (?, ?, ?)`,
				)
				.run(id, bestMatch, maxSim);
			this.db
				.prepare(
					`INSERT OR IGNORE INTO aizen_waypoints (source_id, target_id, weight) VALUES (?, ?, ?)`,
				)
				.run(bestMatch, id, maxSim);
		}
	}

	/**
	 * Exponential decay calculation
	 */
	calculateDecay(salience: number, lambda: number, lastSeenMs: number) {
		const days = (Date.now() - lastSeenMs) / (1000 * 60 * 60 * 24);
		return salience * Math.exp(-lambda * days);
	}

	expandWaypoints(scoredResults: ScoredItem[]): ScoredItem[] {
		const expanded = new Map<string, ScoredItem>();
		// Add primary hits
		scoredResults.forEach((r) => expanded.set(r.id, r));

		// Expand 1 hop
		const getWays = this.db.prepare(
			`SELECT target_id, weight FROM aizen_waypoints WHERE source_id = ? AND weight > 0.05`,
		);
		const getFact = this.db.prepare(`SELECT * FROM aizen_facts WHERE id = ?`);

		for (const r of scoredResults) {
			const edges = getWays.all(r.id);
			for (const e of edges as any[]) {
				if (!expanded.has(e.target_id)) {
					const target = getFact.get(e.target_id) as Fact;
					if (target) {
						const decayedSalience = this.calculateDecay(
							target.salience,
							target.decay_lambda,
							target.last_seen_at,
						);
						// Factor waypoint strength
						const baseScore = 0.5 * decayedSalience + 0.1 * e.weight;
						expanded.set(target.id, {
							...target,
							finalScore: baseScore,
							baseSim: 0,
							activeSalience: decayedSalience,
							isWaypoint: true,
						});
					}
				}
			}
		}
		return Array.from(expanded.values());
	}

	/**
	 * Semantic + Keyword Retrieval with Composite Scoring
	 * Uses pagination to prevent OOM on large databases
	 */
	async findRelevant(query: string, topK: number = 3): Promise<any[]> {
		if (!query) return [];

		const queryVector = await localEmbedding.embed(query);
		const queryTerms = query.toLowerCase().match(/\w+/g) || [];

		// Use bounded queries to prevent OOM - fetch in batches
		const BATCH_SIZE = 500;
		const allFacts: any[] = [];
		let offset = 0;
		let batch: any[] = [];

		do {
			batch = this.db.prepare("SELECT * FROM aizen_facts LIMIT ? OFFSET ?").all(BATCH_SIZE, offset);
			allFacts.push(...batch);
			offset += BATCH_SIZE;
		} while (batch.length === BATCH_SIZE && allFacts.length < 5000); // Cap at 5000 facts

		const scoredFacts = this.scoreCollection(allFacts, queryVector, queryTerms);

		// 2. Search Documents (also paginated)
		const allDocs: any[] = [];
		offset = 0;
		do {
			batch = this.db
				.prepare("SELECT * FROM aizen_documents LIMIT ? OFFSET ?")
				.all(BATCH_SIZE, offset);
			allDocs.push(...batch);
			offset += BATCH_SIZE;
		} while (batch.length === BATCH_SIZE && allDocs.length < 1000);
		const scoredDocs = this.scoreCollection(
			allDocs.map((d) => ({ ...d, text: d.content.slice(0, 1000) })),
			queryVector,
			queryTerms,
		);

		const scored = [...scoredFacts, ...scoredDocs.map((d) => ({ ...d, sector: "document" }))];

		if (scored.length === 0) return [];

		// Take top raw hits above threshold
		const topHits = scored
			.filter((f) => f.baseSim > 0.05)
			.sort((a, b) => b.finalScore - a.finalScore)
			.slice(0, topK * 2);

		// 1-hop Graph Expansion (only for facts)
		const factHits = topHits.filter((h) => h.id.length === 32) as ScoredItem[]; // MD5 fact IDs
		const expanded = this.expandWaypoints(factHits);

		const finalResults = [...expanded, ...topHits.filter((h) => h.sector === "document")]
			.sort((a, b: any) => b.finalScore - a.finalScore)
			.slice(0, topK);

		// Reinforce recalled items
		const reinforce = this.db.prepare(
			"UPDATE aizen_facts SET hits = hits + 1, last_seen_at = ?, salience = MIN(1.0, salience + 0.1) WHERE id = ?",
		);
		const now = Date.now();
		this.db.transaction(() => {
			for (const r of finalResults) {
				if (r.id.length === 32 && r.sector !== "document") {
					try {
						reinforce.run(now, r.id);
					} catch (_e) {
						// Non-critical: reinforce may fail if row doesn't exist
					}
				}
			}
		})();

		return finalResults.map((r: any) => ({
			text: r.text || r.content,
			hits: (r.hits || 0) + 1,
			trace: {
				sector: r.sector,
				similarity: r.baseSim || 0,
				decay: r.activeSalience || 1.0,
				waypoint_expanded: !!r.isWaypoint,
			},
		}));
	}

	scoreCollection(items: any[], queryVector: number[] | null, queryTerms: string[]): ScoredItem[] {
		return items.map((item) => {
			let simScore = 0;
			if (queryVector && item.vector) {
				const dbVec = new Float32Array(
					item.vector.buffer,
					item.vector.byteOffset,
					item.vector.byteLength / 4,
				);
				simScore = localEmbedding.similarity(queryVector, Array.from(dbVec));
			}

			const itemText = item.text || item.content || "";
			const factTerms = itemText.toLowerCase().match(/\w+/g) || [];
			let keywordScore = 0;
			queryTerms.forEach((term) => {
				if (factTerms.includes(term)) {
					keywordScore += 1 / (1 + Math.log(factTerms.length));
				}
			});
			const keySim = keywordScore > 0 ? keywordScore / queryTerms.length : 0;
			const baseSim = simScore * 0.7 + keySim * 0.3;

			const activeSalience = item.salience
				? this.calculateDecay(item.salience, item.decay_lambda, item.last_seen_at)
				: 1.0;
			const daysSince = item.last_seen_at
				? (Date.now() - item.last_seen_at) / (1000 * 60 * 60 * 24)
				: 0;
			const recency = Math.max(0, 1.0 - daysSince / 30);

			const finalScore = 0.6 * baseSim + 0.2 * activeSalience + 0.1 * recency;
			return { ...item, finalScore, baseSim, activeSalience, sector: item.sector };
		}) as ScoredItem[];
	}

	/**
	 * Formats relevant memories into a concise text block for prompt injection.
	 */
	async getFormattedMemory(query: string): Promise<string> {
		const relevant = await this.findRelevant(query);
		const lst = await this.getLST();

		let block = "\n--- [AZ] 5-TIER MEMORY DISTILLATION ---\n";

		if (lst) {
			block += `\n[LONG SUMMARY THREAD]\n${lst}\n`;
		}

		if (relevant.length > 0) {
			block += "\n[RELEVANT RECALLS]\n";
			relevant.forEach((f, i) => {
				block += `${i + 1}. [${f.trace.sector.toUpperCase()}] ${f.text.slice(0, 500)}${f.text.length > 500 ? "..." : ""}\n`;
			});
		}

		block += "\n--- END MEMORY ---\n";
		return block;
	}

	// Preserve backwards compat API
	async save() {}
	extract(_text: string) {
		return [];
	}
}
