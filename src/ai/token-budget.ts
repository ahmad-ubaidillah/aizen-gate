/**
 * [AZ] Token Budget System
 *
 * Enforces per-phase token budgets to prevent context bloat and cost overruns.
 * Inspired by context engineering best practices from mid-2025.
 */

import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Phase token limits
 */
export interface BudgetLimits {
	spec?: number;
	plan?: number;
	wp_prompt?: number;
	research?: number;
	[key: string]: number | undefined;
}

/**
 * Token ledger entry
 */
export interface TokenLedgerEntry {
	timestamp: string;
	phase: string;
	model: string;
	tokensIn: number;
	tokensOut: number;
	total: number;
}

/**
 * Token budget report
 */
export interface TokenBudgetReport {
	total_tokens: number;
	input_tokens: number;
	output_tokens: number;
	phase_breakdown: Record<string, number>;
	last_updated: string;
}

/**
 * [AZ] Token Budget System
 */
export class TokenBudget {
	public projectRoot: string;
	public ledgerPath: string;
	public BUDGETS: BudgetLimits;
	public readonly TOKENS_PER_CHAR = 0.25;

	constructor(projectRoot: string, customLimits: BudgetLimits = {}) {
		this.projectRoot = projectRoot;
		this.ledgerPath = path.join(projectRoot, "aizen-gate", "shared", "token-report.json");
		this.BUDGETS = {
			spec: 4000,
			plan: 6000,
			wp_prompt: 3000,
			research: 8000,
			...customLimits,
		};
	}

	/**
	 * Fast token estimation based on character count and word boundaries.
	 * Roughly 4 characters per token average.
	 */
	estimate(text: string): number {
		if (!text) return 0;
		// Heuristic: Count punctuation and spaces as likely token boundaries
		// This is more accurate than simple count/4
		const wordCount = text.split(/\s+/).length;
		const charCount = text.length;
		return Math.max(Math.ceil(charCount / 4), Math.ceil(wordCount * 1.3));
	}

	/**
	 * Enforces budget for a specific phase by summarizing or truncating.
	 */
	async enforce(phase: string, content: string): Promise<string> {
		const limit = this.BUDGETS[phase] || 4000;
		const currentTokens = this.estimate(content);

		if (currentTokens <= limit) {
			return content;
		}

		console.log(
			chalk.yellow(
				`[Aizen] Budget overrun in "${phase}" (${currentTokens} > ${limit}). Enforcing limit...`,
			),
		);

		// TRUNCATION STRATEGY: Header + Tail with Truncation Note
		// Keeps critical start (instructions) and end (latest context)
		const allowedChars = limit * 3.5; // Back off slightly from 4 to be safe
		const head = content.slice(0, Math.floor(allowedChars * 0.4));
		const tail = content.slice(-Math.floor(allowedChars * 0.5));

		return [
			head,
			`\n\n... [Aizen Token Budget Enforced: ${currentTokens - limit} tokens truncated] ...\n\n`,
			tail,
		].join("\n");
	}

	/**
	 * Records token usage for historical analysis and reporting.
	 */
	async track(phase: string, model: string, tokensIn: number, tokensOut: number): Promise<void> {
		try {
			await fs.ensureDir(path.dirname(this.ledgerPath));
			let ledger: TokenLedgerEntry[] = [];
			if (fs.existsSync(this.ledgerPath)) {
				ledger = await fs.readJson(this.ledgerPath);
			}

			ledger.push({
				timestamp: new Date().toISOString(),
				phase,
				model,
				tokensIn,
				tokensOut,
				total: tokensIn + tokensOut,
			});

			// Keep last 100 entries for lightweight report
			if (ledger.length > 100) ledger.shift();

			await fs.writeJson(this.ledgerPath, ledger, { spaces: 2 });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			console.error(chalk.red(`[Budget] Tracking failed: ${errorMessage}`));
		}
	}

	/**
	 * Generates a summary report of token usage and hypothetical savings.
	 */
	async getReport(): Promise<string | TokenBudgetReport> {
		if (!fs.existsSync(this.ledgerPath)) return "No token usage data recorded yet.";

		const ledger = await fs.readJson(this.ledgerPath);
		if (ledger.length === 0) return "No data.";

		// Use for loop instead of reduce to avoid typing issues
		const summary = { totalIn: 0, totalOut: 0, phases: {} as Record<string, number> };
		for (const entry of ledger) {
			summary.totalIn += entry.tokensIn;
			summary.totalOut += entry.tokensOut;
			summary.phases[entry.phase] =
				(summary.phases[entry.phase] || 0) + entry.tokensIn + entry.tokensOut;
		}

		return {
			total_tokens: summary.totalIn + summary.totalOut,
			input_tokens: summary.totalIn,
			output_tokens: summary.totalOut,
			phase_breakdown: summary.phases,
			last_updated: ledger[ledger.length - 1].timestamp,
		};
	}
}
