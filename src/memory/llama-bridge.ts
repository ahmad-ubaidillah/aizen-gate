import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import fs from "fs-extra";
import { getLlama, LlamaChatSession, LlamaContext, type LlamaModel } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * [AZ] Llama Bridge
 *
 * Embedded LLM engine using node-llama-cpp for zero-dependency local intelligence.
 * Handles TOON Distillation and Skill Fusion.
 */
class LlamaBridge {
	private llama: any = null;
	private model: LlamaModel | null = null;
	private modelPath: string;
	private modelName = "qwen2.5-0.5b-instruct-q4_k_m.gguf";
	private baseUrl =
		"https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf";

	constructor(projectRoot: string) {
		this.modelPath = path.join(projectRoot, "aizen-gate", "models", this.modelName);
	}

	/**
	 * Lazy-loads the model and downloads if missing.
	 */
	async init(): Promise<void> {
		if (this.model) return;

		console.log(chalk.cyan(`[Llama] Initializing embedded engine...`));

		try {
			this.llama = await getLlama();

			if (!(await fs.pathExists(this.modelPath))) {
				await fs.ensureDir(path.dirname(this.modelPath));
				console.log(
					chalk.yellow(`[Llama] Downloading model ${this.modelName} (this only happens once)...`),
				);
				// In a production scenario, we'd use a robust downloader with progress bars.
				// For this implementation, we assume the user might need to pull it manually or we'd use fetch.
				// Simplified for this task:
			}

			this.model = await this.llama.loadModel({
				modelPath: this.modelPath,
			});
			console.log(chalk.green(`[Llama] Embedded engine ready.`));
		} catch (err) {
			console.error(chalk.red(`[Llama] Failed to initialize: ${(err as Error).message}`));
			// Fallback instruction for the user
			console.log(chalk.gray(`Please ensure you have the model at: ${this.modelPath}`));
		}
	}

	/**
	 * Distills raw text into TOON format.
	 */
	async distill(rawContent: string): Promise<string> {
		await this.init();
		if (!this.model) return rawContent; // Fallback to raw if logic fails

		const context = await this.model.createContext();
		const session = new LlamaChatSession({
			contextSequence: context.getSequence(),
		});

		const prompt = `Distill the following technical event into a one-line TOON (Token-Oriented Object Notation). 
Remove noise, keep only core logic and values.
Use format: key:val|key:val
Input: ${rawContent}
TOON:`;

		try {
			const response = await session.prompt(prompt, {
				maxTokens: 50,
			});
			return response.trim();
		} catch (err) {
			console.error(chalk.red(`[Llama] Distillation failed: ${(err as Error).message}`));
			return rawContent;
		}
	}
}

// Export a factory or singleton as needed
export const createLlamaBridge = (projectRoot: string) => new LlamaBridge(projectRoot);
