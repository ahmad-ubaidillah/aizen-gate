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
 */
export async function loadAizenCore() {
	const core = require("./aizen.cjs");

	return {
		calculateJaccard: core.calculate_jaccard,
		heuristicDistill: core.heuristic_distill,
		mergeVectorClocks: core.merge_vector_clocks,
		__wasm: core.__wasm,
	};
}
