const { WorkPackage } = require('./wp-model');

class DependencyGraph {
  constructor(featureDir) {
    this.featureDir = featureDir;
    this.wps = [];
    this.graph = {}; // Map: WP ID -> List of its dependencies
  }

  /**
   * Scan feature directory and parse all work packages into a dependency graph.
   */
  async build() {
    this.wps = await WorkPackage.loadAllWPs(this.featureDir);
    this.graph = {};
    for (const wp of this.wps) {
      if (!wp.id) continue;
      // We only consider dependencies that actively exist as WP files
      this.graph[wp.id] = (wp.dependencies || []).filter(dep => this.wps.some(w => w.id === dep));
    }
  }

  /**
   * Detect circular dependencies using DFS three-color marking
   */
  detectCycles() {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = {};
    for (const wpId in this.graph) {
      color[wpId] = WHITE;
    }

    const cycles = [];

    const dfs = (node, path) => {
      color[node] = GRAY;
      path.push(node);

      const deps = this.graph[node] || [];
      for (const neighbor of deps) {
        if (color[neighbor] === GRAY) {
          // Back-edge found -> cycle
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart !== -1) {
            cycles.push([...path.slice(cycleStart), neighbor]);
          }
        } else if (color[neighbor] === WHITE) {
          // Recurse
          dfs(neighbor, [...path]); // copy path
        }
      }

      path.pop();
      color[node] = BLACK;
    };

    for (const wpId in this.graph) {
      if (color[wpId] === WHITE) {
        dfs(wpId, []);
      }
    }

    return cycles.length > 0 ? cycles : null;
  }

  /**
   * Returns a topologigally sorted list of WP IDs (Kahn's algorithm).
   * Note: This works correctly because graph keys map ID to its dependencies.
   * If A depends on B, we process A's dependencies first, so we want the order to start from roots.
   */
  /**
   * Computes dependency-aware waves for parallel execution.
   * Returns an array of arrays: [ [wave0_ids], [wave1_ids], ... ]
   */
  computeWaves() {
    if (this.detectCycles()) {
      throw new Error("Graph contains a cycle - cannot compute waves");
    }

    const inDegree = {};
    const reverseAdj = {};
    const ids = Object.keys(this.graph);

    for (const id of ids) {
      inDegree[id] = (this.graph[id] || []).length;
      reverseAdj[id] = [];
    }

    for (const [id, deps] of Object.entries(this.graph)) {
      for (const dep of deps) {
        if (!reverseAdj[dep]) reverseAdj[dep] = [];
        reverseAdj[dep].push(id);
      }
    }

    const waves = [];
    let currentWave = ids.filter(id => inDegree[id] === 0);

    while (currentWave.length > 0) {
      waves.push(currentWave.sort());
      const nextWave = [];
      
      for (const node of currentWave) {
        for (const dependent of (reverseAdj[node] || [])) {
          inDegree[dependent]--;
          if (inDegree[dependent] === 0) {
            nextWave.push(dependent);
          }
        }
      }
      currentWave = nextWave;
    }

    return waves;
  }

  /**
   * Find WPs that directly depend on the given wpId
   */
  getDependents(wpId) {
    const deps = [];
    for (const [id, dependencies] of Object.entries(this.graph)) {
      if (dependencies.includes(wpId)) {
        deps.push(id);
      }
    }
    return deps.sort();
  }

  /**
   * Validate standard required params for deps declaration
   */
  validateDependencies(wpId, declaredDeps) {
    const errors = [];
    const wpPattern = /^WP\d+$/;

    for (const dep of declaredDeps) {
      if (!wpPattern.test(dep)) {
        errors.push(`Invalid WP ID format: ${dep}`);
      }
      if (dep === wpId) {
        errors.push(`Cannot depend on self: ${wpId} → ${wpId}`);
      }
    }

    return errors;
  }
}

module.exports = { DependencyGraph };
