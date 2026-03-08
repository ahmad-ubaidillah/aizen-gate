/**
 * Orchestrator API Envelope
 * Provides a standardized JSON API for external tools, CIs, and GUI wrappers
 * to drive Aizen-Gate headlessly.
 */

import path from "node:path";
import { ModelRouter } from "../ai/model-router.js";
import { MemoryStore } from "../memory/memory-store.js";
import { runAutoLoop } from "./auto-loop.js";
import { DependencyGraph } from "./dependency-graph.js";
import { MergeEngine } from "./merge-engine.js";

export interface APIEnvelope {
	metadata: {
		timestamp: string;
		version: string;
		engine: string;
	};
	status: number;
	message: string;
	data: any;
}

export class OrchestratorAPI {
	private projectDir: string;

	constructor(projectRoot: string) {
		this.projectDir = projectRoot;
	}

	/**
	 * Return the entire topology of the specified feature.
	 */
	async getDependencyGraph(featureSlug: string): Promise<APIEnvelope> {
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
			return this._envelope(null, 500, (err as Error).message);
		}
	}

	/**
	 * Trigger the autonomous execution wave headlessly
	 */
	async triggerAutoSprint(): Promise<APIEnvelope> {
		try {
			const res = await runAutoLoop(this.projectDir);
			return this._envelope(res);
		} catch (err) {
			return this._envelope(null, 500, (err as Error).message);
		}
	}

	/**
	 * Execute the merge strategy for a complete feature graph
	 */
	async dispatchMerge(featureSlug: string, targetBranch: string = "main"): Promise<APIEnvelope> {
		try {
			const featureDir = path.join(this.projectDir, "aizen-gate", "specs", featureSlug);
			// installer might not be in src/, let's assume it's moved or check its location
			const { installAizenGate } = (await import("../../installer/src/install.js")) as any;
			const _result = await (installAizenGate as any)(this.projectDir, "antigravity");
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

			const success = await merger.executeMerge(featureSlug, sort, targetBranch);
			return this._envelope({ status: success ? "SUCCESS" : "FAILED" }, success ? 200 : 500);
		} catch (err) {
			return this._envelope(null, 500, (err as Error).message);
		}
	}

	/**
	 * Universal Envelope wrapping JSON outputs for predictability across consumers.
	 */
	public formatResponse(data: any, status: number = 200, message: string = "OK"): APIEnvelope {
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

	/** @deprecated Use formatResponse */
	public _envelope(data: any, status: number = 200, message: string = "OK"): APIEnvelope {
		return this.formatResponse(data, status, message);
	}
}
