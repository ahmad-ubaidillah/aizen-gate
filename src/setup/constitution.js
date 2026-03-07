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
			language: () =>
				text({
					message: "Primary Language?",
					placeholder: "TypeScript",
					initialValue: "TypeScript",
				}),
			framework: () =>
				text({
					message: "Primary Framework?",
					placeholder: "Next.js",
					initialValue: "Next.js",
				}),
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
			standards: () =>
				text({
					message: "Linting/Coding Standard?",
					placeholder: "Biome/ESLint",
					initialValue: "Biome/ESLint",
				}),
			testStack: () =>
				text({
					message: "Testing Stack?",
					placeholder: "Vitest",
					initialValue: "Vitest",
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
- **Language:** ${results.language}
- **Framework:** ${results.framework}
- **Quality Mode:** ${results.qualityPriority}
- **Standards:** ${results.standards}
- **Testing:** ${results.testStack}

## ⚓ Principles
1. **Consistency:** All components must follow the established ${results.framework} patterns.
2. **Quality:** Maintain high coverage with ${results.testStack}.
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
