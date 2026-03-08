/**
 * Orchestration CLI Commands
 */

import chalk from "chalk";
import type { Command } from "commander";

/**
 * Register orchestration commands
 */
export function registerOrchestration(program: Command): void {
	// Auto
	program
		.command("auto")
		.description("Launch the autonomous execution loop")
		.action(async () => {
			const { runAutoLoop, registerSignalHandlers } = await import(
				"../../src/orchestration/auto-loop.js"
			);
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
		.action(async (wpId?: string) => {
			const { runPlaybook } = await import("../../src/utils/playbook-runner.js");
			runPlaybook("implement", process.cwd(), wpId as null | undefined);
		});

	program
		.command("review")
		.description("Perform QA review on a completed Work Package")
		.argument("[wpId]", "ID of the Work Package to review")
		.action(async (wpId?: string) => {
			const { runPlaybook } = await import("../../src/utils/playbook-runner.js");
			runPlaybook("review", process.cwd(), wpId as null | undefined);
		});

	program
		.command("verify")
		.description("Run UAT and verify implementation correctness")
		.action(async () => {
			const { runVerifier } = await import("../../src/quality/verifier.js");
			await runVerifier(process.cwd());
		});

	program
		.command("merge")
		.description("Merge a completed feature branch into the main trunk")
		.action(async () => {
			const { runPlaybook } = await import("../../src/utils/playbook-runner.js");
			runPlaybook("merge", process.cwd());
		});

	// Specify (Interactive Wizard)
	program
		.command("specify")
		.description("Conduct discovery interview to formalize a feature request")
		.action(async () => {
			const { runDiscoveryWizard } = await import("../../src/orchestration/discovery-wizard.js");
			await runDiscoveryWizard(process.cwd());
		});

	// Plan
	program
		.command("plan")
		.description("Generate architecture plan and TDD strategy")
		.action(async () => {
			const { runPlaybook } = await import("../../src/utils/playbook-runner.js");
			runPlaybook("plan", process.cwd());
		});

	// Research
	program
		.command("research")
		.description("Conduct parallel research phase for architectural validation")
		.action(async () => {
			const { runPlaybook } = await import("../../src/utils/playbook-runner.js");
			runPlaybook("research", process.cwd());
		});

	// Export
	program
		.command("export")
		.description("Export the current Kanban board to a versioned snapshot")
		.action(async () => {
			const { exportBoard } = await import("../../src/tasks/board-export.js");
			await exportBoard(process.cwd());
		});
}
