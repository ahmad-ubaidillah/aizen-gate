import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Checklist Generator: Transforms Spec ACs into a structured QA checklist.
 */
export async function generateChecklist(projectRoot: string, featureName?: string): Promise<void> {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Structured Quality Checklist Generator ---\n"));

	const specsDir = path.join(projectRoot, "aizen-gate", "specs");
	let activeFeature = featureName;

	if (!activeFeature && fs.existsSync(specsDir)) {
		const dirs = await fs.readdir(specsDir);
		activeFeature = dirs.find((d) => fs.statSync(path.join(specsDir, d)).isDirectory());
	}

	if (!activeFeature) {
		console.log(chalk.yellow("[Aizen] No features found to generate checklist."));
		return;
	}

	const specPath = path.join(specsDir, activeFeature, "spec.md");
	if (!fs.existsSync(specPath)) {
		console.log(chalk.red(`[Error] Spec not found at: ${specPath}`));
		return;
	}

	const spec = await fs.readFile(specPath, "utf8");

	// Extract ACs
	const acMatches = spec.match(/- \[ \].*|- \[x\].*/g) || [];
	const acceptanceCriteria = acMatches.map((m) => m.replace(/\[.\]/, "").trim());

	if (acceptanceCriteria.length === 0) {
		console.log(chalk.yellow("[Aizen] No Acceptance Criteria found in spec.md."));
		return;
	}

	// Generate Checklist Content
	let checklist = `# Quality Verification Checklist\n\n`;
	checklist += `**Feature**: ${activeFeature}\n`;
	checklist += `**Generated**: ${new Date().toLocaleString()}\n\n`;
	checklist += `## [QA] Acceptance Verification\n\n`;

	acceptanceCriteria.forEach((ac, index) => {
		checklist += `### AC-${(index + 1).toString().padStart(2, "0")}: ${ac}\n`;
		checklist += "- [ ] Verified in manual UAT\n";
		checklist += "- [ ] Verified via automated tests\n";
		checklist += "- [ ] Performance/Security check passed\n\n";
	});

	checklist += "\n---\n*⛩️ [Aizen] Checklist auto-generated to ensure zero drift.*";

	const outputPath = path.join(specsDir, activeFeature, "quality-checklist.md");
	await fs.writeFile(outputPath, checklist);

	console.log(chalk.green(`✔ Checklist generated successfully: ${outputPath}`));
	console.log(chalk.gray("Sub-agents will now use this for final [QA] review."));
}
