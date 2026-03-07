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
  topologicalSort() {
    if (this.detectCycles()) {
      throw new Error("Graph contains a cycle - cannot topologically sort");
    }

    const inDegree = {};
    const reverseAdj = {}; // Map: WP dependency -> List of WPs that depend on it

    for (const wpId in this.graph) {
      inDegree[wpId] = (this.graph[wpId] || []).length;
      reverseAdj[wpId] = [];
    }

    for (const [wpId, deps] of Object.entries(this.graph)) {
      for (const dep of deps) {
        if (!reverseAdj[dep]) {
          reverseAdj[dep] = [];
        }
        reverseAdj[dep].push(wpId);
      }
    }

    // Nodes with 0 incoming dependecies (i.e. nothing depends on them, root of dependency tree)
    const queue = Object.keys(inDegree).filter(wpId => inDegree[wpId] === 0);
    queue.sort(); 

    const result = [];
    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node);

      for (const dependent of (reverseAdj[node] || []).sort()) {
        inDegree[dependent]--;
        if (inDegree[dependent] === 0) {
          queue.push(dependent);
          queue.sort(); // Re-sort safely
        }
      }
    }

    if (result.length !== Object.keys(this.graph).length) {
      throw new Error("Graph failed topological sort (disconnected parts or missing nodes)");
    }

    return result;
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
