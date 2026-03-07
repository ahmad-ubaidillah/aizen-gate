const fs = require("fs-extra");
const path = require("node:path");
const _chalk = require("chalk");

/**
 * Aizen-Gate Model Debate Engine (Advanced Adversarial Edition)
 */
class DebateEngine {
	constructor(projectRoot, featureDir) {
		this.projectRoot = projectRoot;
		this.featureDir = featureDir;
		this.debateId = `debate-${Date.now()}`;
		this.historyPath = path.join(
			projectRoot,
			"aizen-gate",
			"shared",
			"debates",
			`${this.debateId}.md`,
		);
		this.proposals = [];
		this.critiques = [];
		this.moderations = [];
		this.synthesis = null;
		this.validation = null;
	}

	/**
	 * Add a proposal [ARCH] - The "Thesis"
	 */
	async addProposal(content) {
		this.proposals.push({
			role: "Architect (Thesis)",
			content,
			timestamp: new Date().toISOString(),
		});
		await this.persist();
	}

	/**
	 * Add a critique [DEV] - The "Antithesis"
	 */
	async addCritique(content) {
		this.critiques.push({
			role: "Developer (Antithesis)",
			content,
			timestamp: new Date().toISOString(),
		});
		await this.persist();
	}

	/**
	 * Add moderation [SOCRATES] - Identifying tensions and forcing specificity
	 */
	async addModeration(content) {
		this.moderations.push({
			role: "Socrates (Moderator)",
			content,
			timestamp: new Date().toISOString(),
		});
		await this.persist();
	}

	/**
	 * Add synthesis [PLATO] - Merging views into a coherent resolution
	 */
	async addSynthesis(content) {
		this.synthesis = { role: "Plato (Synthesizer)", content, timestamp: new Date().toISOString() };
		await this.persist();
	}

	/**
	 * Add validation [ATHENA] - 7-dimension quality check
	 */
	async addValidation(scores) {
		// scores: { feasibility: 0-10, scalability: 0-10, security: 0-10, testability: 0-10, maintainability: 0-10, performance: 0-10, ux: 0-10 }
		this.validation = { role: "Athena (Validator)", scores, timestamp: new Date().toISOString() };
		await this.persist();
	}

	async persist() {
		let log = `# ⛩️ Adversarial Debate: ${this.debateId}\n\n`;
		log += `Feature: ${path.basename(this.featureDir)}\n\n`;

		log += `## 🏗️ 1. Proposals (Thesis)\n`;
		this.proposals.forEach((p) => (log += `### ${p.role}\n${p.content}\n\n`));

		log += `## 🌪️ 2. Critiques (Antithesis)\n`;
		this.critiques.forEach((c) => (log += `### ${c.role}\n${c.content}\n\n`));

		log += `## ⚖️ 3. Moderation (Socrates)\n`;
		this.moderations.forEach((m) => (log += `### ${m.role}\n${m.content}\n\n`));

		if (this.synthesis) {
			log += `## 📜 4. Synthesis (Plato)\n### ${this.synthesis.role}\n${this.synthesis.content}\n\n`;
		}

		if (this.validation) {
			log += `## 🛡️ 5. Validation (Athena)\n`;
			log += `| Dimension | Score (0-10) |\n|---|---|\n`;
			Object.entries(this.validation.scores).forEach(([d, s]) => {
				log += `| ${d} | ${s} |\n`;
			});
			const avg = Object.values(this.validation.scores).reduce((a, b) => a + b, 0) / 7;
			log += `\n**Overall Quality Score:** ${avg.toFixed(2)}/10\n\n`;
		}

		await fs.ensureDir(path.dirname(this.historyPath));
		await fs.writeFile(this.historyPath, log);

		// Also update a local debate_log.md for the feature
		await fs.writeFile(path.join(this.featureDir, "debate_log.md"), log);
	}
}

module.exports = { DebateEngine };
