import path from "node:path";
import { intro, note, outro } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { selectAIIntegration } from "./ai-integration.js";
import { selectInstallDirectory } from "./install-directory.js";
import { mapModuleToDevType, selectModule } from "./module-select.js";
import { selectPRDOwnership } from "./prd-ownership.js";
import { selectUserPreferences } from "./user-preferences.js";

/**
 * Comprehensive Onboarding Flow
 * Complete setup with all 8 requirements:
 * 1. Installation Directory
 * 2. Module Selection (Ideation/MVP/Enterprise)
 * 3. AI Tool Integration
 * 4. User Name (how Aizen calls the user)
 * 5. Interaction Language
 * 6. Output Language
 * 7. Output Directory
 * 8. PRD Ownership
 */
export interface ComprehensiveOnboardingResult {
	// Installation
	installDirectory: string;
	isCustomDirectory: boolean;

	// Module
	module: string;
	devType: string;

	// AI Integration
	selectedTools: string[];
	toolLabels: Record<string, string>;

	// User Preferences
	userName: string;
	pronoun: string;
	interactionLanguage: string;
	outputLanguage: string;
	outputDirectory: string;

	// PRD
	hasPRD: boolean;
	prdPath?: string;
	brainstormingPath?: string;
	prdExists?: boolean;
}

/**
 * Run the comprehensive onboarding flow
 */
export async function runComprehensiveOnboarding(): Promise<ComprehensiveOnboardingResult | null> {
	// Welcome
	intro(chalk.cyan.bold("⛩️  AIZEN-GATE Setup"));

	note(
		chalk.gray("Let's set up your development environment.\n") +
			chalk.dim("Press ") +
			chalk.yellow("Ctrl+C") +
			chalk.dim(" anytime to exit."),
		"Welcome",
	);

	// Step 1: Installation Directory
	const installResult = await selectInstallDirectory();
	if (!installResult) return null;

	const projectRoot = installResult.installDirectory;

	// Step 2: Module Selection
	const moduleResult = await selectModule(projectRoot);
	if (!moduleResult) return null;

	// Step 3: AI Tool Integration
	const aiResult = await selectAIIntegration();
	if (!aiResult) return null;

	// Step 4-8: User Preferences (includes name, pronoun, languages, output dir)
	const prefsResult = await selectUserPreferences(projectRoot);
	if (!prefsResult) return null;

	// Step 9: PRD Ownership
	const prdResult = await selectPRDOwnership(projectRoot);
	if (!prdResult) return null;

	// Map module to devType for backward compatibility
	const devType = mapModuleToDevType(moduleResult.module);

	// Create output directory
	try {
		await fs.ensureDir(prefsResult.outputDirectory);
	} catch (_error) {
		note(
			chalk.yellow(`⚠️ Could not create output directory: ${prefsResult.outputDirectory}`),
			"Warning",
		);
	}

	// Save comprehensive config
	const config = {
		installDirectory: projectRoot,
		isCustomDirectory: installResult.isCustomDirectory,
		module: moduleResult.module,
		devType,
		selectedTools: aiResult.selectedTools,
		toolLabels: aiResult.toolLabels,
		userName: prefsResult.userName,
		pronoun: prefsResult.pronoun,
		interactionLanguage: prefsResult.interactionLanguage,
		outputLanguage: prefsResult.outputLanguage,
		outputDirectory: prefsResult.outputDirectory,
		hasPRD: prdResult.hasPRD,
		prdPath: prdResult.prdPath,
		brainstormingPath: prdResult.brainstormingPath,
		prdExists: prdResult.prdExists,
		timestamp: new Date().toISOString(),
	};

	// Save to aizen-gate/config/onboarding-config.json
	const configPath = path.join(projectRoot, "aizen-gate", "config", "onboarding.json");
	await fs.ensureDir(path.dirname(configPath));
	await fs.writeJson(configPath, config, { spaces: 2 });

	// Show summary
	showOnboardingSummary(config);

	return config;
}

/**
 * Display onboarding summary
 */
function showOnboardingSummary(config: ComprehensiveOnboardingResult): void {
	const toolCount = config.selectedTools.length;
	const toolsText =
		toolCount > 0
			? `${chalk.green(toolCount)} AI tools integrated`
			: chalk.yellow("No AI tools integrated");

	note(
		chalk.white.bold("🎉 Setup Complete!\n\n") +
			chalk.gray("─".repeat(40)) +
			"\n\n" +
			chalk.cyan("📍 Installation") +
			"\n" +
			`   ${chalk.gray("•")} Directory: ${chalk.white(config.installDirectory)}\n\n` +
			chalk.cyan("🎯 Development Mode") +
			"\n" +
			`   ${chalk.gray("•")} Module: ${chalk.white(config.module)}\n\n` +
			chalk.cyan("🤖 AI Integration") +
			"\n" +
			`   ${chalk.gray("•")} ${toolsText}\n\n` +
			chalk.cyan("👤 User Preferences") +
			"\n" +
			`   ${chalk.gray("•")} Name: ${chalk.white(config.userName)}\n` +
			`   ${chalk.gray("•")} Pronoun: ${chalk.white(config.pronoun)}\n` +
			`   ${chalk.gray("•")} Interaction: ${chalk.white(config.interactionLanguage)}\n` +
			`   ${chalk.gray("•")} Output: ${chalk.white(config.outputLanguage)}\n\n` +
			chalk.cyan("📁 Output") +
			"\n" +
			`   ${chalk.gray("•")} Directory: ${chalk.white(config.outputDirectory)}\n\n` +
			chalk.cyan("📋 PRD") +
			"\n" +
			`   ${chalk.gray("•")} Has PRD: ${config.hasPRD ? chalk.green("Yes") : chalk.yellow("No")}\n` +
			chalk.gray("─".repeat(40)),
		"Summary",
	);

	// Next steps
	let nextCommand = "npx aizen-gate start";
	let nextMessage = "Start your project";

	if (!config.hasPRD) {
		nextCommand = "npx aizen-gate idea";
		nextMessage = "Create your feature plan";
	} else if (config.prdExists) {
		nextCommand = "npx aizen-gate specify";
		nextMessage = "Create specifications from PRD";
	}

	outro(
		chalk.green.bold("✓ ") +
			chalk.white("Ready!\n\n") +
			chalk.gray("Next: ") +
			chalk.cyan(nextMessage) +
			"\n" +
			chalk.gray("Run: ") +
			chalk.yellow(nextCommand),
	);
}

/**
 * Save comprehensive onboarding configuration
 */
export async function saveOnboardingConfig(
	projectRoot: string,
	data: ComprehensiveOnboardingResult,
): Promise<void> {
	const configPath = path.join(projectRoot, "aizen-gate", "config", "onboarding.json");
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
 * Load onboarding configuration
 */
export async function loadOnboardingConfig(
	projectRoot: string,
): Promise<ComprehensiveOnboardingResult | null> {
	const configPath = path.join(projectRoot, "aizen-gate", "config", "onboarding.json");

	if (!(await fs.pathExists(configPath))) {
		return null;
	}

	return await fs.readJson(configPath);
}
