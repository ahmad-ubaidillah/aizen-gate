const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Aizen-Gate Context Manager
 * Handles context engineering, file size limits, and fresh subagent context generation.
 */
class ContextManager {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.sharedDir = path.join(projectRoot, "aizen-gate/shared");
		this.MAX_FILE_LINES = 150; // Threshold for context rot
	}

	/**
	 * Check for "Context Rot" in core state files.
	 */
	async auditContext() {
		console.log(chalk.blue("[SA] Auditing context health..."));
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
							`[SA] Warning: ${file} is becoming bloated (${lineCount} lines). Compression recommended.`,
						),
					);
				}
			}
		}
		return reports;
	}

	/**
	 * Generate a "Fresh Context" for a subagent.
	 * This combines only the necessary bits into a single prompt segment.
	 */
	async getSubagentContext(taskId = null) {
		let context = "### [SA] Subagent Execution Context\n\n";

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
	 * Archive current state to prevent rot (Implementation of "Snapshotting").
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

		console.log(chalk.green(`[SA] State snapshot saved to: ${snapshotDir}`));
		return snapshotDir;
	}
}

module.exports = { ContextManager };
