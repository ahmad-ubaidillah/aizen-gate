const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * [AZ] Token Budget System
 *
 * Enforces per-phase token budgets to prevent context bloat and cost overruns.
 * Inspired by context engineering best practices from mid-2025.
 */
class TokenBudget {
	constructor(projectRoot, customLimits = {}) {
		this.projectRoot = projectRoot;
		this.ledgerPath = path.join(projectRoot, "aizen-gate", "shared", "token-report.json");
		this.BUDGETS = {
			spec: 4000,
			plan: 6000,
			wp_prompt: 3000,
			research: 8000,
			...customLimits,
		};
		this.TOKENS_PER_CHAR = 0.25; // Heuristic for Sonnet/Gemini
	}

	/**
	 * Fast token estimation based on character count and word boundaries.
	 * Roughly 4 characters per token average.
	 */
	estimate(text) {
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
	async enforce(phase, content) {
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
	async track(phase, model, tokensIn, tokensOut) {
		try {
			await fs.ensureDir(path.dirname(this.ledgerPath));
			let ledger = [];
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
			console.error(chalk.red(`[Budget] Tracking failed: ${err.message}`));
		}
	}

	/**
	 * Generates a summary report of token usage and hypothetical savings.
	 */
	async getReport() {
		if (!fs.existsSync(this.ledgerPath)) return "No token usage data recorded yet.";

		const ledger = await fs.readJson(this.ledgerPath);
		if (ledger.length === 0) return "No data.";

		const summary = ledger.reduce(
			(acc, entry) => {
				acc.totalIn += entry.tokensIn;
				acc.totalOut += entry.tokensOut;
				acc.phases[entry.phase] =
					(acc.phases[entry.phase] || 0) + (entry.tokensIn + entry.tokensOut);
				return acc;
			},
			{ totalIn: 0, totalOut: 0, phases: {} },
		);

		return {
			total_tokens: summary.totalIn + summary.totalOut,
			input_tokens: summary.totalIn,
			output_tokens: summary.totalOut,
			phase_breakdown: summary.phases,
			last_updated: ledger[ledger.length - 1].timestamp,
		};
	}
}

module.exports = { TokenBudget };
