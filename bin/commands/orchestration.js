const chalk = require("chalk");

function registerOrchestration(program) {
	// Auto
	program
		.command("auto")
		.description("Launch the autonomous execution loop")
		.action(async () => {
			const { runAutoLoop, registerSignalHandlers } = require("../../src/orchestration/auto-loop");
			// Register signal handlers for graceful shutdown
			registerSignalHandlers();
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching autonomous orchestrator ---\n"));
			await runAutoLoop(process.cwd());
		});

	// Implement, Review, Verify, Merge (Redirected to Playbooks)
	program
		.command("implement")
		.description("Implement a specific Work Package from the plan")
		.argument("[wpId]", "ID of the Work Package to implement")
		.action(async (wpId) => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("implement", process.cwd(), wpId);
		});

	program
		.command("review")
		.description("Perform QA review on a completed Work Package")
		.argument("[wpId]", "ID of the Work Package to review")
		.action(async (wpId) => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("review", process.cwd(), wpId);
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
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("merge", process.cwd());
		});

	// Specify (Interactive Wizard)
	program
		.command("specify")
		.description("Conduct discovery interview to formalize a feature request")
		.action(async () => {
			const { runDiscoveryWizard } = require("../../src/orchestration/discovery-wizard");
			await runDiscoveryWizard(process.cwd());
		});

	// Plan
	program
		.command("plan")
		.description("Generate architecture plan and TDD strategy")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("plan", process.cwd());
		});

	// Research
	program
		.command("research")
		.description("Conduct parallel research phase for architectural validation")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("research", process.cwd());
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
