const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const { TokenBudget } = require("../ai/token-budget");
const { OutputFilter } = require("../ai/output-filter");
const { MemoryStore } = require("./memory-store");

const { ModelRouter } = require("../ai/model-router");

/**
 * [AZ] ContextEngine (v2.0)
 *
 * Orchestrates budget enforcement, output filtering, and semantic memory
 * into a high-efficiency context assembly pipeline.
 * Absorbed legacy ContextManager (v1.0) functionality.
 */
class ContextEngine {
	constructor(projectRoot, limits = {}) {
		this.projectRoot = projectRoot;
		this.sharedDir = path.join(projectRoot, "aizen-gate/shared");
		this.MAX_FILE_LINES = 150; // Threshold for context rot (from legacy ContextManager)
		this.budget = new TokenBudget(projectRoot, limits);
		this.filter = new OutputFilter();
		this.memory = new MemoryStore(projectRoot);
		this.router = new ModelRouter(projectRoot);
	}

	/**
	 * Estimated token count using budget system heuristic.
	 */
	estimateTokens(text) {
		return this.budget.estimate(text);
	}

	/**
	 * Wraps result with XML tags and applies OutputFilter if it's tool output.
	 */
	processToolOutput(commandType, rawOutput) {
		const filtered = this.filter.filter(rawOutput, commandType);
		return `<tool_output type="${commandType}">\n${filtered}\n</tool_output>`;
	}

	/**
	 * JIT Prompt Sharpening: Rewrites/Compresses instruction for sub-agent.
	 */
	async sharpenPrompt(text) {
		// [AZ-LITE] Local heuristic: remove excessive whitespace and redundant framing
		const cleaned = text
			.trim()
			.replace(/\n\s+\n/g, "\n\n")
			.replace(/Please implement the following:|I want you to implement:/gi, "Implement:");

		return cleaned;
	}

	/**
	 * Check for "Context Rot" in core state files (Legacy ContextManager method).
	 */
	async auditContext() {
		console.log(chalk.blue("[AZ] Auditing context health..."));
		const files = ["memory.md", "board.md", "project.md", "state.md"];
		const reports = [];

		for (const file of files) {
			const filePath = path.join(this.sharedDir, file);
			if (fs.existsSync(filePath)) {
				const content = await fs.readFile(filePath, "utf8");
				const lineCount = content.split("\n").length;
				const status = lineCount > this.MAX_FILE_LINES ? "ROT" : "HEALTHY";
				reports.push({ file, lineCount, status });

				if (status === "ROT") {
					console.log(
						chalk.yellow(
							`[AZ] Warning: ${file} is becoming bloated (${lineCount} lines). Compression recommended.`,
						),
					);
				}
			}
		}
		return reports;
	}

	/**
	 * Generate a "Fresh Context" for a subagent (Legacy ContextManager method).
	 * This combines only the necessary bits into a single prompt segment.
	 */
	async getSubagentContext(taskId = null) {
		let context = "### [AZ] Subagent Execution Context\n\n";

		// 1. Read Project Core
		const projectPath = path.join(this.sharedDir, "project.md");
		if (fs.existsSync(projectPath)) {
			const project = await fs.readFile(projectPath, "utf8");
			const coreValue = project.match(/## Core Value\n([\s\S]*?)\n##/);
			if (coreValue) context += `**Project Goal:** ${coreValue[1].trim()}\n`;
		}

		// 2. Read Active Task
		if (taskId) {
			const boardPath = path.join(this.sharedDir, "board.md");
			const board = await fs.readFile(boardPath, "utf8");
			const taskLine = board.split("\n").find((l) => l.includes(taskId));
			if (taskLine) context += `**Active Task:** ${taskLine.trim()}\n`;
		}

		// 3. Read Tech Stack
		const memoryPath = path.join(this.sharedDir, "memory.md");
		if (fs.existsSync(memoryPath)) {
			const memory = await fs.readFile(memoryPath, "utf8");
			const stack = memory.match(/## Tech Stack\n([\s\S]*?)\n##/);
			if (stack) context += `**Tech Stack:** ${stack[1].trim()}\n`;
		}

		context += "\n--- END CONTEXT ---\n";
		return context;
	}

	/**
	 * Archive current state to prevent rot (Legacy ContextManager method).
	 */
	async snapshotState(tag = "session") {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const snapshotDir = path.join(
			this.projectRoot,
			"aizen-gate/data/snapshots",
			`${tag}-${timestamp}`,
		);

		await fs.ensureDir(snapshotDir);
		await fs.copy(this.sharedDir, snapshotDir);

		console.log(chalk.green(`[AZ] State snapshot saved to: ${snapshotDir}`));
		return snapshotDir;
	}

	/**
	 * Structure instructions with positional optimization (criticial bits at start and end).
	 */
	async formatXMLPrompt(wp, context) {
		const sharpenedInstruction = await this.sharpenPrompt(wp.title);
		const header = `<task wp_id="${wp.id}">\n<instruction>IMPORTANT: ${sharpenedInstruction}</instruction>`;
		const semanticContext = await this.memory.getFormattedMemory(wp.title);

		return `
${header}

<context>
${semanticContext}

<artifacts>
${context}
</artifacts>
</context>

<requirements>
${wp.content}
</requirements>

<constraints>
- Use project coding standards (Biome/Bun).
- Ensure 100% test coverage.
- [AZ-SAFE] Avoid breaking changes.
</constraints>

<reminder>
Execute WP ${wp.id} now following the above context and constraints.
</reminder>
</task>
`;
	}

	/**
	 * Assembles a fresh context for a specific WP with priority-based trimming.
	 */
	async assembleWPContext(featureDir, _wp) {
		const components = [];

		const specPath = path.join(featureDir, "spec.md");
		if (fs.existsSync(specPath)) {
			const spec = await fs.readFile(specPath, "utf8");
			components.push({ name: "spec", content: spec, priority: 5 });
		}

		const planPath = path.join(featureDir, "plan.md");
		if (fs.existsSync(planPath)) {
			const plan = await fs.readFile(planPath, "utf8");
			components.push({ name: "plan", content: plan, priority: 8 });
		}

		const researchPath = path.join(featureDir, "research.md");
		if (fs.existsSync(researchPath)) {
			const research = await fs.readFile(researchPath, "utf8");
			components.push({ name: "research", content: research, priority: 3 });
		}

		let finalContext = "";
		for (const comp of components.sort((a, b) => b.priority - a.priority)) {
			const processed = await this.budget.enforce(comp.name, comp.content);
			finalContext += `\n<artifact name="${comp.name}">\n${processed}\n</artifact>`;
		}

		return finalContext;
	}
}

module.exports = { ContextEngine, ContextManager: ContextEngine };

