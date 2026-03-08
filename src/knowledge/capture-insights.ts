/**
 * [AZ] Insight Capture
 *
 * Analyzes the Graph and current state to populate Living Docs.
 */
import chalk from "chalk";
import { type KGNode, KnowledgeGraph } from "./kg-engine.js";
import { LivingDocs } from "./living-docs.js";

interface FileComplexity {
	id: string;
	count: number;
}

/**
 * Captures insights from the knowledge graph and populates living docs.
 */
export async function captureInsights(projectRoot: string): Promise<void> {
	console.log(chalk.red.bold("\n--- 📜 [AZ] Capturing Living Insights ---\n"));

	const kg = new KnowledgeGraph(projectRoot);
	const docs = new LivingDocs(projectRoot);

	try {
		// 1. Identify "Hot" Files (most defined functions)
		const memory = await kg.memory;
		const allNodesResult = await memory.search("", { limit: 1000 });
		const allNodes: KGNode[] = allNodesResult as KGNode[];

		const fileNodes = allNodes.filter((n) => n.meta?.type === "FILE");
		const definesEdges = allNodes.filter((n) => n.meta?.relation === "DEFINES");

		const fileComplexity: FileComplexity[] = fileNodes
			.map((f) => ({
				id: f.id,
				count: definesEdges.filter((e) => e.meta?.source === f.id).length,
			}))
			.sort((a, b) => b.count - a.count);

		if (fileComplexity.length > 0) {
			const topFile = fileComplexity[0];
			await docs.append(
				"patterns",
				"ANALYSIS",
				`**Complexity Peak**: \`${topFile.id}\` contains ${topFile.count} defined components. Consider modularizing if this grows.`,
			);
		}

		// 2. Identify Orphan Tasks
		const tasks = allNodes.filter((n) => n.meta?.type === "TASK");
		const implementsEdges = allNodes.filter((n) => n.meta?.relation === "IMPLEMENTS");
		const orphans = tasks.filter((t) => !implementsEdges.some((e) => e.meta?.source === t.id));

		if (orphans.length > 0) {
			await docs.append(
				"pitfalls",
				"QA",
				`**Loose Ends**: ${orphans.length} tasks (e.g., \`${orphans[0].id}\`) are currently unlinked to any specification feature. Align them to avoid technical debt.`,
			);
		}

		// 3. System Architecture Snapshot
		await docs.append(
			"decisions",
			"SYSTEM",
			`**Graph Baseline**: Knowledge Graph currently tracking ${allNodes.length} nodes across 5 dimensions (Semantic, Procedural, Episodic, Emotional, Reflective).`,
		);

		console.log(chalk.green.bold("\n✔ Living Docs updated based on Graph Analysis.\n"));
	} catch (err: any) {
		console.error(chalk.red(`[Insights] Failed: ${err.message}`));
	}
}
