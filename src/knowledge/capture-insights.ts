/**
 * [AZ] Insight Capture
 *
 * Analyzes the Graph and current state to populate Living Docs.
 */
import chalk from "chalk";
import { KnowledgeGraph } from "./kg-engine.js";
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
		// Query general project nodes
		const allNodes = await kg.query("");

		// 1. Report on Immune System Health
		const brokenNodes = allNodes.filter((n) => n.status === "BROKEN");
		const stableNodes = allNodes.filter((n) => n.status === "STABLE");

		if (brokenNodes.length > 0) {
			await docs.append(
				"pitfalls",
				"IMMUNE_SYSTEM",
				`**Logic Decay Detected**: ${brokenNodes.length} memory paths (e.g., \`${brokenNodes[0].uri}\`) have a high failure rate. These will be deprioritized in future recalls to prevent failure recurrence.`,
			);
		}

		// 2. Report on Stable Knowledge Base
		if (stableNodes.length > 0) {
			await docs.append(
				"patterns",
				"STABILITY",
				`**Grounded Patterns**: ${stableNodes.length} logic nodes have reached STABLE status through successful execution cycles.`,
			);
		}

		// 3. System Volume
		await docs.append(
			"decisions",
			"SYSTEM",
			`**12-Core Fusion**: Memory system currently tracking ${allNodes.length} active logic URIs with embedded TOON distillation.`,
		);

		console.log(chalk.green.bold("\n✔ Living Docs updated based on Neural Analysis.\n"));
	} catch (err: any) {
		console.error(chalk.red(`[Insights] Failed: ${err.message}`));
	}
}
