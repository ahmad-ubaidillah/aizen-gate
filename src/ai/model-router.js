const fs = require("fs-extra");
const path = require("node:path");
const yaml = require("js-yaml");
const chalk = require("chalk");

/**
 * [AZ] ModelRouter (v2.0)
 *
 * Orchestrates model selection using cost-aware escalation and phase context.
 * Enables massive savings by routing classification/summary to cheap models
 * while reserving premium models for complex reasoning.
 */
class ModelRouter {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.configPath = path.join(projectRoot, "backlog", "config.yml");
		this.profilesPath = path.join(projectRoot, "profiles.yaml");
		this.ledgerPath = path.join(projectRoot, "aizen-gate", "shared", "token-report.json");

		this.config = this.loadConfig();
		this.profiles = this.loadProfiles();
	}

	loadConfig() {
		if (!fs.existsSync(this.configPath)) return { model_family: "Balanced" };
		try {
			return yaml.load(fs.readFileSync(this.configPath, "utf8"));
		} catch (_e) {
			return { model_family: "Balanced" };
		}
	}

	loadProfiles() {
		if (!fs.existsSync(this.profilesPath))
			return {
				families: {
					classification: ["anthropic/claude-3-haiku", "google/gemini-flash-1.5"],
					implementation: ["anthropic/claude-3-5-sonnet", "openai/gpt-4o"],
					reasoning: ["anthropic/claude-3-opus", "openai/o1-preview"],
					verification: ["anthropic/claude-3-5-sonnet", "openai/gpt-4o-mini"],
				},
			};
		try {
			return yaml.load(fs.readFileSync(this.profilesPath, "utf8"));
		} catch (e) {
			console.error(chalk.red(`[Router] Failed to load profiles: ${e.message}`));
			return { families: {} };
		}
	}

	/**
	 * Escalation Routing: Starts with first in list (cheapest by convention),
	 * escalates on failure or if high confidence/reasoning is requested.
	 */
	resolveModel(taskType = "implementation", level = "standard") {
		const families = this.profiles.families || {};
		const family = families[taskType] || families.implementation;

		if (!family || family.length === 0) return "anthropic/claude-3-5-sonnet";

		const familyMode = this.config.model_family || "Balanced";

		if (familyMode === "Budget" || familyMode === "Cheap") {
			return family[0]; // Always cheapest
		}

		if (familyMode === "Reasoning" || familyMode === "Quality") {
			return family[family.length - 1]; // Always premium
		}

		// Balanced Mode (Standard)
		if (level === "high_confidence" || level === "complex") {
			// Skip the cheap first model, go for the premium one (usually last)
			return family[family.length - 1];
		}

		return family[0];
	}

	/**
	 * Specialist selection for the Aizen adversarial loop.
	 */
	resolveDebateModels() {
		return {
			proposer: this.resolveModel("reasoning", "high_confidence"),
			opposer: this.resolveModel("verification", "standard"),
		};
	}

	/**
	 * Enhanced token tracking with cost calculation and historical logging.
	 * Integrates with the TokenBudget's ledger.
	 */
	async trackCost(wpId, model, tokensIn, tokensOut, phase = "auto") {
		const costPath = path.join(this.projectRoot, "aizen-gate", "shared", "cost-log.json");
		await fs.ensureDir(path.dirname(costPath));

		const rates = {
			opus: { in: 15, out: 75 },
			sonnet: { in: 3, out: 15 },
			haiku: { in: 0.25, out: 1.25 },
			"gpt-4o": { in: 5, out: 15 },
			mini: { in: 0.15, out: 0.6 },
			flash: { in: 0.1, out: 0.4 },
			o1: { in: 15, out: 60 },
		};

		const shortName = model.split("/").pop().toLowerCase();
		// More precise model matching to avoid wrong rate selection
		let rate = rates.sonnet; // Default
		for (const [key, value] of Object.entries(rates)) {
			if (shortName.includes(key)) {
				rate = value;
				break;
			}
		}

		const cost = (tokensIn / 1000000) * rate.in + (tokensOut / 1000000) * rate.out;

		// 1. Log to detailed cost-log.json
		let logs = [];
		if (fs.existsSync(costPath)) {
			try {
				logs = await fs.readJson(costPath);
			} catch {
				logs = [];
			}
		}

		logs.push({
			timestamp: new Date().toISOString(),
			wpId,
			phase,
			model,
			tokens: { in: tokensIn, out: tokensOut },
			cost: cost.toFixed(6),
		});

		if (logs.length > 500) logs.shift();
		await fs.writeJson(costPath, logs, { spaces: 2 });

		// 2. Integration with TokenBudget reporting (Shared Ledger)
		if (fs.existsSync(this.ledgerPath)) {
			try {
				const ledger = await fs.readJson(this.ledgerPath);
				ledger.push({
					timestamp: new Date().toISOString(),
					phase,
					model,
					tokensIn,
					tokensOut,
					cost: parseFloat(cost.toFixed(6)),
				});
				if (ledger.length > 200) ledger.shift();
				await fs.writeJson(this.ledgerPath, ledger, { spaces: 2 });
			} catch (_e) {
				/* silent on ledger errs */
			}
		}
	}
}

module.exports = { ModelRouter };
