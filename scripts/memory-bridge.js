const { Memory } = require('openmemory-js');

class MemoryBridge {
  constructor(projectId) {
    // Unique ID for the current Aizen-Gate workspace
    this.projectId = projectId || 'aizen-gate-workspace';
    // Initialize OpenMemory locally (uses SQLite)
    this.mem = new Memory();
  }

  /**
   * Store a significant decision, preference, or context in long-term memory.
   */
  async storeDecision(content, tags = []) {
    try {
      await this.mem.add(content, { user_id: this.projectId, tags: tags });
      return true;
    } catch (e) {
      console.error("[MemoryBridge] Failed to store decision:", e.message);
      return false;
    }
  }

  /**
   * Recall related context based on a semantic query.
   */
  async recallContext(query, limit = 5) {
    try {
      const results = await this.mem.search(query, { user_id: this.projectId, limit: limit });
      return results;
    } catch (e) {
      console.error("[MemoryBridge] Failed to recall context:", e.message);
      return [];
    }
  }

  /**
   * Delete a specific memory node.
   */
  async deleteMemory(memoryId) {
    try {
      await this.mem.delete(memoryId);
      return true;
    } catch(e) {
      console.error("[MemoryBridge] Failed to delete memory:", e.message);
      return false;
    }
  }
}

module.exports = { MemoryBridge };
