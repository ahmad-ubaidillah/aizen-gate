import { execSync } from "node:child_process";
import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import { KnowledgeGraph } from "../knowledge/kg-engine.js";

/**
 * Aizen-Gate Shield Diagnostics
 * Performs environment checks and protocol adherence verification.
 */
export async function runDoctor(
	projectRoot: string,
	options: any = {},
): Promise<{ healthy: boolean }> {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Shield Health Check ---\n"));

	const fixRequested = options.fix || false;
	let healthy = true;

	const aizenDir = path.join(projectRoot, "aizen-gate");
	const sharedDir = path.join(aizenDir, "shared");
	const skillsDir = path.join(aizenDir, "skills");

	const checks = [
		{
			name: "Environment: Node.js",
			check: () => process.version,
		},
		{
			name: "Environment: Git",
			check: () => execSync("git --version").toString().trim(),
		},
		{
			name: "Workspace: Aizen Directory",
			check: () => fs.existsSync(aizenDir),
		},
		{
			name: "Workspace: Shared Memory",
			check: () =>
				fs.existsSync(path.join(sharedDir, "memory.db")) ||
				fs.existsSync(path.join(sharedDir, "memory.sqlite")),
		},
		{
			name: "Workspace: Shield Board",
			check: () => fs.existsSync(path.join(sharedDir, "board.md")),
		},
		{
			name: "Workspace: State Tracker",
			check: () => fs.existsSync(path.join(sharedDir, "state.md")),
		},
		{
			name: "Workspace: Aizen-Gate PRD",
			check: () => fs.existsSync(path.join(sharedDir, "project.md")),
		},
		{
			name: "Graph Integrity: Orphan Controls",
			check: async () => {
				const kg = new KnowledgeGraph(projectRoot);
				try {
					// Use lazy memory initialization and provide a meaningful search query
					const memory = await kg._getMemory();
					const allNodes = await (memory as any).search("*", { limit: 1000 });

					if (!allNodes || (allNodes as any).length === 0) {
						return "No nodes in knowledge graph (empty)";
					}

					const features = (allNodes as any[]).filter((n) => n.meta?.type === "FEAT");
					const tasks = (allNodes as any[]).filter((n) => n.meta?.type === "TASK");
					const implementsEdges = (allNodes as any[]).filter(
						(n) => n.meta?.relation === "IMPLEMENTS",
					);

					const orphans = features.filter(
						(f) => !implementsEdges.some((e) => e.meta?.target === f.id),
					);
					const unlinkedTasks = tasks.filter(
						(t) => !implementsEdges.some((e) => e.meta?.source === t.id),
					);

					const report: string[] = [];
					if (orphans.length > 0) report.push(chalk.yellow(`${orphans.length} Orphan Features`));
					if (unlinkedTasks.length > 0)
						report.push(chalk.yellow(`${unlinkedTasks.length} Unlinked Tasks`));

					return report.length > 0 ? report.join(", ") : "Healthy";
				} catch (err) {
					return `Check skipped: ${(err as Error).message}`;
				}
			},
		},
		{
			name: "Capacity: Skill Hub Count",
			check: () => {
				if (!fs.existsSync(skillsDir)) return "0 categories active (Empty)";
				const subdirs = fs
					.readdirSync(skillsDir)
					.filter((f) => fs.statSync(path.join(skillsDir, f)).isDirectory());
				return `${subdirs.length} categories active`;
			},
		},
		{
			name: "Compliance: CLAUDE.md / AGENTS.md / GEMINI.md",
			check: () => {
				const claude = fs.existsSync(path.join(projectRoot, "CLAUDE.md"));
				const agents = fs.existsSync(path.join(projectRoot, "AGENTS.md"));
				const gemini = fs.existsSync(path.join(projectRoot, "GEMINI.md"));
				return claude || agents || gemini ? "Present" : chalk.yellow("Not found (Optional)");
			},
		},
	];

	for (const { name, check } of checks) {
		try {
			const result: any = await Promise.resolve(check());
			if (result === false) {
				console.log(`${chalk.red("✘")} ${name}: ${chalk.red("Bypassed/Missing")}`);
				healthy = false;
			} else {
				console.log(
					`${chalk.green("✔")} ${name}: ${chalk.cyan(result === true ? "Present" : result)}`,
				);
			}
		} catch (err) {
			console.log(`${chalk.red("✘")} ${name}: ${chalk.red(`Error: ${(err as Error).message}`)}`);
			healthy = false;
		}
	}

	if (healthy) {
		console.log(chalk.green.bold("\n[Aizen] Shield operational! Protocol adherence 100%. ⛩️\n"));
	} else {
		if (fixRequested) {
			console.log(chalk.yellow("\n[Aizen] Attempting Auto-Repair..."));
			// installer might not be in src/, let's assume it's moved or check its location
			const { installAizenGate } = (await import("../../installer/src/install.js")) as any;
			const result = await installAizenGate(projectRoot, "antigravity");
			if (result.success) {
				console.log(
					chalk.green(
						'✔ Workspace successfully repaired. Run "npx aizen-gate doctor" again to verify.',
					),
				);
			} else {
				console.log(chalk.red(`✘ Repair failed: ${result.error}`));
			}
		} else {
			console.log(
				chalk.red.bold(
					'\n[Aizen] Component failure detected. Run "npx aizen-gate doctor --fix" to repair.\n',
				),
			);
		}
	}

	return { healthy };
}
