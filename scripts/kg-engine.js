const { Memory } = require('openmemory-js/dist/core/memory');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

// GLOBAL LOG SUPPRESSION for OpenMemory noise
const originalLog = console.log;
const originalWarn = console.warn;
console.log = (...args) => { 
  const msg = args[0]?.toString() || "";
  if (msg.includes('[EMBED]') || msg.includes('[Vector]') || msg.includes('[decay-2.0]') || msg.includes('[DECAY]') || msg.includes('[PRUNE]') || msg.includes('[INIT]')) return;
  originalLog(...args); 
};
console.warn = (...args) => { 
  const msg = args[0]?.toString() || "";
  if (msg.includes('[CONFIG]')) return;
  originalWarn(...args); 
};

// Ensure OpenMemory defaults are set to avoid noise and server conflicts
process.env.OM_TIER = process.env.OM_TIER || 'fast';
process.env.OM_PORT = process.env.OM_PORT || '8081'; // Avoid 8080 conflict
process.env.OM_DB_PATH = process.env.OM_DB_PATH || path.join(process.cwd(), 'aizen-gate', 'shared', 'memory.db');

/**
 * [AZ] Knowledge Graph Engine
 * 
 * High-level wrapper for openmemory-js to handle structured project entities
 * and their relationships.
 */
class KnowledgeGraph {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.memory = new Memory(); 
    this.namespace = 'aizen-kg';
  }

  /**
   * Adds or updates a node in the graph.
   * @param {string} id Unique identifier (e.g., file path, task ID)
   * @param {string} type Node type (FILE, FEAT, TASK, FUNC)
   * @param {string} content Text description or code content
   * @param {Object} metadata Additional attributes
   */
  async addNode(id, type, content, metadata = {}) {
    const tags = [`lgm:node:${type.toLowerCase()}`, `lgm:id:${id}`];
    if (metadata.tags) tags.push(...metadata.tags);

    const validFrom = metadata.valid_from || new Date().toISOString();
    const validTo = metadata.valid_to || '9999-12-31T23:59:59.999Z';

    const mem = await this.memory.add(content, {
      ...metadata,
      id,
      type,
      tags,
      valid_from: validFrom,
      valid_to: validTo,
      namespace: this.namespace,
      updated_at: Date.now()
    });

    console.log(chalk.gray(`[KG] Temporal Node added: [${type}] ${id} (Valid from: ${validFrom})`));
    return mem;
  }

  /**
   * Adds a relationship between two nodes.
   * Uses waypoints in openmemory-js.
   */
  async addEdge(sourceId, targetId, type, weight = 1.0, metadata = {}) {
    const finalWeight = this._getEdgeWeight(type, weight);
    const validFrom = metadata.valid_from || new Date().toISOString();
    const validTo = metadata.valid_to || '9999-12-31T23:59:59.999Z';
    
    await this.memory.add(`Relation: ${sourceId} ${type} ${targetId}`, {
      source: sourceId,
      target: targetId,
      relation: type,
      valid_from: validFrom,
      valid_to: validTo,
      tags: [`lgm:edge:${type.toLowerCase()}`, `source:${sourceId}`, `target:${targetId}`],
      namespace: this.namespace
    });

    console.log(chalk.gray(`[KG] Edge created: ${sourceId} --(${type})--> ${targetId}`));
  }

  _getEdgeWeight(type, baseWeight) {
    const weights = {
      'DEPENDS_ON': 1.0,
      'IMPLEMENTS': 1.2,
      'DEFINES': 0.9,
      'AFFECTS': 1.1,
      'REFERENCES': 0.7
    };
    return (weights[type] || 0.5) * baseWeight;
  }

  /**
   * Queries the graph for relevant nodes with Point-in-Time filtering.
   */
  async query(text, limit = 5, asOfDate = new Date().toISOString()) {
    const rawResults = await this.memory.search(text, {
      namespace: this.namespace,
      limit: limit * 2 // Fetch extra to account for temporal filtering
    });

    // Temporal point-in-time filter
    const validResults = rawResults.filter(r => {
        const from = r.meta?.valid_from || '1970-01-01T00:00:00.000Z';
        const to = r.meta?.valid_to || '9999-12-31T23:59:59.999Z';
        return asOfDate >= from && asOfDate <= to;
    });

    return validResults.slice(0, limit);
  }

  /**
   * Explains relationships for a specific node.
   */
  async getTrace(nodeId) {
    const results = await this.memory.search(nodeId, {
      namespace: this.namespace,
      limit: 20
    });
    
    return results.map(r => ({
      id: r.id,
      content: r.content,
      type: r.meta?.type || 'EDGE',
      score: r.score
    }));
  }
}

module.exports = { KnowledgeGraph };
