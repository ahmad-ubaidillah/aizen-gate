const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * Spec Decomposer: Analyzes spec complexity and suggests sub-specs.
 */
async function analyzeAndDecompose(projectRoot, featureName) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Recursive Spec Decomposition Analysis ---\n"));

	const specsDir = path.join(projectRoot, "aizen-gate", "specs");
	let activeFeature = featureName;

	if (!activeFeature && fs.existsSync(specsDir)) {
		const dirs = await fs.readdir(specsDir);
		activeFeature = dirs.find((d) => fs.statSync(path.join(specsDir, d)).isDirectory());
	}

	if (!activeFeature) return;

	const specPath = path.join(specsDir, activeFeature, "spec.md");
	if (!fs.existsSync(specPath)) return;

	const spec = await fs.readFile(specPath, "utf8");
	const lineCount = spec.split("\n").length;
	const acCount = (spec.match(/- \[ \]/g) || []).length;

	console.log(`[Analysis] Feature: ${chalk.cyan(activeFeature)}`);
	console.log(`[Analysis] Size: ${lineCount} lines, ${acCount} Acceptance Criteria.`);

	// Heuristic: If more than 15 ACs or 300 lines, it's too large for a single feature
	if (acCount > 15 || lineCount > 300) {
		console.log(
			chalk.yellow(
				`\n⚠️ [Critical Complexity] This feature is too large for a single implementation wave.`,
			),
		);
		console.log(chalk.gray(`[AZ] Recommended Action: Split into 2-3 sub-features.`));

		console.log(`\nProposed Sub-Specs:`);
		console.log(` 1. ${activeFeature}-core (Auth & Base Models)`);
		console.log(` 2. ${activeFeature}-extended (API & Integration)`);
		console.log(` 3. ${activeFeature}-ui (Frontend & UX)`);

		return true; // Should decompose
	} else {
		console.log(chalk.green(`\n✔ Feature complexity is within optimal limits for a single wave.`));
		return false;
	}
}

module.exports = { analyzeAndDecompose };
