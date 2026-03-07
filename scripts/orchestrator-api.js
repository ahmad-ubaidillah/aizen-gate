/**
 * Orchestrator API Envelope
 * Provides a standardized JSON API for external tools, CIs, and GUI wrappers
 * to drive Aizen-Gate headlessly.
 */
const { runAutoLoop } = require("./auto-loop");
const { DependencyGraph } = require("./dependency-graph");
const { MergeEngine } = require("./merge-engine");
const path = require("path");
const fs = require("fs-extra");

class OrchestratorAPI {
	constructor(projectDir) {
		this.projectDir = projectDir;
	}

	/**
	 * Return the entire topology of the specified feature.
	 */
	async getDependencyGraph(featureSlug) {
		try {
			const featureDir = path.join(this.projectDir, "aizen-gate", "specs", featureSlug);
			const graph = new DependencyGraph(featureDir);
			await graph.build();

			const sort = graph.topologicalSort();
			const cycles = graph.detectCycles();

			return this._envelope({
				wps: graph.wps,
				graph: graph.graph,
				topologicalSort: sort,
				warnings: cycles ? `Cyclic dependencies detected: ${JSON.stringify(cycles)}` : null,
			});
		} catch (err) {
			return this._envelope(null, 500, err.message);
		}
	}

	/**
	 * Trigger the autonomous execution wave headlessly
	 */
	async triggerAutoSprint() {
		try {
			const res = await runAutoLoop(this.projectDir);
			return this._envelope(res);
		} catch (err) {
			return this._envelope(null, 500, err.message);
		}
	}

	/**
	 * Execute the merge strategy for a complete feature graph
	 */
	async dispatchMerge(featureSlug, targetBranch = "main") {
		try {
			const featureDir = path.join(this.projectDir, "aizen-gate", "specs", featureSlug);
			const graph = new DependencyGraph(featureDir);
			await graph.build();
			const sort = graph.topologicalSort();

			const merger = new MergeEngine(this.projectDir);
			merger.runPreflight(featureSlug);
			const conflicts = merger.forecastConflicts(featureSlug, targetBranch, sort);

			if (conflicts.length > 0) {
				return this._envelope(
					{ status: "ABORTED", conflicts },
					409,
					"Conflicts detected. Manual execution required.",
				);
			}

			const success = merger.executeMerge(featureSlug, sort, targetBranch);
			return this._envelope({ status: success ? "SUCCESS" : "FAILED" }, success ? 200 : 500);
		} catch (err) {
			return this._envelope(null, 500, err.message);
		}
	}

	/**
	 * Universal Envelope wrapping JSON outputs for predictability across consumers.
	 */
	_envelope(data, status = 200, message = "OK") {
		return {
			metadata: {
				timestamp: new Date().toISOString(),
				version: "2.0.0",
				engine: "aizen-gate",
			},
			status: status,
			message: message,
			data: data,
		};
	}
}

module.exports = { OrchestratorAPI };
