/**
 * Dependency Graph for Work Packages
 */

/**
 * Work package interface (minimal)
 */
interface WorkPackageMinimal {
	id?: string;
	dependencies?: string[];
	[key: string]: unknown;
}

/**
 * DependencyGraph: Manages work package dependencies
 */
export class DependencyGraph {
	public featureDir: string;
	public wps: WorkPackageMinimal[];
	public graph: Record<string, string[]>;

	constructor(featureDir: string) {
		this.featureDir = featureDir;
		this.wps = [];
		this.graph = {}; // Map: WP ID -> List of its dependencies
	}

	/**
	 * Scan feature directory and parse all work packages into a dependency graph.
	 */
	async build(): Promise<void> {
		try {
			const { WorkPackage } = await import("../tasks/wp-model.js");
			this.wps = (await WorkPackage.loadAllWPs(this.featureDir)) as unknown as WorkPackageMinimal[];
		} catch {
			// If WorkPackage is not available, use empty array
			this.wps = [];
		}
		this.graph = {};
		for (const wp of this.wps) {
			if (!wp.id) continue;
			// We only consider dependencies that actively exist as WP files
			this.graph[wp.id] = (wp.dependencies || []).filter((dep) =>
				this.wps.some((w) => w.id === dep),
			);
		}
	}

	/**
	 * Detect circular dependencies using DFS three-color marking
	 */
	detectCycles(): string[][] | null {
		const WHITE = 0;
		const GRAY = 1;
		const BLACK = 2;
		const color: Record<string, number> = {};
		for (const wpId in this.graph) {
			color[wpId] = WHITE;
		}

		const cycles: string[][] = [];

		const dfs = (node: string, path: string[]): void => {
			color[node] = GRAY;
			path.push(node);

			const deps = this.graph[node] || [];
			for (const neighbor of deps) {
				if (color[neighbor] === GRAY) {
					const cycleStart = path.indexOf(neighbor);
					if (cycleStart !== -1) {
						cycles.push([...path.slice(cycleStart), neighbor]);
					}
				} else if (color[neighbor] === WHITE) {
					dfs(neighbor, [...path]);
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
	 * Flat list of WP IDs in dependency order.
	 */
	topologicalSort(): string[] {
		const waves = this.computeWaves();
		return waves.flat();
	}

	/**
	 * Computes dependency-aware waves for parallel execution.
	 * Returns an array of arrays: [ [wave0_ids], [wave1_ids], ... ]
	 */
	computeWaves(): string[][] {
		if (this.detectCycles()) {
			throw new Error("Graph contains a cycle - cannot compute waves");
		}

		const inDegree: Record<string, number> = {};
		const reverseAdj: Record<string, string[]> = {};
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

		const waves: string[][] = [];
		let currentWave = ids.filter((id) => inDegree[id] === 0);

		while (currentWave.length > 0) {
			waves.push(currentWave.sort());
			const nextWave: string[] = [];

			for (const node of currentWave) {
				for (const dependent of reverseAdj[node] || []) {
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
	getDependents(wpId: string): string[] {
		const deps: string[] = [];
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
	validateDependencies(wpId: string, declaredDeps: string[]): string[] {
		const errors: string[] = [];
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
