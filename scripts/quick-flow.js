const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");

/**
 * QuickFlow: Handles atomic, direct implementation bypassing the full pipeline.
 */
async function runQuickFlow(projectRoot, description) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Entering Quick Mode (High-Speed Execution) ---\n"));
	console.log(`[Aizen] Goal: ${chalk.cyan(description)}`);

	const sharedDir = path.join(projectRoot, "aizen-gate", "shared", "quick");
	const historyPath = path.join(sharedDir, "history.md");
	await fs.ensureDir(sharedDir);

	if (!fs.existsSync(historyPath)) {
		await fs.writeFile(
			historyPath,
			`# ⚡ Quick Flow History\n\nLog of all rapid implementations.\n\n`,
		);
	}

	try {
		// 1. Structural Prompt for the Agent (In case the agent is calling this command)
		console.log(chalk.white(`\n<quick_flow_task>`));
		console.log(
			chalk.white(
				`  <instruction>Implement the following task directly: ${description}</instruction>`,
			),
		);
		console.log(
			chalk.white(
				`  <workflow>1. Analysis -> 2. Implementation -> 3. Local Verification -> 4. Commit</workflow>`,
			),
		);
		console.log(
			chalk.white(
				`  <constraints>Stay within the minimal scope of the task description.</constraints>`,
			),
		);
		console.log(chalk.white(`</quick_flow_task>\n`));

		// Note: Real automation would invoke the implementation engine here.
		// For the CLI, we provide the prompt and wait for the agent to do its work.
		// However, we'll provide a 'commit' utility.

		console.log(
			chalk.yellow(
				`[Aizen] Once finished, use "git commit -m '${description}'" or run "npx aizen-gate quick --commit".\n`,
			),
		);

		// Append to history
		const entry = `- **[${new Date().toISOString()}]**: ${description}\n`;
		await fs.appendFile(historyPath, entry);
	} catch (error) {
		console.error(chalk.red(`[Aizen] Quick flow failed: ${error.message}`));
	}
}

module.exports = { runQuickFlow };
