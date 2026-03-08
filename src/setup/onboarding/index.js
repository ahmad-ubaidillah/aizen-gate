/**
 * AIZEN-GATE Enhanced Onboarding Wizard
 *
 * Flow:
 * 1. Welcome + IDE/CLI Selection
 * 2. Development Type Selection
 * 3. PRD Flow (Yes/No)
 * 4. AIZEN Handoff
 * 5. Confirmation Loop
 */

const { intro, outro, note, cancel, isCancel, text } = require("@clack/prompts");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("node:path");

const { selectIDE } = require("./steps/ide-select");
const { selectDevType } = require("./steps/dev-type");
const { handlePRDFlow, validatePRDReady } = require("./steps/prd-flow");
const { confirmPRD, showTaskCreationProgress, getNextCommand } = require("./steps/confirm-flow");
const {
	triggerAIZENForSpecify,
	assignPRDToPM,
	checkAIZENTrigger,
} = require("./steps/agent-handoff");

/**
 * Main onboarding orchestrator
 */
async function runEnhancedOnboarding(projectRoot) {
	intro(chalk.cyan.bold("⛩️  AIZEN-GATE | Enhanced Onboarding"));

	// Welcome message
	note(
		chalk.cyan("Welcome to AIZEN-GATE!\n") +
			"This wizard will help you set up your project with the right configuration.\n\n" +
			chalk.yellow("We'll ask about:") +
			"\n" +
			"  1. Your IDE/CLI preference\n" +
			"  2. Development type (Fast/Medium/Slow)\n" +
			"  3. PRD status\n\n" +
			chalk.dim("Press Ctrl+C anytime to exit."),
		"Getting Started",
	);

	// Step 1: IDE Selection
	const ideData = await selectIDE(projectRoot);
	if (!ideData) return;

	// Step 2: Development Type
	const devTypeData = await selectDevType(projectRoot);
	if (!devTypeData) return;

	// Step 3: PRD Flow
	const prdData = await handlePRDFlow(projectRoot);
	if (!prdData) return;

	// Store onboarding data
	const onboardingData = {
		ide: ideData.ide,
		devType: devTypeData.devType,
		prdPath: prdData.prdPath,
		prdExists: prdData.prdExists || false,
		brainstormingPath: prdData.brainstormingPath,
	};

	// Save onboarding config
	await saveOnboardingConfig(projectRoot, onboardingData);

	// Check if PRD is ready
	if (!prdData.prdExists && !prdData.hasPRD) {
		// User needs to create PRD first
		outro(chalk.yellow("Please complete your PRD, then run: npx aizen-gate onboarding"));
		return;
	}

	if (!prdData.prdExists && prdData.hasPRD) {
		// User has PRD but needs to add it
		outro(chalk.yellow(`Please add your PRD to: ${prdData.prdPath}`));
		return;
	}

	// PRD is ready - show summary and confirm
	const confirmation = await confirmPRD(projectRoot, onboardingData);

	if (!confirmation.confirmed) {
		if (confirmation.action === "restart") {
			outro(chalk.yellow("Restarting onboarding..."));
			return await runEnhancedOnboarding(projectRoot);
		}
		if (confirmation.action === "edit") {
			outro(
				chalk.yellow(
					`Please edit your PRD at: ${prdData.prdPath}\nThen run: npx aizen-gate onboarding`,
				),
			);
			return;
		}
		cancel("Onboarding cancelled.");
		return;
	}

	// Confirmed - proceed to AIZEN handoff
	await assignPRDToPM(projectRoot, onboardingData);

	// Show completion message
	showTaskCreationProgress();

	outro(chalk.cyan.bold("⛩️  Onboarding Complete! Run the next command when ready."));
}

/**
 * Save onboarding configuration to file
 */
async function saveOnboardingConfig(projectRoot, data) {
	const configPath = path.join(projectRoot, "aizen-gate", "onboarding-config.json");

	await fs.ensureDir(path.dirname(configPath));
	await fs.writeJson(
		configPath,
		{
			...data,
			timestamp: new Date().toISOString(),
		},
		{ spaces: 2 },
	);

	note(chalk.green("✅ Configuration saved!") + `\n${chalk.dim(configPath)}`, "Config Saved");
}

/**
 * Handle AIZEN trigger (for when user says "hey [AIZEN] the prd is ready")
 */
async function handleAIZENTrigger(projectRoot, userInput) {
	const trigger = await checkAIZENTrigger(userInput);

	if (!trigger.isTrigger) {
		return { handled: false };
	}

	// Validate PRD is ready
	const validation = await validatePRDReady(projectRoot);

	if (!validation.ready) {
		return {
			handled: true,
			message: `PRD not found. Please create it first at: ${path.join(projectRoot, "aizen-gate/PRD/prd.md")}`,
		};
	}

	// Load onboarding config
	const configPath = path.join(projectRoot, "aizen-gate", "onboarding-config.json");
	let onboardingData = { devType: "medium", ide: "vscode" };

	if (await fs.pathExists(configPath)) {
		onboardingData = await fs.readJson(configPath);
	}

	// Trigger AIZEN to run specify
	const result = await triggerAIZENForSpecify(projectRoot, onboardingData);

	return {
		handled: true,
		...result,
	};
}

module.exports = {
	runEnhancedOnboarding,
	handleAIZENTrigger,
	saveOnboardingConfig,
};
