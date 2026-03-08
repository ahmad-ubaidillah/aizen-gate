const { intro, outro, select, note, cancel, isCancel } = require("@clack/prompts");
const chalk = require("chalk");
const path = require("node:path");
const fs = require("fs-extra");

async function runOnboarding(projectRoot) {
	intro(chalk.cyan.bold("⛩️  Aizen-Gate | Onboarding Wizard"));

	note(
		"Welcome to the Aizen-Gate Shield System. This wizard will guide you\n" +
			"through the high-retention engagement pipeline to get your first\n" +
			"feature built autonomously.",
		"First Contact",
	);

	const step = await select({
		message: "What is your primary goal right now?",
		options: [
			{ label: "🚀 Start a new feature development (The 7-Phase Pipeline)", value: "pipeline" },
			{
				label: "🏛️ Set project principles & coding standards (Constitution)",
				value: "constitution",
			},
			{ label: "🧠 Learn how Aizen's 5-Tier Memory works", value: "memory" },
			{ label: "🗺️ Map my existing architecture", value: "map" },
			{ label: "🚪 Exit wizard", value: "exit" },
		],
	});

	if (isCancel(step) || step === "exit") {
		cancel("Onboarding exited. Use 'npx aizen-gate onboarding' anytime to return.");
		return;
	}

	switch (step) {
		case "pipeline":
			note(
				`To run the full pipeline automatically:\n` +
					`→ ${chalk.cyan("npx aizen-gate wizard")}\n\n` +
					`Or run step-by-step:\n` +
					`1. ${chalk.cyan("npx aizen-gate specify")}  -> Interview to define the feature.\n` +
					`2. ${chalk.cyan("npx aizen-gate plan")}     -> Architect makes a blueprint.\n` +
					`3. ${chalk.cyan("npx aizen-gate tasks")}    -> Break down into Work Packages.\n` +
					`4. ${chalk.cyan("npx aizen-gate auto")}     -> Launch autonomous execution.\n\n` +
					`Try running ${chalk.yellow("npx aizen-gate wizard")} to begin!`,
				"The 7-Phase Strategic Pipeline",
			);
			break;

		case "constitution":
			note(
				"The Constitution defines your project's DNA and Quality Mode.\n" +
					"Aizen is language-agnostic and will adapt to your workspace.\n\n" +
					`Run: ${chalk.yellow("npx aizen-gate constitution")}`,
				"Project Governance",
			);
			break;

		case "memory":
			note(
				"Aizen uses hierarchical memory:\n" +
					"- Working (Immediate context)\n" +
					"- Episodic (Decision history)\n" +
					"- Semantic (Your project's patterns)\n\n" +
					"It learns as you build. No more repeating yourself to the AI.",
				"Universal Intelligence",
			);
			break;

		case "map":
			note(
				"Aizen can visualize your project dependency graph.\n\n" +
					`Run: ${chalk.yellow("npx aizen-gate map")}`,
				"Architecture Visibility",
			);
			break;
	}

	outro(chalk.cyan("Good luck, Architect. The Shield is active."));
}

module.exports = { runOnboarding };
