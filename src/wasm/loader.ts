import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Universal WASM Loader for Aizen-Gate Core
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * Universal WASM Loader for Aizen-Gate Core (Rust Edition)
 * Includes error handling for graceful degradation when WASM is unavailable.
 */
export async function loadAizenCore() {
	try {
		const core = require("./aizen.cjs");

		return {
			calculateJaccard: core.calculate_jaccard,
			heuristicDistill: core.heuristic_distill,
			mergeVectorClocks: core.merge_vector_clocks,
			__wasm: core.__wasm,
			_isLoaded: true,
		};
	} catch (error) {
		// Graceful degradation - return mock functions when WASM fails to load
		console.warn("[WASM Loader] Failed to load Rust core, using JS fallback:", (error as Error).message);

		return {
			// Fallback implementations
			calculateJaccard: (a: string, b: string) => {
				const setA = new Set(a.split(/\s+/));
				const setB = new Set(b.split(/\s+/));
				const intersection = new Set([...setA].filter(x => setB.has(x))).size;
				const union = setA.size + setB.size - intersection;
				return union > 0 ? intersection / union : 0;
			},
			heuristicDistill: (text: string) => {
				// Simple heuristic: extract key-value pairs
				const pairs = text.match(/(\w+):([^\n,]+)/g) || [];
				return pairs.length > 0 ? pairs.join(", ") : text.slice(0, 50).replace(/\s+/g, "_");
			},
			mergeVectorClocks: (clockA: string, clockB: string) => {
				try {
					const a = JSON.parse(clockA);
					const b = JSON.parse(clockB);
					const merged = { ...a };
					for (const [node, clock] of Object.entries(b)) {
						merged[node] = Math.max(merged[node] || 0, clock as number);
					}
					return JSON.stringify(merged);
				} catch {
					return "{}";
				}
			},
			__wasm: null,
			_isLoaded: false,
		};
	}
}
