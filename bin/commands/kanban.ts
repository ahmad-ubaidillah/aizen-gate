/**
 * Kanban CLI Commands
 */
import type { Command } from "commander";
import chalk from "chalk";

/**
 * Register kanban commands
 */
export function registerKanban(program: Command): void {
	const kanbanCmd = program
		.command("kanban")
		.description("Manage the local Kanban-Agent environment.");

	kanbanCmd
		.command("init")
		.description("Initialize the physical directory structure and project constitution")
		.action(async () => {
			const { KanbanScaffolder } = await import("../../src/setup/kanban-scaffold.js");
			const scaffolder = new KanbanScaffolder(process.cwd());
			await scaffolder.scaffold();
		});

	kanbanCmd
		.command("sync")
		.description("Manually trigger CURRENT_SPRINT.md manifest update")
		.action(async () => {
			const { ManifestGenerator } = await import("../../src/tasks/manifest-generator.js");
			const generator = new ManifestGenerator(process.cwd());
			await generator.updateManifest();
			console.log(chalk.green("✔ Manifest synchronized."));
		});
}
