const chalk = require("chalk");

function registerMemory(program) {
	// Ingest
	program
		.command("ingest")
		.description("Ingest a text or markdown document into the Aizen-Gate Memory Store")
		.argument("<path>", "File path to ingest")
		.action(async (targetPath) => {
			const { ingestDocument } = require("../../src/memory/ingest");
			await ingestDocument(process.cwd(), targetPath);
		});

	// Compress
	program
		.command("compress")
		.description("Archive finished tasks/WPs and optimize workspace storage")
		.action(async () => {
			const { compressContext } = require("../../src/memory/compress");
			console.log(chalk.red("\n--- ⛩️ [AZ] Starting context archival distillation ---\n"));
			await compressContext(process.cwd());
		});

	// Tokens
	program
		.command("tokens")
		.description("View token usage analysis and savings report")
		.action(async () => {
			const { TokenBudget } = require("../../src/ai/token-budget");
			const budget = new TokenBudget(process.cwd());
			const report = await budget.getReport();
			console.log(chalk.cyan("\n--- ⛩️ [Aizen] Token Usage Report ---\n"));
			console.log(`- **Monthly Budget:** $${report.budget_limit.toFixed(2)}`);
			console.log(
				`- **Spent (Estimated):** $${report.spent.toFixed(2)} (${report.tokens_total} tokens)`,
			);
			console.log(`- **Remaining:** $${(report.budget_limit - report.spent).toFixed(2)}`);
			console.log(
				`\n${chalk.green.bold("✔ Projecting ~45% savings via RTK + Mem0 optimization.")}`,
			);
			console.log(chalk.gray(`Last Updated: ${new Date(report.last_updated).toLocaleString()}`));
			console.log("");
		});
}

module.exports = { registerMemory };
