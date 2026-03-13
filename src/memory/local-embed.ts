import chalk from "chalk";
import { loadAizenCore } from "../wasm/loader.js";

/**
 * [AZ] Local Embedding Utility
 *
 * Uses @xenova/transformers to generate high-quality text embeddings locally.
 * Zero API costs, runs on CPU/GPU via ONNX Runtime.
 */
class LocalEmbedding {
	private modelName: string;
	private extractor: any;
	private wasm: any = null;
	private isInitializing: boolean;
	private transformers: any = null;

	constructor() {
		this.modelName = "Xenova/bge-micro-v2";
		this.extractor = null;
		this.isInitializing = false;
	}

	/**
	 * Lazy-loads the model only when needed.
	 */
	async init(): Promise<void> {
		if (this.extractor) return;
		if (this.isInitializing) {
			while (this.isInitializing) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			return;
		}

		this.isInitializing = true;
		try {
			// 1. Load Universal WASM Core (Phase 9)
			if (!this.wasm) {
				this.wasm = await loadAizenCore();
				console.log(chalk.green(`[Embed] Universal WASM Core loaded.`));
			}

			if (!this.transformers) {
				this.transformers = await import("@xenova/transformers");
			}
			console.log(chalk.cyan(`[Embed] Loading local model "${this.modelName}"...`));
			const { pipeline } = this.transformers;
			this.extractor = await pipeline("feature-extraction", this.modelName);
			console.log(chalk.green(`[Embed] Local model loaded successfully.`));
		} catch (_err) {
			console.warn(
				chalk.yellow(`[Embed] AI modules missing/failed. Switching to Universal WASM fallback.`),
			);
			this.extractor = "HYBRID_FALLBACK";
		} finally {
			this.isInitializing = false;
		}
	}

	/**
	 * Generates a vector or keyword set for the given text.
	 */
	async embed(text: string): Promise<number[] | string[] | null> {
		await this.init();
		if (this.extractor === "HYBRID_FALLBACK") {
			return this.tokenize(text);
		}

		try {
			const output = await this.extractor(text, { pooling: "mean", normalize: true });
			return Array.from(output.data) as number[];
		} catch (err) {
			console.error(
				chalk.red(`[Embed] Embedding failed, using fallback: ${(err as Error).message}`),
			);
			return this.tokenize(text);
		}
	}

	/**
	 * Computes similarity (Cosine for vectors, Jaccard for keywords).
	 */
	similarity(a: any, b: any): number {
		if (!a || !b) return 0;

		// Vector Cosine Similarity
		if (typeof a[0] === "number" && typeof b[0] === "number") {
			let dot = 0,
				na = 0,
				nb = 0;
			for (let i = 0; i < a.length; i++) {
				dot += a[i] * b[i];
				na += a[i] * a[i];
				nb += b[i] * b[i];
			}
			return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
		}

		// Jaccard Similarity for keywords (tokens)
		return this.jaccard(a, b);
	}

	private jaccard(a: string[], b: string[]): number {
		const setA = new Set(a);
		const setB = new Set(b);
		const intersection = new Set([...setA].filter((x) => setB.has(x)));
		const union = new Set([...setA, ...setB]);
		return intersection.size / union.size;
	}

	private tokenize(text: string): string[] {
		return Array.from(
			new Set(
				text
					.toLowerCase()
					.replace(/[^\w\s]/g, "")
					.split(/\s+/)
					.filter((w) => w.length > 2),
			),
		);
	}

	/**
	 * [Phase 8] Knowledge Synthesis
	 * Unifies multiple fragments into a single Knowledge Node.
	 */
	synthesize(fragments: { content: string; vector: any }[]): {
		summary: string;
		unifiedVector: any;
	} {
		console.log(chalk.cyan(`[Synthesis] Unifying ${fragments.length} memory fragments...`));

		const allTokens = new Set<string>();
		fragments.forEach((f) => {
			const tokens = typeof f.vector[0] === "string" ? f.vector : this.tokenize(f.content);
			tokens.forEach((t: string) => allTokens.add(t));
		});

		// Create a "Unified Vector" (Keyword Set for Lite mode)
		const unifiedVector = Array.from(allTokens);

		// Simple heuristic summary
		const topConcepts = unifiedVector.sort((a, b) => b.length - a.length).slice(0, 5);

		return {
			summary: `Unified Knowledge: ${topConcepts.join(", ")}`,
			unifiedVector,
		};
	}
}

// Singleton instance for the process
export const localEmbedding = new LocalEmbedding();
