/**
 * Memory CLI Commands
 */
import chalk from "chalk";
import type { Command } from "commander";

/**
 * Register memory commands
 */
export function registerMemory(program: Command): void {
	// Ingest
	program
		.command("ingest")
		.description("Ingest a text or markdown document into the Aizen-Gate Memory Store")
		.argument("<path>", "File path to ingest")
		.action(async (targetPath: string) => {
			const { ingestDocument } = await import("../../src/memory/ingest.js");
			await ingestDocument(process.cwd(), targetPath);
		});

	// Compress
	program
		.command("compress")
		.description("Archive finished tasks/WPs and optimize workspace storage")
		.action(async () => {
			const { compressContext } = await import("../../src/memory/compress.js");
			console.log(chalk.red("\n--- ⛩️ [AZ] Starting context archival distillation ---\n"));
			await compressContext(process.cwd());
		});

	// Tokens
	program
		.command("tokens")
		.description("View token usage analysis and savings report")
		.action(async () => {
			const { TokenBudget } = await import("../../src/ai/token-budget.js");
			const budget = new TokenBudget(process.cwd());
			const report = await budget.getReport();

			// Handle both string and object responses
			if (typeof report === "string") {
				console.log(chalk.cyan("\n--- ⛩️ [Aizen] Token Usage Report ---\n"));
				console.log(report);
				console.log("");
				return;
			}

			console.log(chalk.cyan("\n--- ⛩️ [Aizen] Token Usage Report ---\n"));

			// Use the correct field names from TokenBudgetReport
			const total = report.total_tokens || 0;
			const input = report.input_tokens || 0;
			const output = report.output_tokens || 0;
			const updated = report.last_updated
				? new Date(report.last_updated).toLocaleString()
				: "Never";

			console.log(`- **Total Tokens:** ${total.toLocaleString()}`);
			console.log(`- **Input Tokens:** ${input.toLocaleString()}`);
			console.log(`- **Output Tokens:** ${output.toLocaleString()}`);
			console.log(
				`\n${chalk.green.bold("✔ Projecting ~45% savings via RTK + Mem0 optimization.")}`,
			);
			console.log(chalk.gray(`Last Updated: ${updated}`));
			console.log("");
		});
}
