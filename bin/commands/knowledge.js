const chalk = require("chalk");

function registerKnowledge(program) {
	// KG
	const kgCmd = program
		.command("kg")
		.description("Manage project Knowledge Graph (build, query, trace)");

	kgCmd
		.command("build")
		.description("Build or update the project knowledge graph")
		.action(async () => {
			const { KGScanner } = require("../../src/knowledge/kg-scanner");
			const scanner = new KGScanner(process.cwd());
			await scanner.build();
		});

	kgCmd
		.command("query")
		.argument("<query>", "Query to search in the knowledge graph")
		.action(async (query) => {
			const { KnowledgeGraph } = require("../../src/knowledge/kg-engine");
			const kg = new KnowledgeGraph(process.cwd());
			const results = await kg.query(query);
			console.log(chalk.cyan("\n--- ⛩️ [Aizen] KG Query Results ---\n"));
			results.forEach((r, i) => {
				console.log(chalk.yellow(`${i + 1}. [${r.type}] ${r.id} (Score: ${r.score.toFixed(4)})`));
				console.log(chalk.gray(`   ${r.content.slice(0, 100)}...`));
			});
			console.log("");
		});

	kgCmd
		.command("trace")
		.argument("<id>", "Node ID to trace dependencies for")
		.action(async (id) => {
			const { KnowledgeGraph } = require("../../src/knowledge/kg-engine");
			const kg = new KnowledgeGraph(process.cwd());
			const trace = await kg.trace(id);
			console.log(chalk.cyan(`\n--- ⛩️ [Aizen] KG Trace for: ${id} ---\n`));
			trace.forEach((t, i) => {
				console.log(`${i + 1}. [${chalk.cyan(t.type)}] ${t.id} -- Score: ${t.score.toFixed(4)}`);
				console.log(chalk.white(`   ${t.content.slice(0, 120)}...`));
			});
			console.log("");
		});
}

module.exports = { registerKnowledge };
