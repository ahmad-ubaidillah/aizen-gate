import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Local helper to load WPs from a feature directory
 */
async function loadAllWPs(featurePath: string): Promise<any[]> {
	const tasksDir = path.join(featurePath, "tasks");
	if (!fs.existsSync(tasksDir)) return [];
	const files = await fs.readdir(tasksDir);
	return files
		.filter((f) => f.endsWith(".md"))
		.map((f) => {
			const content = fs.readFileSync(path.join(tasksDir, f), "utf8");
			return {
				title: f,
				content: content,
			};
		});
}

/**
 * Analyzer: Detects drift between Spec, Plan, and Tasks.
 */
export async function runAnalyzer(projectRoot: string, featureName?: string): Promise<void> {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Cross-Artifact Consistency Analysis ---\n"));

	const specsDir = path.join(projectRoot, "aizen-gate", "specs");
	const backlogDir = path.join(projectRoot, "backlog", "tasks");
	let activeFeature = featureName;

	if (!activeFeature && fs.existsSync(specsDir)) {
		const dirs = await fs.readdir(specsDir);
		activeFeature = dirs.find((d) => fs.statSync(path.join(specsDir, d)).isDirectory());
	}

	let wps: any[] = [];
	let featurePath: string | null = null;
	let specPath: string | null = null;
	let planPath: string | null = null;

	if (activeFeature) {
		featurePath = path.join(specsDir, activeFeature);
		specPath = path.join(featurePath, "spec.md");
		planPath = path.join(featurePath, "plan.md");
		wps = await loadAllWPs(featurePath);
		console.log(`[Aizen] Analyzing: ${chalk.cyan(activeFeature)}`);
	} else if (fs.existsSync(backlogDir)) {
		console.log(
			chalk.gray("[Aizen] No specific feature found. Falling back to global backlog/tasks."),
		);
		const files = await fs.readdir(backlogDir);
		wps = files
			.filter((f) => f.endsWith(".md"))
			.map((f) => {
				const content = fs.readFileSync(path.join(backlogDir, f), "utf8");
				return {
					title: f.replace(/\.md$/, ""), // Remove .md extension for title
					content: content,
					// Add other properties if WorkPackage expects them, or adjust WorkPackage.loadAllWPs to handle this format
				};
			});
		console.log(`[Aizen] Analyzing: ${chalk.cyan("Global Backlog")}`);
	} else {
		console.log(chalk.yellow("[Aizen] No features or backlog found for analysis."));
		return;
	}

	const gaps: any[] = [];
	// 1. SPEC vs PLAN
	if (specPath && fs.existsSync(specPath) && planPath && fs.existsSync(planPath)) {
		const spec = await fs.readFile(specPath, "utf8");
		const plan = await fs.readFile(planPath, "utf8");

		// Extract AC from Spec
		const specAc = spec.match(/- \[ \].*|- \[x\].*/g) || [];
		// Check if Plan addresses them
		specAc.forEach((ac) => {
			const cleanAc = ac.replace(/\[.\]/, "").trim();
			if (!plan.includes(cleanAc)) {
				gaps.push({
					type: "DRIFT",
					msg: `Spec AC "${cleanAc}" is not explicitly addressed in plan.md`,
				});
			}
		});
	}

	// 2. PLAN vs TASKS (WPs)
	if (planPath && fs.existsSync(planPath)) {
		const plan = await fs.readFile(planPath, "utf8");

		// Extract planned tasks
		const plannedTasks = plan.match(/- \[ \].*/g) || [];
		plannedTasks.forEach((task) => {
			const cleanTask = task.replace(/\[.\]/, "").trim();
			if (!wps.some((wp) => wp.title.includes(cleanTask) || wp.content.includes(cleanTask))) {
				gaps.push({
					type: "ORPHAN",
					msg: `Planned task "${cleanTask}" has no corresponding Work Package (WP)`,
				});
			}
		});
	}

	// 3. SCOPE CREEP (WPs without trace in Spec/Plan)
	wps.forEach((_wp) => {
		// Logic for scope creep detection (placeholder)
	});

	// Output Report
	if (gaps.length === 0) {
		console.log(chalk.green("\n✔ Analysis Complete: No drift or gaps detected between artifacts."));
	} else {
		console.log(chalk.red(`\n✘ Found ${gaps.length} consistency issues:`));
		gaps.forEach((g) => {
			const color = g.type === "ORPHAN" ? chalk.yellow : chalk.red;
			console.log(` - ${color(`[${g.type}]`)} ${g.msg}`);
		});
	}

	const reportPath = path.join(projectRoot, "aizen-gate", "shared", "analysis-report.md");
	await fs.ensureDir(path.dirname(reportPath));
	await fs.writeFile(
		reportPath,
		`# Artifact Consistency Report\n\nFeature: ${activeFeature}\n\n${gaps.map((g) => `- **${g.type}**: ${g.msg}`).join("\n") || "No issues found."}`,
	);
}
