const { pipeline } = require("@xenova/transformers");
const _path = require("node:path");
const _fs = require("fs-extra");
const chalk = require("chalk");

/**
 * [AZ] Local Embedding Utility
 *
 * Uses @xenova/transformers to generate high-quality text embeddings locally.
 * Zero API costs, runs on CPU/GPU via ONNX Runtime.
 */
class LocalEmbedding {
	constructor() {
		this.modelName = "Xenova/all-MiniLM-L6-v2";
		this.extractor = null;
		this.isInitializing = false;
	}

	/**
	 * Lazy-loads the model only when needed.
	 */
	async init() {
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
			console.error(chalk.red(`[Embed] Failed to load local model: ${err.message}`));
			throw err;
		} finally {
			this.isInitializing = false;
		}
	}

	/**
	 * Generates a vector for the given text.
	 */
	async embed(text) {
		await this.init();
		try {
			const output = await this.extractor(text, { pooling: "mean", normalize: true });
			return Array.from(output.data);
		} catch (err) {
			console.error(chalk.red(`[Embed] Embedding failed: ${err.message}`));
			return null;
		}
	}

	/**
	 * Computes cosine similarity between two vectors.
	 */
	similarity(vecA, vecB) {
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
const localEmbedding = new LocalEmbedding();

module.exports = { localEmbedding };
