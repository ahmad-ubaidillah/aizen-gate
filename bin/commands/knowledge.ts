/**
 * Knowledge CLI Commands
 */
import chalk from "chalk";
import type { Command } from "commander";

/**
 * Register knowledge commands
 */
export function registerKnowledge(program: Command): void {
	// KG
	const kgCmd = program
		.command("kg")
		.description("Manage project Knowledge Graph (build, query, trace)");

	kgCmd
		.command("build")
		.description("Build or update the project knowledge graph")
		.action(async () => {
			const { KGScanner } = await import("../../src/knowledge/kg-scanner.js");
			const scanner = new KGScanner(process.cwd());
			await scanner.build();
		});

	kgCmd
		.command("query")
		.argument("<query>", "Query to search in the knowledge graph")
		.action(async (query: string) => {
			const { KnowledgeGraph } = await import("../../src/knowledge/kg-engine.js");
			const kg = new KnowledgeGraph(process.cwd());
			const results = await kg.query(query);
			console.log(chalk.cyan("\n--- ⛩️ [Aizen] KG Query Results ---\n"));
			results.forEach((r, i) => {
				console.log(
					chalk.yellow(`${i + 1}. [${r.type}] ${r.id} (Score: ${r.score?.toFixed(4) ?? "N/A"})`),
				);
				console.log(chalk.gray(`   ${r.content.slice(0, 100)}...`));
			});
			console.log("");
		});

	kgCmd
		.command("trace")
		.argument("<id>", "Node ID to trace dependencies for")
		.action(async (id: string) => {
			const { KnowledgeGraph } = await import("../../src/knowledge/kg-engine.js");
			const kg = new KnowledgeGraph(process.cwd());
			const trace = await kg.getTrace(id);
			console.log(chalk.cyan(`\n--- ⛩️ [Aizen] KG Trace for: ${id} ---\n`));
			trace.forEach((t, i) => {
				console.log(
					`${i + 1}. [${chalk.cyan(t.type)}] ${t.id} -- Score: ${t.score?.toFixed(4) ?? "N/A"}`,
				);
				console.log(chalk.white(`   ${t.content.slice(0, 120)}...`));
			});
			console.log("");
		});

	// Map
	program
		.command("map")
		.description("Generate an architectural map of the project")
		.action(async () => {
			const { mapCodebase } = await import("../../src/utils/mapper.js");
			await mapCodebase(process.cwd());
		});
}
