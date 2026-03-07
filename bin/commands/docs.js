const chalk = require("chalk");

function registerDocs(program) {
	const docsCmd = program
		.command("docs")
		.description("Manage and view project documentation and specifications.");

	docsCmd
		.command("generate")
		.description("Generate specifications and architecture documentation")
		.action(async () => {
			const { generateDocs } = require("../../src/utils/docs");
			await generateDocs(process.cwd());
		});

	docsCmd
		.command("view")
		.description("View Living Documentation (decisions, patterns, pitfalls)")
		.action(async () => {
			const projectRoot = process.cwd();
			const { LivingDocs } = require("../../src/knowledge/living-docs");
			const docs = new LivingDocs(projectRoot);
			const menu = await docs.getMenu();
			console.log(chalk.cyan("\n--- ⛩️ [Aizen] Living Documentation Catalog ---\n"));
			menu.forEach((item, i) => {
				console.log(chalk.yellow(`${i + 1}. [${item.type}] ${item.title}`));
				console.log(chalk.gray(`   ${item.path}`));
			});
			console.log("");
		});

	program
		.command("capture")
		.description("Capture technical insights and patterns from the current session")
		.action(async () => {
			const { captureInsights } = require("../../src/knowledge/capture-insights");
			console.log(chalk.red("\n--- ⛩️ [Aizen] Capturing technical insights ---\n"));
			await captureInsights(process.cwd());
		});
}

module.exports = { registerDocs };
