const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');
const Database = require('better-sqlite3');
const { localEmbedding } = require('./local-embed');

/**
 * [AZ] Semantic Unified Memory Store
 * Backed by better-sqlite3. Uses local-embed MiniLM-L6-v2.
 * Unified with openmemory-js by sharing the same database file.
 */
class MemoryStore {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.memoryPath = path.join(projectRoot, 'aizen-gate', 'shared', 'memory.db');
    this.legacyJsonPath = path.join(projectRoot, 'aizen-gate', 'shared', 'memory-facts.json');
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
        sector TEXT,
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
            insert.run(f.id, f.text, f.source || 'session', 'semantic', 
              now, new Date(f.created_at).getTime(), new Date(f.updated_at).getTime(), f.hits || 0, vecBlob);
          }
        })();
        
        fs.renameSync(this.legacyJsonPath, `${this.legacyJsonPath}.migrated`);
        console.log(chalk.green(`[Mem0] Migration complete.`));
      } catch (e) {
        console.error(chalk.red(`[Mem0] Failed migration: ${e.message}`));
      }
    }
  }

  /**
   * Fast Heuristic Classifier into 5 Multi-Sectors
   * Returns: { primary: string, decay: number }
   */
  classifySector(text) {
    const t = text.toLowerCase();
    
    if (/(feel|happy|sad|angry|frustrated|excited)/i.test(t)) {
      return { primary: 'emotional', decay: 0.020 };
    }
    if (/(think|realize|insight|learned|understand)/i.test(t)) {
      return { primary: 'reflective', decay: 0.001 };
    }
    if (/(how to|step|process|procedure|method)/i.test(t)) {
      return { primary: 'procedural', decay: 0.008 };
    }
    if (/(today|yesterday|remember when|was completed|occurred)/i.test(t)) {
      return { primary: 'episodic', decay: 0.015 };
    }
    // Default to semantic (facts)
    return { primary: 'semantic', decay: 0.005 };
  }

  /**
   * Adds a new fact or updates an existing one if similar.
   */
  async add(factText, source = 'session') {
    const id = crypto.createHash('md5').update(factText.toLowerCase().trim()).digest('hex');
    const existing = this.db.prepare('SELECT id FROM aizen_facts WHERE id = ?').get(id);

    const now = Date.now();
    let vector = await localEmbedding.embed(factText);
    const vecBlob = vector ? Buffer.from(new Float32Array(vector).buffer) : null;

    if (existing) {
      this.db.prepare(`
        UPDATE aizen_facts 
        SET updated_at = ?, last_seen_at = ?, hits = hits + 1, vector = ?
        WHERE id = ?
      `).run(now, now, vecBlob, id);
      return 'UPDATE';
    }

    const { primary: sector, decay } = this.classifySector(factText);

    this.db.prepare(`
      INSERT INTO aizen_facts (id, text, source, sector, decay_lambda, last_seen_at, created_at, updated_at, hits, vector)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, factText, source, sector, decay, now, now, now, vecBlob);

    // Waypoint Linking: Find best match and create an edge
    if (vector) {
      this.createWaypointLink(id, vector);
    }

    return 'ADD';
  }

  /**
   * Find highest similarity match and link it via waypoint table
   */
  createWaypointLink(id, vector) {
    const facts = this.db.prepare('SELECT id, vector FROM aizen_facts WHERE id != ? AND vector IS NOT NULL').all(id);
    let bestMatch = null;
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
      this.db.prepare(`INSERT OR IGNORE INTO aizen_waypoints (source_id, target_id, weight) VALUES (?, ?, ?)`).run(id, bestMatch, maxSim);
      this.db.prepare(`INSERT OR IGNORE INTO aizen_waypoints (source_id, target_id, weight) VALUES (?, ?, ?)`).run(bestMatch, id, maxSim);
    }
  }

  /**
   * Exponential decay calculation
   */
  calculateDecay(salience, lambda, lastSeenMs) {
    const days = (Date.now() - lastSeenMs) / (1000 * 60 * 60 * 24);
    return salience * Math.exp(-lambda * days);
  }

  expandWaypoints(scoredResults) {
    const expanded = new Map();
    // Add primary hits
    scoredResults.forEach(r => expanded.set(r.id, r));

    // Expand 1 hop
    const getWays = this.db.prepare(`SELECT target_id, weight FROM aizen_waypoints WHERE source_id = ? AND weight > 0.05`);
    const getFact = this.db.prepare(`SELECT * FROM aizen_facts WHERE id = ?`);

    for (const r of scoredResults) {
      const edges = getWays.all(r.id);
      for (const e of edges) {
        if (!expanded.has(e.target_id)) {
          const target = getFact.get(e.target_id);
          if (target) {
            const decayedSalience = this.calculateDecay(target.salience, target.decay_lambda, target.last_seen_at);
            // Factor waypoint strength
            const baseScore = 0.5 * decayedSalience + 0.1 * e.weight;
            expanded.set(target.id, { ...target, finalScore: baseScore, isWaypoint: true });
          }
        }
      }
    }
    return Array.from(expanded.values());
  }

  /**
   * Semantic + Keyword Retrieval with Composite Scoring
   */
  async findRelevant(query, topK = 3) {
    if (!query) return [];

    const queryVector = await localEmbedding.embed(query);
    const queryTerms = query.toLowerCase().match(/\w+/g) || [];
    
    const allFacts = this.db.prepare('SELECT * FROM aizen_facts').all();
    if (allFacts.length === 0) return [];

    const scored = allFacts.map(fact => {
      let simScore = 0;
      
      if (queryVector && fact.vector) {
        const dbVec = new Float32Array(fact.vector.buffer, fact.vector.byteOffset, fact.vector.byteLength / 4);
        simScore = localEmbedding.similarity(queryVector, Array.from(dbVec));
      }

      // Keyword matching 
      const factTerms = fact.text.toLowerCase().match(/\w+/g) || [];
      let keywordScore = 0;
      queryTerms.forEach(term => {
        if (factTerms.includes(term)) {
          keywordScore += 1 / (1 + Math.log(factTerms.length));
        }
      });
      const keySim = (keywordScore > 0 ? (keywordScore / queryTerms.length) : 0);

      const baseSim = (simScore * 0.7) + (keySim * 0.3);
      
      // Decay Engine
      const activeSalience = this.calculateDecay(fact.salience, fact.decay_lambda, fact.last_seen_at);
      
      // Composite Scoring: 0.6x similarity + 0.2x salience + 0.1x recency + 0.1x waypoint (0 for direct queries)
      // Recency bonus: higher if recently seen
      const daysSince = (Date.now() - fact.last_seen_at) / (1000 * 60 * 60 * 24);
      const recency = Math.max(0, 1.0 - (daysSince / 30)); 

      const finalScore = (0.6 * baseSim) + (0.2 * activeSalience) + (0.1 * recency);

      return { ...fact, finalScore, baseSim, activeSalience, sector: fact.sector };
    });

    // Take top raw hits above threshold
    let topHits = scored.filter(f => f.baseSim > 0.05).sort((a, b) => b.finalScore - a.finalScore).slice(0, topK * 2);
    
    // 1-hop Graph Expansion
    let expanded = this.expandWaypoints(topHits);

    let finalResults = expanded.sort((a, b) => b.finalScore - a.finalScore).slice(0, topK);

    // Reinforce recalled items
    const reinforce = this.db.prepare('UPDATE aizen_facts SET hits = hits + 1, last_seen_at = ?, salience = MIN(1.0, salience + 0.1) WHERE id = ?');
    const now = Date.now();
    this.db.transaction(() => {
      for (const r of finalResults) {
        reinforce.run(now, r.id);
      }
    })();

    // Explainable Recall Trace
    return finalResults.map(r => ({
      text: r.text,
      hits: r.hits + 1,
      trace: {
        sector: r.sector,
        similarity: r.baseSim || 0,
        decay: r.activeSalience || 0,
        waypoint_expanded: !!r.isWaypoint
      }
    }));
  }

  /**
   * Formats relevant memories into a concise text block for prompt injection.
   */
  async getFormattedMemory(query) {
    const relevant = await this.findRelevant(query);
    if (relevant.length === 0) return "";
    
    let block = "\n--- MEMORY (Semantic Distillation) ---\n";
    relevant.forEach((f, i) => {
      block += `${i + 1}. [${f.trace.sector.toUpperCase()}] ${f.text}\n    (Sim: ${f.trace.similarity.toFixed(2)} | Salience: ${f.trace.decay.toFixed(2)}${f.trace.waypoint_expanded ? ' | 1-Hop Graph Expand' : ''})\n`;
    });
    block += "--- END MEMORY ---\n";
    return block;
  }

  // Preserve backwards compat API
  async save() { }
  extract(text) { return []; } 
}

module.exports = { MemoryStore };
