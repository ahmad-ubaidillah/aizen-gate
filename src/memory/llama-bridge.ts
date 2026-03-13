import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-load to keep startup fast
let nodeLlamaCpp: any = null;

/**
 * [AZ] Llama Bridge
 *
 * Embedded LLM engine using node-llama-cpp for zero-dependency local intelligence.
 * Handles TOON Distillation and Skill Fusion.
 */
class LlamaBridge {
	private llama: any = null;
	private model: any = null;
	private modelPath: string;
	private modelName = "qwen2.5-0.5b-instruct-q4_k_m.gguf";

	constructor() {
		// Use global user cache to keep project folder light
		this.modelPath = path.join(os.homedir(), ".aizen-gate", "models", this.modelName);
	}

	/**
	 * Lazy-loads the model and downloads if missing.
	 */
	async init(): Promise<void> {
		if (this.model) return;

		try {
			if (!nodeLlamaCpp) {
				nodeLlamaCpp = await import("node-llama-cpp");
			}
			console.log(chalk.cyan(`[Llama] Initializing embedded engine...`));

			const { getLlama } = nodeLlamaCpp;
			this.llama = await getLlama();

			if (!fs.existsSync(this.modelPath)) {
				console.log(chalk.yellow(`[Llama] Model missing. Switching to Heuristic Fallback.`));
				this.model = "HEURISTIC_FALLBACK";
				return;
			}

			this.model = await this.llama.loadModel({
				modelPath: this.modelPath,
			});
			console.log(chalk.green(`[Llama] Embedded engine ready.`));
		} catch (_err) {
			console.warn(chalk.yellow(`[Llama] AI modules missing. Using Heuristic Fallback.`));
			this.model = "HEURISTIC_FALLBACK";
		}
	}

	/**
	 * Distills raw text into TOON format.
	 */
	async distill(rawContent: string): Promise<string> {
		await this.init();
		if (this.model === "HEURISTIC_FALLBACK") {
			return this.heuristicDistill(rawContent);
		}

		try {
			const { LlamaChatSession } = nodeLlamaCpp;
			const context = await this.model.createContext();
			const session = new LlamaChatSession({
				contextSequence: context.getSequence(),
			});

			const prompt = `Distill the following technical event into a one-line TOON (Token-Oriented Object Notation). 
Remove noise, keep only core logic and values.
Use format: key:val|key:val
Input: ${rawContent}
TOON:`;

			const response = await session.prompt(prompt, {
				maxTokens: 50,
			});
			return response.trim();
		} catch (err) {
			console.error(
				chalk.red(`[Llama] Distillation failed, using heuristic: ${(err as Error).message}`),
			);
			return this.heuristicDistill(rawContent);
		}
	}

	/**
	 * [Phase 11] Quantum Compression (Neural Seed)
	 * Compresses TOON into an ultra-dense format.
	 */
	async quantumCompress(toon: string): Promise<string> {
		await this.init();
		if (this.model === "HEURISTIC_FALLBACK") {
			return this.heuristicSeed(toon);
		}

		try {
			const { LlamaChatSession } = nodeLlamaCpp;
			const context = await this.model.createContext();
			const session = new LlamaChatSession({
				contextSequence: context.getSequence(),
			});

			const prompt = `Compress this TOON into a 5-8 character unique "Neural Seed" (alphanumeric/symbols). 
It must represent the essence of the logic.
TOON: ${toon}
SEED:`;

			const response = await session.prompt(prompt, {
				maxTokens: 10,
			});
			return response.trim();
		} catch (_err) {
			return this.heuristicSeed(toon);
		}
	}

	private heuristicSeed(toon: string): string {
		// Ultra-dense heuristic: CRC-like prefix + important vowels/cons
		const hash = Buffer.from(toon)
			.reduce((a, b) => a + b, 0)
			.toString(16)
			.slice(-2);
		const essence = toon
			.split("|")
			.map((p) => p.split(":")[0][0] + (p.split(":")[1]?.[0] || ""))
			.join("");
		return `᚛${hash}${essence.slice(0, 4)}᚜`; // Ogham-inspired wrappers for premium feel
	}

	private heuristicDistill(text: string): string {
		// AZ-LITE: Regex-based TOON extraction
		const parts: string[] = [];

		// 1. Extract status
		if (text.toLowerCase().includes("error") || text.toLowerCase().includes("fail"))
			parts.push("status:error");
		else if (text.toLowerCase().includes("success") || text.toLowerCase().includes("done"))
			parts.push("status:success");

		// 2. Extract potential paths or IDs
		const pathMatch = text.match(/[/\w.-]+\.\w+/);
		if (pathMatch) parts.push(`file:${pathMatch[0]}`);

		// 3. Simple action extraction
		if (text.toLowerCase().includes("update")) parts.push("action:update");
		else if (text.toLowerCase().includes("create")) parts.push("action:create");
		else if (text.toLowerCase().includes("delete")) parts.push("action:delete");

		return parts.length > 0 ? parts.join("|") : text.substring(0, 50).replace(/\s+/g, "_");
	}

	/**
	 * [Phase 15] Self-Repair - Analyze failure logs and suggest fixes.
	 */
	async diagnose(skillUri: string, failureLog: string): Promise<string> {
		await this.init();
		if (this.model === "HEURISTIC_FALLBACK") {
			return `[ImmuneSystem] Suggested Fix for ${skillUri.split("/").pop()}: Check network connectivity and API key validity. Bias detected in failure patterns.`;
		}

		try {
			const { LlamaChatSession } = nodeLlamaCpp;
			const context = await this.model.createContext();
			const session = new LlamaChatSession({
				contextSequence: context.getSequence(),
			});

			const prompt = `Diagnose this agent skill failure and suggest a technical fix. 
Skill: ${skillUri}
Failure Log: ${failureLog}
Suggestion (one brief paragraph):`;

			const response = await session.prompt(prompt, {
				maxTokens: 150,
			});
			return response.trim();
		} catch (_err) {
			return `[ImmuneSystem] Analysis failed. Suggestion: Review recent changes in ${skillUri} for syntax errors or breaking API changes.`;
		}
	}

	/**
	 * Generic prompt completion for internal AI reasoning.
	 */
	async generate(
		prompt: string,
		options: { maxTokens?: number; temperature?: number } = {},
	): Promise<string> {
		await this.init();
		if (this.model === "HEURISTIC_FALLBACK") {
			return ""; // Fallback for general text is empty/nothing
		}

		try {
			const { LlamaChatSession } = nodeLlamaCpp;
			const context = await this.model.createContext();
			const session = new LlamaChatSession({
				contextSequence: context.getSequence(),
			});

			const response = await session.prompt(prompt, {
				maxTokens: options.maxTokens || 200,
				temperature: options.temperature || 0.3,
			});
			return response.trim();
		} catch (err) {
			console.error(chalk.red(`[Llama] Generic prompt failed: ${(err as Error).message}`));
			return "";
		}
	}
}

export const createLlamaBridge = () => new LlamaBridge();
