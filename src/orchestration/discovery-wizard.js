const { intro, text, select, note, cancel, isCancel, outro } = require("@clack/prompts");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("node:path");
const { execSync } = require("node:child_process");

/**
 * [AZ] Discovery Wizard
 * Transforms the passive 'specify' phase into an elite, interactive Socratic interview.
 */
async function runDiscoveryWizard(projectRoot) {
	intro(chalk.cyan.bold("⛩️  Aizen-Gate | Discovery Phase"));

	note(
		"Welcome to the high-retention specification pipeline.\n" +
			"We will now define the primary objective and user flows\n" +
			"to ensure zero-defect implementation.",
		"PM Interview",
	);

	// 1. Capture Feature Name & Objective
	const featureName = await text({
		message: "What is the name of the feature or problem we are solving?",
		placeholder: "e.g., Social Auth Integration, Memory Cache Refactor",
		validate: (value) => {
			if (!value) return "Feature name is required.";
		},
	});
	if (isCancel(featureName)) {
		cancel("Discovery cancelled.");
		return;
	}

	const objective = await text({
		message: "What is the primary objective? (The Elevator Pitch)",
		placeholder: "e.g., Enable users to sign in via Google to increase retention by 20%.",
		validate: (value) => {
			if (!value) return "Objective is required.";
		},
	});
	if (isCancel(objective)) {
		cancel("Discovery cancelled.");
		return;
	}

	// 2. Generate Slug
	const slug = featureName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	const nextId = await getNextFeatureId(projectRoot);
	const featureSlug = `${nextId}-${slug}`;
	const specDir = path.join(projectRoot, "aizen-gate/specs", featureSlug);

	note(
		`Feature Identity: ${chalk.cyan(featureName)}\n` +
			`Target Slug: ${chalk.yellow(featureSlug)}\n` +
			`Directory: ${chalk.dim(specDir)}`,
		"Validation",
	);

	const confirm = await select({
		message: "Ready to scaffold the feature directory and branch?",
		options: [
			{ label: "✅ Proceed with scaffold", value: "yes" },
			{ label: "❌ Let me change the name", value: "no" },
		],
	});
	if (isCancel(confirm) || confirm === "no") {
		cancel("Scaffold aborted.");
		return;
	}

	// 3. Scaffold Directory & spec.md
	try {
		await fs.ensureDir(specDir);
		const specContent = generateInitialSpec(featureName, objective);
		await fs.writeFile(path.join(specDir, "spec.md"), specContent);

		// 4. Branch Initialization
		console.log(chalk.dim("\n  Initializing git branch..."));
		try {
			execSync(`git checkout -b feature/${featureSlug}`, { stdio: "ignore", cwd: projectRoot });
		} catch (error) {
			if (error.message?.includes("already exists")) {
				console.log(chalk.yellow(`  ℹ Branch already exists, using existing branch`));
			} else if (error.message?.includes("not a git repository")) {
				console.log(chalk.red(`  ⚠ Not a git repository. Please initialize git first.`));
			} else {
				console.log(chalk.yellow(`  ℹ Could not create branch: ${error.message}`));
			}
		}

		outro(chalk.green.bold(`\n⛩️  Discovery Complete. Directory & Branch Initialized.`));
		console.log(
			chalk.gray(
				`\nInvoke agent: "Read ${path.join(specDir, "spec.md")} and begin the full Socratic interview to finalize the AC."\n`,
			),
		);
	} catch (err) {
		cancel(`Failed to initialize discovery: ${err.message}`);
	}
}

/**
 * Find the next available sequential ID for a feature (e.g., 001, 002)
 */
async function getNextFeatureId(projectRoot) {
	const specsDir = path.join(projectRoot, "aizen-gate/specs");
	await fs.ensureDir(specsDir);
	const items = await fs.readdir(specsDir);
	const ids = items
		.map((item) => parseInt(item.split("-")[0]))
		.filter((id) => !isNaN(id))
		.sort((a, b) => a - b);

	const nextId = ids.length > 0 ? ids[ids.length - 1] + 1 : 1;
	return nextId.toString().padStart(3, "0");
}

function generateInitialSpec(name, objective) {
	return `# Spec: ${name}

## Elevator Pitch
${objective}

## 🌀 User Flow (Draft)
- [Agent to complete]

## 🛠️ Functional Requirements
- [Agent to complete]

## ✅ Acceptance Criteria (AC)
- [ ] [Feature initialized successfully]
- [Agent to add more based on interview]

## 🏗️ Technical Constraints
- [Agent to define]

## 🚫 Out of Scope
- [Agent to define]
`;
}

module.exports = { runDiscoveryWizard };
