import path from "node:path";
import { intro, note, outro } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { checkAIZENTrigger, triggerAIZENForSpecify } from "./steps/agent-handoff.js";
import { runComprehensiveOnboarding } from "./steps/comprehensive-setup.js";
import { showTaskCreationProgress } from "./steps/confirm-flow.js";
import { handlePRDFlow, validatePRDReady } from "./steps/prd-flow.js";

/**
 * Entry point for onboarding
 * Can run either the legacy or comprehensive flow
 */
export async function runOnboarding(args: {
	comprehensive?: boolean;
	projectRoot?: string;
}): Promise<void> {
	if (args.comprehensive) {
		// Run the new comprehensive onboarding flow
		await runComprehensiveOnboarding();
	} else {
		// Run the legacy onboarding flow
		const projectRoot = args.projectRoot || process.cwd();
		await runEnhancedOnboarding(projectRoot);
	}
}

/**
 * Simplified onboarding - BMad V6 Style
 * Clean, simple, no confusing options
 */
export async function runEnhancedOnboarding(projectRoot: string): Promise<void> {
	// Welcome - clean and simple
	intro(chalk.cyan.bold("⛩️  AIZEN-GATE"));

	// Quick welcome note
	note(
		chalk.gray("Set up your project in seconds.\n") +
			chalk.dim("Press ") +
			chalk.yellow("Ctrl+C") +
			chalk.dim(" anytime to exit."),
		"Welcome",
	);

	// Step 1: What to build (includes PRD template)
	const prdData = await handlePRDFlow(projectRoot);
	if (!prdData) return;

	// Save config
	const onboardingData = {
		devType: "medium",
		ide: "vscode",
		prdPath: (prdData as any).prdPath,
		prdExists: (prdData as any).prdExists || false,
		brainstormingPath: (prdData as any).brainstormingPath,
	};

	await saveOnboardingConfig(projectRoot, onboardingData);

	// Check PRD status
	if (!(prdData as any).prdExists && !(prdData as any).hasPRD) {
		outro(chalk.yellow("📝 Complete your plan, then run: ") + chalk.white("npx aizen-gate start"));
		return;
	}

	if (!(prdData as any).prdExists && (prdData as any).hasPRD) {
		outro(
			chalk.yellow("📝 Add your plan to: ") +
				chalk.white((prdData as any).prdPath) +
				"\n" +
				chalk.yellow("Then run: ") +
				chalk.white("npx aizen-gate start"),
		);
		return;
	}

	// Done! Show next steps
	showTaskCreationProgress();

	outro(chalk.green.bold("✓ ") + chalk.white("Ready! Run: ") + chalk.cyan("npx aizen-gate start"));
}

/**
 * Save onboarding configuration to file
 */
export async function saveOnboardingConfig(projectRoot: string, data: any): Promise<void> {
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
}

/**
 * Handle AIZEN trigger (for when user says "hey [AIZEN] the prd is ready")
 */
export async function handleAIZENTrigger(projectRoot: string, userInput: string): Promise<any> {
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
