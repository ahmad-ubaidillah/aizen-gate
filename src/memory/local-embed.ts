import { pipeline } from "@xenova/transformers";
import chalk from "chalk";

/**
 * [AZ] Local Embedding Utility
 *
 * Uses @xenova/transformers to generate high-quality text embeddings locally.
 * Zero API costs, runs on CPU/GPU via ONNX Runtime.
 */
class LocalEmbedding {
	private modelName: string;
	private extractor: any;
	private isInitializing: boolean;

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
		console.log(chalk.cyan(`[Embed] Loading local model "${this.modelName}"...`));
		try {
			this.extractor = await pipeline("feature-extraction", this.modelName);
			console.log(chalk.green(`[Embed] Local model loaded successfully.`));
		} catch (err) {
			console.error(chalk.red(`[Embed] Failed to load local model: ${(err as Error).message}`));
			throw err;
		} finally {
			this.isInitializing = false;
		}
	}

	/**
	 * Generates a vector for the given text.
	 */
	async embed(text: string): Promise<number[] | null> {
		await this.init();
		try {
			const output = await this.extractor(text, { pooling: "mean", normalize: true });
			return Array.from(output.data) as number[];
		} catch (err) {
			console.error(chalk.red(`[Embed] Embedding failed: ${(err as Error).message}`));
			return null;
		}
	}

	/**
	 * Computes cosine similarity between two vectors.
	 */
	similarity(vecA: number[] | null, vecB: number[] | null): number {
		if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
		let dot = 0,
			na = 0,
			nb = 0;
		for (let i = 0; i < vecA.length; i++) {
			dot += vecA[i] * vecB[i];
			na += vecA[i] * vecA[i];
			nb += vecB[i] * vecB[i];
		}
		return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
	}
}

// Singleton instance for the process
export const localEmbedding = new LocalEmbedding();
