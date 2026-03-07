const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * Aizen-Gate Codebase Mapper (Advanced Brownfield Edition)
 * Spawns 5 parallel analysis dimensions to map existing codebases.
 */
async function mapCodebase(projectRoot) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Launching Brownfield Codebase Mapping ---\n"));

	const dimensions = [
		{
			id: "ARCH",
			name: "Architecture Analyst",
			prompt:
				"Analyze patterns (MVC, microservices, etc.), module boundaries, and cross-module dependencies.",
		},
		{
			id: "TECH",
			name: "Tech Stack Detective",
			prompt: "Identify languages, frameworks, build tools, test runners, and CI/CD pipelines.",
		},
		{
			id: "DATA",
			name: "Data Model Inspector",
			prompt: "Analyze database schemas, ORM usage, data flows, and central API contracts.",
		},
		{
			id: "API",
			name: "API Surface Scanner",
			prompt: "Map all exposed endpoints, authentication mechanisms, and external integrations.",
		},
		{
			id: "QUALITY",
			name: "Quality Auditor",
			prompt:
				"Assess test coverage, linting status, known technical debt, and convention adherence.",
		},
	];

	const mapPath = path.join(projectRoot, "aizen-gate", "shared", "codebase-map.md");
	await fs.ensureDir(path.dirname(mapPath));

	if (!fs.existsSync(mapPath)) {
		const initialMap = `
# 🗺️ Project Codebase Map
Generated: ${new Date().toISOString()}

## 🏛️ Architecture Analysis
*Pending Analysis...*

## 🛠️ Tech Stack & Tooling
*Pending Analysis...*

## 💾 Data Modeling & Schema
*Pending Analysis...*

## 🔌 API Surface & Integrations
*Pending Analysis...*

## 🛡️ Quality & Standards Audit
*Pending Analysis...*
`;
		await fs.writeFile(mapPath, initialMap);
	}

	console.log(chalk.cyan(`[Aizen] Spawning 5 parallel analysis dimensions...\n`));

	for (const dim of dimensions) {
		console.log(chalk.white(`\n<analysis_task id="${dim.id}" name="${dim.name}">`));
		console.log(chalk.white(`  <goal>${dim.prompt}</goal>`));
		console.log(
			chalk.white(
				`  <instruction>Update the relevant section in ${mapPath} with your findings.</instruction>`,
			),
		);
		console.log(chalk.white(`</analysis_task>`));
	}

	console.log(
		chalk.yellow(`\n[Aizen] Map initialized at ${mapPath}. Analysts, please begin mapping.`),
	);

	return { success: true, path: mapPath };
}

module.exports = { mapCodebase };
