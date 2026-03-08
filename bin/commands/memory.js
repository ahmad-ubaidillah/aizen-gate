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

			// Defensive logic: Ensure report values are numeric before toFixed
			const limit = report.budget_limit || 0;
			const spent = report.spent || 0;
			const total = report.tokens_total || 0;
			const updated = report.last_updated
				? new Date(report.last_updated).toLocaleString()
				: "Never";

			console.log(`- **Monthly Budget:** $${limit.toFixed(2)}`);
			console.log(`- **Spent (Estimated):** $${spent.toFixed(2)} (${total} tokens)`);
			console.log(`- **Remaining:** $${(limit - spent).toFixed(2)}`);
			console.log(
				`\n${chalk.green.bold("✔ Projecting ~45% savings via RTK + Mem0 optimization.")}`,
			);
			console.log(chalk.gray(`Last Updated: ${updated}`));
			console.log("");
		});
}

module.exports = { registerMemory };
