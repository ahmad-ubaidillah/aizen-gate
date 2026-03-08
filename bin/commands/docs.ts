/**
 * Docs CLI Commands
 */
import chalk from "chalk";
import type { Command } from "commander";

/**
 * Register docs commands
 */
export function registerDocs(program: Command): void {
	const docsCmd = program
		.command("docs")
		.description("Manage and view project documentation and specifications.");

	docsCmd
		.command("generate")
		.description("Generate specifications and architecture documentation")
		.action(async () => {
			const { generateDocs } = await import("../../src/utils/docs.js");
			await generateDocs(process.cwd());
		});

	docsCmd
		.command("view")
		.description("View Living Documentation (decisions, patterns, pitfalls)")
		.action(async () => {
			const projectRoot = process.cwd();
			const { LivingDocs } = await import("../../src/knowledge/living-docs.js");
			const docs = new LivingDocs(projectRoot);
			const menu = await docs.getMenu();
			console.log(chalk.cyan("\n--- ⛩️ [Aizen] Living Documentation Catalog ---\n"));
			menu.forEach((item: { type: string; title: string; path: string }, i: number) => {
				console.log(chalk.yellow(`${i + 1}. [${item.type}] ${item.title}`));
				console.log(chalk.gray(`   ${item.path}`));
			});
			console.log("");
		});

	program
		.command("capture")
		.description("Capture technical insights and patterns from the current session")
		.action(async () => {
			const { captureInsights } = await import("../../src/knowledge/capture-insights.js");
			console.log(chalk.red("\n--- ⛩️ [Aizen] Capturing technical insights ---\n"));
			await captureInsights(process.cwd());
		});
}
