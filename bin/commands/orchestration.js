const chalk = require("chalk");

function registerOrchestration(program) {
	// Auto
	program
		.command("auto")
		.description("Launch the autonomous execution loop")
		.action(async () => {
			const { runAutoLoop } = require("../../src/orchestration/auto-loop");
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching autonomous orchestrator ---\n"));
			await runAutoLoop(process.cwd());
		});

	// Implement, Review, Verify, Merge (Redirected to Playbooks)
	program
		.command("implement")
		.description("Implement a specific Work Package from the plan")
		.argument("[wpId]", "ID of the Work Package to implement")
		.action(async (wpId) => {
			console.log(
				chalk.red(
					`\n--- ⛩️ [Aizen] Launching az-implement Playbook for ${wpId || "next available"} ---\n`,
				),
			);
			console.log(
				chalk.gray(`Invoke agent: "Read aizen-gate/commands/az-implement.md and implement."`),
			);
		});

	program
		.command("review")
		.description("Perform QA review on a completed Work Package")
		.argument("[wpId]", "ID of the Work Package to review")
		.action(async (wpId) => {
			console.log(
				chalk.red(
					`\n--- ⛩️ [Aizen] Launching az-review Playbook for ${wpId || "next available"} ---\n`,
				),
			);
			console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/az-review.md and review."`));
		});

	program
		.command("verify")
		.description("Run UAT and verify implementation correctness")
		.action(async () => {
			const { runVerifier } = require("../../src/quality/verifier");
			await runVerifier(process.cwd());
		});

	program
		.command("merge")
		.description("Merge a completed feature branch into the main trunk")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching az-merge Playbook ---\n"));
			console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/az-merge.md and merge."`));
		});

	// Research
	program
		.command("research")
		.description("Conduct parallel research phase for architectural validation")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching az-research Playbook ---\n"));
			console.log(
				chalk.gray(`Invoke agent: "Read aizen-gate/commands/az-research.md and start research."`),
			);
		});

	// Export
	program
		.command("export")
		.description("Export the current Kanban board to a versioned snapshot")
		.action(async () => {
			const { exportBoard } = require("../../src/tasks/board-export");
			await exportBoard(process.cwd());
		});
}

module.exports = { registerOrchestration };
