const chalk = require("chalk");

function registerOrchestration(program) {
	// 1. Specify
	program
		.command("specify")
		.description("Conduct discovery interview to formalize a feature request")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("specify", process.cwd());
		});

	// 2. Discuss
	program
		.command("discuss")
		.description("Resolve gray areas and ambiguous requirements before planning")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("discuss", process.cwd());
		});

	// 3. Research
	program
		.command("research")
		.description("Conduct parallel research phase for architectural validation")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("research", process.cwd());
		});

	// 4. Plan
	program
		.command("plan")
		.description("Generate architecture plan and TDD strategy")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("plan", process.cwd());
		});

	// 5. Auto
	program
		.command("auto")
		.description("Launch the autonomous execution loop")
		.action(async () => {
			const { runAutoLoop } = require("../../src/orchestration/auto-loop");
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching autonomous orchestrator ---\n"));
			await runAutoLoop(process.cwd());
		});

	// 6. Wizard
	program
		.command("wizard")
		.description("Run the complete 4-step pipeline automatically (Specify -> Plan -> Tasks -> Auto)")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			const { runAutoLoop } = require("../../src/orchestration/auto-loop");

			console.log(chalk.cyan.bold("\n--- ⛩️ [Aizen] Starting Full Pipeline Wizard ---\n"));

			console.log(chalk.yellow("Step 1/4: Specify (Discovery)"));
			runPlaybook("specify", process.cwd());

			console.log(chalk.yellow("\nStep 2/4: Plan (Architecture Blueprint)"));
			runPlaybook("plan", process.cwd());

			console.log(chalk.yellow("\nStep 3/4: Tasks (Work Package Breakdown)"));
			runPlaybook("tasks", process.cwd());

			console.log(chalk.red("\nStep 4/4: Auto (Autonomous Execution)"));
			console.log(chalk.dim("The autonomous loop will now continually process the generated tasks.\n"));
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


	// Export
	program
		.command("export")
		.description("Export the current Kanban board to a versioned snapshot")
		.action(async () => {
			const { exportBoard } = require("../../src/tasks/board-export");
			await exportBoard(process.cwd());
		});

	// Map
	program
		.command("map")
		.description("Generate an architectural map of the project")
		.action(async () => {
			const { mapCodebase } = require("../../src/utils/mapper");
			await mapCodebase(process.cwd());
		});
}

module.exports = { registerOrchestration };
