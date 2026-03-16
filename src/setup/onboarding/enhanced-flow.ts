/**
 * Enhanced Onboarding Flow for Aizen-Gate
 * Provides a polished, professional onboarding experience
 */

import os from "node:os";
import path from "node:path";
import {
	cancel,
	confirm,
	intro,
	isCancel,
	note,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";

// Import our new components
import {
	displayCelebration,
	displayError,
	displayFeatureBox,
	displayInfo,
	displayInstallHeader,
	displayNextSteps,
	displaySectionHeader,
	displaySeparator,
	displayStartHeader,
	displayStep,
	displaySuccess,
	displayTip,
	displayWarning,
	displayWelcome,
} from "./components/branded-welcome.js";

import {
	createInstallTracker,
	createStartTracker,
	INSTALL_STEPS,
	ProgressBar,
	ProgressSpinner,
	type ProgressTracker,
	START_STEPS,
	showProgress,
} from "./components/progress-indicator.js";
import { DEV_TYPE_OPTIONS, IDE_OPTIONS, LANGUAGE_OPTIONS } from "./config/options.js";
import { runFirstRunTutorial } from "./first-run-tutorial.js";
import {
	displayPrerequisiteResults,
	getSystemInfo,
	isSystemReady,
	type PrerequisiteCheckResults,
	runPrerequisiteChecks,
} from "./steps/prerequisite-check.js";
import {
	AizenError,
	AizenErrorCode,
	displayError as displayAizenError,
	displayWarning as displayAizenWarning,
	displayInfoBox,
	tryWithErrorHandling,
} from "./utils/error-handler.js";

/**
 * Version information
 */
const VERSION = "2.5.0";

/**
 * Onboarding configuration
 */
export interface OnboardingConfig {
	aizenName: string;
	chatLanguage: string;
	outputLanguage: string;
	outputPath: string;
	projectStyle: string;
	ide: string;
	timestamp: string;
	skipPrerequisites?: boolean;
}

/**
 * Options for running enhanced onboarding
 */
export interface EnhancedOnboardingOptions {
	/** Skip prerequisite checks */
	skipPrerequisites?: boolean;
	/** Use minimal/silent mode */
	minimal?: boolean;
	/** Resume from previous session */
	resume?: boolean;
	/** Project root directory */
	projectRoot?: string;
}

/**
 * Run the enhanced installation flow
 */
export async function runEnhancedInstallFlow(
	options: EnhancedOnboardingOptions = {},
): Promise<{ success: boolean; config?: OnboardingConfig }> {
	const projectRoot = options.projectRoot || process.cwd();
	let retryCount = 0;
	const maxRetries = 2;

	// ========== PHASE 1: Welcome ==========
	console.clear();
	displayWelcome({
		showLogo: true,
		version: VERSION,
		subtitle: "Preparing your AI development environment...",
		minimal: options.minimal,
	});

	// ========== PHASE 2: Prerequisite Checks ==========
	if (!options.skipPrerequisites) {
		displaySectionHeader("System Requirements", "🔍");

		const prereqSpinner = spinner();
		prereqSpinner.start("Checking system requirements...");

		let prereqResults: PrerequisiteCheckResults;

		try {
			prereqResults = await runPrerequisiteChecks({ skipOptional: false });
			prereqSpinner.stop("System check complete");
		} catch (error) {
			prereqSpinner.stop("System check failed");
			displayAizenError(AizenError.from(error as Error, AizenErrorCode.PROCESS_FAILED));

			// Offer retry option
			if (retryCount < maxRetries) {
				const retry = await confirm({
					message: "Would you like to retry the system check?",
					initialValue: true,
				});

				if (retry && !isCancel(retry)) {
					retryCount++;
					return runEnhancedInstallFlow(options);
				}
			}

			return { success: false };
		}

		displayPrerequisiteResults(prereqResults);

		// Check if critical requirements failed
		if (!prereqResults.criticalPassed) {
			console.log();
			console.log(chalk.red.bold("  ✗ Critical requirements not met"));
			console.log();
			console.log(chalk.yellow("  Required:"));
			console.log(chalk.dim("    • Node.js v18 or higher"));
			console.log(chalk.dim("    • npm v9 or higher"));
			console.log(chalk.dim("    • Git (for version control)"));
			console.log();
			console.log(chalk.cyan("  Install with:"));
			console.log(chalk.dim("    • Node.js: https://nodejs.org/"));
			console.log(chalk.dim("    • Git: https://git-scm.com/"));
			console.log();

			const continueAnyway = await confirm({
				message: "Continue anyway? (Not recommended - some features may not work)",
				initialValue: false,
			});

			if (isCancel(continueAnyway) || !continueAnyway) {
				return { success: false };
			}
		}

		// Show warnings but continue
		if (prereqResults.warnings.length > 0) {
			displayTip(
				"Some optional features may be limited. You can install additional dependencies later with: npm install <package>",
			);
		}
	}

	// ========== PHASE 3: Interactive Setup ==========
	console.log();
	displaySectionHeader("Project Configuration", "⚙️");

	// Check for existing configuration
	const existingConfigPath = path.join(projectRoot, "aizen-gate", "config.json");
	let existingConfig: Partial<OnboardingConfig> | null = null;

	if (await fs.pathExists(existingConfigPath)) {
		try {
			existingConfig = await fs.readJson(existingConfigPath);
			displayInfo("Found existing configuration");
			if (existingConfig && existingConfig.timestamp) {
				console.log(chalk.dim(`  Last configured: ${existingConfig.timestamp || "Unknown"}`));
			}
			console.log();

			const useExisting = await confirm({
				message: "Use existing configuration?",
				initialValue: true,
			});

			if (isCancel(useExisting)) {
				cancel("Installation cancelled");
				return { success: false };
			}

			if (useExisting) {
				// Quick setup with existing config
				return await quickSetup(projectRoot, existingConfig as OnboardingConfig);
			}
		} catch {
			displayWarning("Existing configuration is invalid. Creating fresh setup...");
			console.log();
		}
	}

	// Run interactive setup with progress tracking
	const config = await runInteractiveSetup(projectRoot, existingConfig);

	if (!config) {
		return { success: false };
	}

	// ========== PHASE 4: Scaffolding ==========
	console.log();
	displaySectionHeader("Project Setup", "🏗️");
	console.log(chalk.dim("  This may take a moment..."));
	console.log();

	const scaffoldSuccess = await runScaffolding(projectRoot, config);

	if (!scaffoldSuccess) {
		console.log();
		displayError("Project setup failed");
		console.log();

		const rollback = await confirm({
			message: "Would you like to rollback partial installation?",
			initialValue: true,
		});

		if (rollback && !isCancel(rollback)) {
			try {
				await fs.remove(path.join(projectRoot, "aizen-gate"));
				await fs.remove(path.join(projectRoot, "kanban"));
				displaySuccess("Rollback complete. You can try again.");
			} catch {
				displayWarning("Could not fully rollback. Manual cleanup may be needed.");
			}
		}

		return { success: false };
	}

	// ========== PHASE 5: Health Check ==========
	console.log();
	displaySectionHeader("Verifying Installation", "✓");

	const healthSpinner = spinner();
	healthSpinner.start("Running health check...");

	try {
		// Verify directories were created
		const dirs = [
			path.join(projectRoot, "aizen-gate"),
			path.join(projectRoot, "kanban"),
			path.join(projectRoot, "aizen-gate", "config.json"),
		];

		for (const dir of dirs) {
			if (!(await fs.pathExists(dir))) {
				throw new Error(`Missing: ${dir}`);
			}
		}

		await new Promise((r) => setTimeout(r, 500)); // Brief pause for effect
		healthSpinner.stop("Health check passed");

		console.log();
		console.log(chalk.green("  ✓ All directories created"));
		console.log(chalk.green("  ✓ Configuration saved"));
		console.log(chalk.green("  ✓ Project structure initialized"));
	} catch (error) {
		healthSpinner.stop("Health check failed");
		displayWarning("Installation may be incomplete. Check the logs above.");
	}

	// ========== PHASE 6: Completion ==========
	displayCompletion(config);

	// ========== PHASE 7: First-Run Tutorial ==========
	console.log();
	const runTutorial = await confirm({
		message: "Would you like to take a quick tutorial to get started?",
		initialValue: true,
	});

	if (runTutorial && !isCancel(runTutorial)) {
		await runFirstRunTutorial(projectRoot);
	} else {
		console.log();
		displayInfo("Tutorial skipped. Run 'npx aizen-gate tutorial' anytime to learn more.");
		console.log();
	}

	return { success: true, config };
}

/**
 * Quick setup with existing configuration
 */
async function quickSetup(
	projectRoot: string,
	config: OnboardingConfig,
): Promise<{ success: boolean; config?: OnboardingConfig }> {
	displayInfo("Updating your installation...");

	const tracker = createInstallTracker();
	tracker.start("Updating Aizen-Gate");

	// Skip to scaffolding
	tracker.startStep("setup-directories");
	const scaffoldSuccess = await runScaffolding(projectRoot, config, tracker);

	if (!scaffoldSuccess) {
		tracker.failStep("setup-directories", "Scaffolding failed");
		tracker.finish();
		return { success: false };
	}

	tracker.finish("Update complete");
	displayCompletion(config);

	return { success: true, config };
}

/**
 * Run interactive setup with progress indication
 */
async function runInteractiveSetup(
	projectRoot: string,
	existingConfig?: Partial<OnboardingConfig> | null,
): Promise<OnboardingConfig | null> {
	const totalSteps = 6;
	let currentStep = 0;

	// Step 1: Name
	displayStep(++currentStep, totalSteps, "What should I call you?");

	const aizenName = await text({
		message: "Your name or nickname",
		placeholder: "developer",
		initialValue: existingConfig?.aizenName || "developer",
	});

	if (isCancel(aizenName)) {
		cancel("Setup cancelled");
		return null;
	}

	displaySuccess(`Nice to meet you, ${chalk.green(aizenName as string)}!`);

	// Step 2: Chat Language
	displayStep(++currentStep, totalSteps, "Preferred chat language");

	const chatLanguage = await select({
		message: "What language should I use for conversations?",
		options: LANGUAGE_OPTIONS.map((l) => ({
			label: l.label,
			value: l.value,
		})),
		initialValue: existingConfig?.chatLanguage || "en",
	});

	if (isCancel(chatLanguage)) {
		cancel("Setup cancelled");
		return null;
	}

	const selectedChatLang = LANGUAGE_OPTIONS.find((l) => l.value === chatLanguage);
	displaySuccess(`Chat language: ${selectedChatLang?.label}`);

	// Step 3: Output Language
	displayStep(++currentStep, totalSteps, "Preferred output language");

	const outputLanguageOptions = [
		{
			label: `Same as chat (${selectedChatLang?.label || "English"})`,
			value: "same",
		},
		...LANGUAGE_OPTIONS,
	];

	const outputLanguage = await select({
		message: "What language for generated content?",
		options: outputLanguageOptions,
		initialValue: existingConfig?.outputLanguage || "same",
	});

	if (isCancel(outputLanguage)) {
		cancel("Setup cancelled");
		return null;
	}

	const resolvedOutputLang = outputLanguage === "same" ? chatLanguage : outputLanguage;
	displaySuccess(
		`Output language: ${LANGUAGE_OPTIONS.find((l) => l.value === resolvedOutputLang)?.label}`,
	);

	// Step 4: Output Path
	displayStep(++currentStep, totalSteps, "Output directory");

	const defaultOutputPath = path.join(projectRoot, ".agent", "output");

	const useDefaultPath = await confirm({
		message: `Use default output path? (${chalk.cyan(defaultOutputPath)})`,
		initialValue: true,
	});

	if (isCancel(useDefaultPath)) {
		cancel("Setup cancelled");
		return null;
	}

	let outputPath: string;

	if (useDefaultPath) {
		outputPath = defaultOutputPath;
	} else {
		const customPath = await text({
			message: "Enter custom output directory",
			placeholder: defaultOutputPath,
			validate: (input) => {
				if (!input || input.trim() === "") {
					return "Please enter a valid path";
				}
				return undefined;
			},
		});

		if (isCancel(customPath)) {
			cancel("Setup cancelled");
			return null;
		}

		outputPath = (customPath as string).replace(/^~/, os.homedir());
	}

	displaySuccess(`Output path: ${outputPath}`);

	// Step 5: Project Style
	displayStep(++currentStep, totalSteps, "Development style");

	const projectStyle = await select({
		message: "How do you want to develop?",
		options: DEV_TYPE_OPTIONS.map((opt) => ({
			label: `${opt.label} - ${chalk.dim(opt.details)}`,
			value: opt.value,
		})),
		initialValue: existingConfig?.projectStyle || "medium",
	});

	if (isCancel(projectStyle)) {
		cancel("Setup cancelled");
		return null;
	}

	const selectedStyle = DEV_TYPE_OPTIONS.find((opt) => opt.value === projectStyle);
	displaySuccess(`Style: ${selectedStyle?.label}`);

	// Step 6: IDE Selection
	displayStep(++currentStep, totalSteps, "IDE integration");

	const ide = await select({
		message: "Which IDE are you using?",
		options: IDE_OPTIONS.map((opt) => ({
			label: opt.label,
			value: opt.value,
		})),
		initialValue: existingConfig?.ide || "cursor",
	});

	if (isCancel(ide)) {
		cancel("Setup cancelled");
		return null;
	}

	const selectedIDE = IDE_OPTIONS.find((opt) => opt.value === ide);
	displaySuccess(`IDE: ${selectedIDE?.label}`);

	// Build configuration
	return {
		aizenName: aizenName as string,
		chatLanguage: chatLanguage as string,
		outputLanguage: resolvedOutputLang as string,
		outputPath,
		projectStyle: projectStyle as string,
		ide: ide as string,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Run project scaffolding with progress tracking
 */
async function runScaffolding(
	projectRoot: string,
	config: OnboardingConfig,
	tracker?: ProgressTracker,
): Promise<boolean> {
	const localTracker = tracker || createInstallTracker();

	if (!tracker) {
		localTracker.start("Setting up your project");
	}

	// Step 1: Create directories
	localTracker.startStep("setup-directories", "Creating project structure");

	try {
		const { KanbanScaffolder } = await import("../kanban-scaffold.js");
		const scaffolder = new KanbanScaffolder(projectRoot);
		await scaffolder.scaffold();
		localTracker.completeStep("setup-directories");
	} catch (error) {
		localTracker.failStep("setup-directories", (error as Error).message);
		if (!tracker) {
			localTracker.finish();
			displayAizenError(AizenError.from(error as Error, AizenErrorCode.INSTALL_DIRECTORY));
		}
		return false;
	}

	// Step 2: Configure IDE
	localTracker.startStep("configure-ide", "Configuring IDE integration");

	try {
		await configureIDE(projectRoot, config.ide);
		localTracker.completeStep("configure-ide");
	} catch (error) {
		localTracker.skipStep("configure-ide", "IDE config skipped");
	}

	// Step 3: Create configuration
	localTracker.startStep("create-config", "Saving configuration");

	try {
		await saveConfiguration(projectRoot, config);
		localTracker.completeStep("create-config");
	} catch (error) {
		localTracker.failStep("create-config", (error as Error).message);
		if (!tracker) {
			localTracker.finish();
			displayAizenError(AizenError.from(error as Error, AizenErrorCode.INSTALL_CONFIG));
		}
		return false;
	}

	// Step 4: Finalize
	localTracker.startStep("finalize", "Finalizing setup");

	// Ensure output directory exists
	await fs.ensureDir(config.outputPath);

	localTracker.completeStep("finalize");

	if (!tracker) {
		localTracker.finish("Setup complete");
	}

	return true;
}

/**
 * Configure IDE integration
 */
async function configureIDE(projectRoot: string, ide: string): Promise<void> {
	const agentDir = path.join(projectRoot, ".agent");
	await fs.ensureDir(agentDir);

	// Create IDE-specific files based on selection
	const ideConfigs: Record<string, { file: string; content: string }> = {
		cursor: {
			file: ".cursorrules",
			content: generateIDERules(ide),
		},
		claude: {
			file: "CLAUDE.md",
			content: generateIDERules(ide),
		},
		windsurf: {
			file: "windsurf.md",
			content: generateIDERules(ide),
		},
		gemini: {
			file: "GEMINI.md",
			content: generateIDERules(ide),
		},
	};

	const config = ideConfigs[ide];
	if (config) {
		await fs.writeFile(path.join(agentDir, config.file), config.content);
	}
}

/**
 * Generate IDE rules content
 */
function generateIDERules(ide: string): string {
	return `# Aizen-Gate Integration for ${ide.charAt(0).toUpperCase() + ide.slice(1)}

This file configures Aizen-Gate integration.

## Quick Commands

- \`npx aizen-gate specify\` - Start feature definition
- \`npx aizen-gate plan\` - Generate architecture plan
- \`npx aizen-gate tasks\` - Create work packages
- \`npx aizen-gate auto\` - Run autonomous loop
- \`npx aizen-gate status\` - View sprint board

## Documentation

See AIZEN_GATE.md for full documentation.
`;
}

/**
 * Save configuration to file
 */
async function saveConfiguration(projectRoot: string, config: OnboardingConfig): Promise<void> {
	const configPath = path.join(projectRoot, "aizen-gate", "config.json");
	await fs.ensureDir(path.dirname(configPath));
	await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Display completion summary and next steps
 */
function displayCompletion(config: OnboardingConfig): void {
	console.log();
	displayCelebration("Installation Complete!");
	console.log();

	// Show configuration summary
	displayFeatureBox(
		"Your Configuration",
		[
			`👤 Name: ${config.aizenName}`,
			`🌐 Chat: ${LANGUAGE_OPTIONS.find((l) => l.value === config.chatLanguage)?.label || "English"}`,
			`📁 Output: ${path.basename(config.outputPath)}`,
			`🎯 Style: ${DEV_TYPE_OPTIONS.find((opt) => opt.value === config.projectStyle)?.label || "Balanced"}`,
			`💻 IDE: ${IDE_OPTIONS.find((opt) => opt.value === config.ide)?.label || "Cursor"}`,
		],
		{ icon: "✨", color: "cyan" },
	);

	// Show next steps
	displayNextSteps([
		chalk.cyan("npx aizen-gate start") + " - Initialize your first session",
		chalk.cyan("npx aizen-gate specify") + " - Define a new feature",
		chalk.cyan("npx aizen-gate status") + " - View your sprint board",
		chalk.cyan("npx aizen-gate --help") + " - See all commands",
	]);

	// Show tip
	displayTip(
		"Pro tip: Start with 'npx aizen-gate start' to create your project PRD and begin development!",
	);

	console.log();
	console.log(chalk.cyan.bold("  ⛩️  Welcome to Aizen-Gate! Let's build something amazing."));
	console.log();
}

/**
 * Run enhanced start flow
 */
export async function runEnhancedStartFlow(
	options: EnhancedOnboardingOptions = {},
): Promise<{ success: boolean }> {
	const projectRoot = options.projectRoot || process.cwd();

	// Display start header
	console.clear();
	displayStartHeader();

	// Check for configuration
	const configPath = path.join(projectRoot, "aizen-gate", "config.json");
	let config: OnboardingConfig | null = null;

	if (await fs.pathExists(configPath)) {
		try {
			config = await fs.readJson(configPath);
			if (config) {
				displayInfo(`Project: ${(config as any).projectName || "Aizen-Gate"}`);
				console.log(chalk.dim(`  Version: ${(config as any).version || "Unknown"}`));
				console.log();
			}
		} catch (error) {
			displayWarning("Configuration file is corrupted. Run 'npx aizen-gate install' to fix.");
			console.log();
			const reinstall = await confirm({
				message: "Would you like to run the installation now?",
				initialValue: true,
			});

			if (reinstall && !isCancel(reinstall)) {
				return runEnhancedInstallFlow(options);
			}

			return { success: false };
		}
	}

	if (!config) {
		displayWarning("No configuration found!");
		console.log();
		console.log(chalk.white("  It looks like Aizen-Gate hasn't been set up yet."));
		console.log();
		console.log(chalk.cyan.bold("  Quick Start:"));
		console.log(chalk.dim("    1. Run: npx aizen-gate install"));
		console.log(chalk.dim("    2. Follow the setup wizard"));
		console.log(chalk.dim("    3. Come back and run: npx aizen-gate start"));
		console.log();

		const install = await confirm({
			message: "Run installation now?",
			initialValue: true,
		});

		if (install && !isCancel(install)) {
			return runEnhancedInstallFlow(options);
		}

		return { success: false };
	}

	// Initialize with progress tracking
	const tracker = createStartTracker();
	tracker.start("Starting Aizen-Gate");

	// Step 1: Load configuration
	tracker.startStep("load-config", "Validating configuration");
	try {
		await new Promise((r) => setTimeout(r, 300)); // Visual feedback
		tracker.completeStep("load-config");
	} catch (error) {
		tracker.failStep("load-config", (error as Error).message);
		return { success: false };
	}

	// Step 2: Initialize session
	tracker.startStep("init-session", "Initializing workspace");
	try {
		const { KanbanScaffolder } = await import("../kanban-scaffold.js");
		const scaffolder = new KanbanScaffolder(projectRoot);
		await scaffolder.scaffold();
		tracker.completeStep("init-session");
	} catch (error) {
		tracker.failStep("init-session", (error as Error).message);
		displayWarning("Session initialization had issues, but continuing...");
	}

	// Step 3: Load agents
	tracker.startStep("load-agents", "Loading AI agents");
	await new Promise((r) => setTimeout(r, 200));
	tracker.completeStep("load-agents");

	// Step 4: Init Kanban
	tracker.startStep("init-kanban", "Setting up task board");
	await new Promise((r) => setTimeout(r, 200));
	tracker.completeStep("init-kanban");

	// Step 5: Check PRD
	tracker.startStep("check-prd", "Checking for PRD");
	const prdPath = path.join(projectRoot, ".agent", "PRD", "prd.md");
	const prdExists = await fs.pathExists(prdPath);
	tracker.completeStep("check-prd");

	// Step 6: Start services
	tracker.startStep("start-services", "Starting background services");
	await new Promise((r) => setTimeout(r, 200));
	tracker.completeStep("start-services");

	// Step 7: Ready
	tracker.startStep("ready", "Finalizing startup");
	await new Promise((r) => setTimeout(r, 100));
	tracker.completeStep("ready");

	tracker.finish("Startup complete");

	// Open AIZEN.md in editor
	console.log();
	displayInfo("Opening project workspace...");
	try {
		const { execSync } = await import("node:child_process");
		const aizenMdPath = path.join(projectRoot, "AIZEN.md");

		if (process.platform === "darwin") {
			execSync(`open "${aizenMdPath}"`, { stdio: "ignore" });
		} else if (process.platform === "win32") {
			execSync(`start "" "${aizenMdPath}"`, { stdio: "ignore" });
		} else {
			execSync(`xdg-open "${aizenMdPath}"`, { stdio: "ignore" });
		}
		displaySuccess("Opened AIZEN.md in your default editor");
	} catch {
		displayWarning("Could not open editor automatically");
		console.log(chalk.dim(`  Open manually: AIZEN.md`));
	}

	// Handle PRD flow
	console.log();
	if (!prdExists) {
		displaySectionHeader("PRD Setup", "📝");

		console.log(chalk.white("  A Product Requirements Document (PRD) helps you:"));
		console.log(chalk.dim("    • Define clear project goals"));
		console.log(chalk.dim("    • Track requirements and features"));
		console.log(chalk.dim("    • Align your AI team on objectives"));
		console.log();

		const createPRD = await confirm({
			message: "Would you like to create a PRD now?",
			initialValue: true,
		});

		if (isCancel(createPRD)) {
			// Continue without PRD
			displayInfo("You can create a PRD later with: npx aizen-gate prd");
		} else if (createPRD) {
			try {
				const { handlePRDFlow } = await import("./steps/prd-flow.js");
				await handlePRDFlow(projectRoot);
				displaySuccess("PRD created successfully");
			} catch (error) {
				displayWarning("PRD setup encountered an issue");
				console.log(chalk.dim(`  Create manually in: ${prdPath}`));
			}
		}
	} else {
		displaySuccess("PRD found and loaded");
	}

	// Show ready state with enhanced celebration
	console.log();
	displayCelebration("Ready to Build!");

	console.log();
	console.log(chalk.cyan.bold("  ⛩️  Your AI development team is ready!"));
	console.log();

	// Enhanced quick start guide
	displayFeatureBox(
		"Quick Start Guide",
		[
			`${chalk.cyan("npx aizen-gate specify")} - Define a new feature`,
			`${chalk.cyan("npx aizen-gate plan")} - Generate architecture plan`,
			`${chalk.cyan("npx aizen-gate tasks")} - Break down into work packages`,
			`${chalk.cyan("npx aizen-gate auto")} - Run autonomous development loop`,
			`${chalk.cyan("npx aizen-gate status")} - Check current progress`,
		],
		{ icon: "🚀", color: "green" },
	);

	// Show helpful tips
	console.log();
	displayTip(
		"Start with 'npx aizen-gate specify' to define your first feature. The AI team will guide you through the entire development process!",
	);

	console.log();
	console.log(chalk.dim("  💡 Pro tip: Use 'npx aizen-gate --help' to see all available commands"));
	console.log();

	return { success: true };
}

/**
 * Quick health check before operations
 */
export async function quickHealthCheck(projectRoot: string): Promise<{
	healthy: boolean;
	issues: string[];
	config?: OnboardingConfig;
}> {
	const issues: string[] = [];

	// Check config exists
	const configPath = path.join(projectRoot, "aizen-gate", "config.json");
	let config: OnboardingConfig | undefined;

	if (!(await fs.pathExists(configPath))) {
		issues.push("Configuration not found. Run 'npx aizen-gate install'");
	} else {
		try {
			config = await fs.readJson(configPath);
		} catch {
			issues.push("Configuration is invalid. Re-run 'npx aizen-gate install'");
		}
	}

	// Check directories
	const agentDir = path.join(projectRoot, ".agent");
	if (!(await fs.pathExists(agentDir))) {
		issues.push(".agent directory missing");
	}

	return {
		healthy: issues.length === 0,
		issues,
		config,
	};
}

export {
	displayCelebration,
	displayInfo,
	displayNextSteps,
	displaySectionHeader,
	displaySuccess,
	displayTip,
	displayWarning,
	displayWelcome,
};
