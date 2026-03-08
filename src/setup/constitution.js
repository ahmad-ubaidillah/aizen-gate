const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const { intro, outro, select, text, group, isCancel, cancel, note } = require("@clack/prompts");

/**
 * Constitution: Interactive interview to set project DNA.
 */
async function runConstitution(projectRoot) {
	intro(chalk.red.bold("⛩️  Aizen-Gate | Project Constitution"));

	const constitutionPath = path.join(projectRoot, "aizen-gate", "shared", "constitution.md");

	if (fs.existsSync(constitutionPath)) {
		note(
			chalk.yellow("Existing constitution found. Let's update your project principles."),
			"Review & Optimization",
		);
	}

	const results = await group(
		{
			qualityPriority: () =>
				select({
					message: "Quality Priority?",
					options: [
						{ label: "Stability (Test-driven, formal)", value: "high" },
						{ label: "Velocity (Rapid iterations)", value: "medium" },
						{ label: "Experimental (Proof-of-concept)", value: "low" },
					],
					initialValue: "high",
				}),
		},
		{
			onCancel: () => {
				cancel("Constitution definition aborted.");
				process.exit(0);
			},
		},
	);

	const content = `
# 🌀 Aizen-Gate Project Constitution
*Generated: ${new Date().toISOString()}*

## 🏛️ Core Architectural DNA
- **Architecture:** Agnostic (Framework & Language independent)
- **Quality Mode:** ${results.qualityPriority}

## ⚓ Principles
1. **Consistency:** All components must follow the established architectural patterns of the workspace.
2. **Quality:** Maintain high standards according to the "${results.qualityPriority}" priority mode.
3. **Traceability:** Documentation and code must stay in sync.
4. **Security:** No hardcoded secrets. Use .env placeholders.

## 🛡️ Governance
- Agents must refuse any architecture that violates these mandates.
- All Work Packages must be verified against this constitution before merge.
`;

	await fs.ensureDir(path.dirname(constitutionPath));
	await fs.writeFile(constitutionPath, content);

	outro(chalk.green(`✔ Project Constitution saved to ${chalk.dim(constitutionPath)}`));
}

module.exports = { runConstitution };
