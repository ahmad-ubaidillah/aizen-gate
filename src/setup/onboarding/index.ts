import os from "node:os";
import path from "node:path";
import { cancel, confirm, intro, isCancel, note, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { DEV_TYPE_OPTIONS, IDE_OPTIONS, LANGUAGE_OPTIONS } from "./config/options.js";
import { checkAIZENTrigger, triggerAIZENForSpecify } from "./steps/agent-handoff.js";
import { handlePRDFlow, validatePRDReady } from "./steps/prd-flow.js";

/**
 * Entry point for onboarding
 * Runs the enhanced 7-question onboarding flow
 */
export async function runOnboarding(args: {
	comprehensive?: boolean;
	projectRoot?: string;
}): Promise<void> {
	const projectRoot = args.projectRoot || process.cwd();
	await runEnhancedOnboarding(projectRoot);
}

/**
 * Enhanced Onboarding - 7 Questions
 * Phase 2: Complete onboarding with all 7 required questions
 */
export async function runEnhancedOnboarding(projectRoot: string): Promise<void> {
	// Welcome
	intro(chalk.bgCyan.black.bold(" ⛩️  AIZEN-GATE EVOLUTION v2.3  "));

	note(
		chalk.white("Welcome, Agent. Your workspace is being upgraded to the ") +
			chalk.cyan.bold("Elite Swarm Architecture.") +
			"\n\n" +
			chalk.gray("Follow this briefing to align your project with Aizen protocols."),
		"Mission Briefing",
	);

	// ========== QUESTION 1: Aizen Name ==========
	const aizenName = await text({
		message: "What should I call you?",
		placeholder: "your name",
		initialValue: "user",
	});

	if (isCancel(aizenName)) {
		cancel("Onboarding cancelled.");
		return;
	}

	const finalAizenName = (aizenName as string).trim() || "user";
	note(`${chalk.cyan("👤 I'll call you:")} ${chalk.green(finalAizenName)}`, "Name");

	// ========== QUESTION 2: Chat Language ==========
	const chatLanguage = await select({
		message: "What language do you want to chat in?",
		options: LANGUAGE_OPTIONS as any,
		initialValue: "en",
	});

	if (isCancel(chatLanguage)) {
		cancel("Onboarding cancelled.");
		return;
	}

	const selectedChatLang = LANGUAGE_OPTIONS.find((l: any) => l.value === chatLanguage);
	note(
		`${chalk.cyan("🗣️ Chat language:")} ${chalk.green(selectedChatLang?.label || "English")}`,
		"Language",
	);

	// ========== QUESTION 3: Output Language ==========
	const outputLanguageOptions = [
		{ label: `🔄 Same as chat language (${selectedChatLang?.label || "English"})`, value: "same" },
		...LANGUAGE_OPTIONS,
	];

	const outputLanguage = await select({
		message: "What language should I use for output?",
		options: outputLanguageOptions as any,
		initialValue: "same",
	});

	if (isCancel(outputLanguage)) {
		cancel("Onboarding cancelled.");
		return;
	}

	// Resolve "same" to actual language
	const resolvedOutputLang = outputLanguage === "same" ? chatLanguage : outputLanguage;
	const selectedOutputLang = LANGUAGE_OPTIONS.find((l: any) => l.value === resolvedOutputLang);
	note(
		`${chalk.cyan("📄 Output language:")} ${chalk.green(selectedOutputLang?.label || "English")}`,
		"Language",
	);

	// ========== QUESTION 4: Output Path ==========
	const defaultOutputPath = path.join(projectRoot, "aizen-gate", "output");

	const useDefaultPath = await confirm({
		message: `Where should I save output files? (Default: ${chalk.yellow(defaultOutputPath)})`,
		initialValue: true,
	});

	if (isCancel(useDefaultPath)) {
		cancel("Onboarding cancelled.");
		return;
	}

	let outputPath: string;

	if (useDefaultPath) {
		outputPath = defaultOutputPath;
	} else {
		const customPath = await text({
			message: "Enter the directory path for outputs:",
			placeholder: "/path/to/outputs",
			validate: (input) => {
				if (!input || input.trim() === "") {
					return "Please enter a valid directory path";
				}
				const expandedPath = input.replace(/^~/, os.homedir());
				if (!fs.existsSync(expandedPath)) {
					return "Directory does not exist. Please create it first.";
				}
				if (!fs.statSync(expandedPath).isDirectory()) {
					return "The path is not a directory.";
				}
				return undefined;
			},
		});

		if (isCancel(customPath)) {
			cancel("Onboarding cancelled.");
			return;
		}

		outputPath = (customPath as string).replace(/^~/, os.homedir());
	}

	// Ensure output directory exists
	try {
		await fs.ensureDir(outputPath);
	} catch (_error) {
		// Continue even if directory creation fails
	}

	note(`${chalk.cyan("📁 Output path:")} ${chalk.green(outputPath)}`, "Location");

	// ========== QUESTION 5: Project Style ==========
	const projectStyleOptions = DEV_TYPE_OPTIONS.map((opt: any) => ({
		...opt,
		label: `${opt.label}\n   ${chalk.dim(opt.details)}`,
	}));

	const projectStyle = await select({
		message: "Project style: Fast (Prototype) / Medium (MVP) / Slow (Enterprise)",
		options: projectStyleOptions as any,
		initialValue: "medium",
	});

	if (isCancel(projectStyle)) {
		cancel("Onboarding cancelled.");
		return;
	}

	const selectedStyle = DEV_TYPE_OPTIONS.find((opt: any) => opt.value === projectStyle);
	note(
		`${chalk.cyan("🎯 Project style:")} ${selectedStyle?.label}\n${chalk.dim(selectedStyle?.description || "")}`,
		"Style",
	);

	// ========== QUESTION 6: IDE Selection ==========
	const ide = await select({
		message: "Which IDE should I integrate with?",
		options: IDE_OPTIONS as any,
		initialValue: "cursor",
	});

	if (isCancel(ide)) {
		cancel("Onboarding cancelled.");
		return;
	}

	const selectedIDE = IDE_OPTIONS.find((opt: any) => opt.value === ide);
	note(`${chalk.cyan("🖥️ IDE:")} ${chalk.green(selectedIDE?.label || ide)}`, "IDE");

	// ========== QUESTION 7: PRD Ownership ==========
	const hasPRD = await select({
		message: "Do you already have a PRD?",
		options: [
			{
				label: "✅ Yes, load from prd/prd.md",
				value: "yes",
				description: "Load existing PRD document",
			},
			{ label: "❌ No, create new", value: "no", description: "Start with a template" },
		] as any,
		initialValue: "no",
	});

	if (isCancel(hasPRD)) {
		cancel("Onboarding cancelled.");
		return;
	}

	const hasPRDValue = hasPRD === "yes";
	note(
		`${chalk.cyan("📋 PRD status:")} ${hasPRDValue ? chalk.green("Yes, I have a PRD") : chalk.yellow("No, create new")}`,
		"PRD",
	);

	// ========== Handle PRD Flow ==========
	let prdData: any = {
		prdPath: path.join(projectRoot, "aizen-gate", "PRD", "prd.md"),
		brainstormingPath: path.join(projectRoot, "aizen-gate", "PRD", "brainstorming.md"),
		prdExists: false,
		hasPRD: hasPRDValue,
	};

	if (hasPRDValue) {
		// Load existing PRD
		const prdPath = path.join(projectRoot, "aizen-gate", "PRD", "prd.md");
		const prdExists = await fs.pathExists(prdPath);
		if (prdExists) {
			prdData = {
				...prdData,
				prdPath,
				prdExists: true,
			};
			note(chalk.green("✅ PRD found!"), "PRD Ready");
		} else {
			note(
				chalk.yellow("⚠️ PRD not found at: ") +
					prdPath +
					"\n" +
					chalk.gray("Please create it or choose 'No' to create new."),
				"PRD Not Found",
			);
		}
	} else {
		// Create new PRD using handlePRDFlow
		const newPRDResult = await handlePRDFlow(projectRoot);
		if (newPRDResult) {
			prdData = { ...prdData, ...newPRDResult };
		}
	}

	// ========== Save Configuration ==========
	const onboardingData = {
		aizenName: finalAizenName,
		chatLanguage: chatLanguage as string,
		outputLanguage: resolvedOutputLang,
		outputPath,
		projectStyle: projectStyle as string,
		ide: ide as string,
		hasPRD: hasPRDValue,
		prdPath: prdData.prdPath,
		prdExists: prdData.prdExists || false,
		brainstormingPath: prdData.brainstormingPath,
	};

	await saveOnboardingConfig(projectRoot, onboardingData);

	// ========== Show Summary ==========
	note(
		chalk.white.bold("🎉 Setup Complete!\n\n") +
			chalk.gray("─".repeat(40)) +
			"\n\n" +
			chalk.cyan("👤 Your Details") +
			"\n" +
			`   ${chalk.gray("•")} Name: ${chalk.white(finalAizenName)}\n\n` +
			chalk.cyan("🌐 Languages") +
			"\n" +
			`   ${chalk.gray("•")} Chat: ${chalk.white(selectedChatLang?.label || "English")}\n` +
			`   ${chalk.gray("•")} Output: ${chalk.white(selectedOutputLang?.label || "English")}\n\n` +
			chalk.cyan("📁 Settings") +
			"\n" +
			`   ${chalk.gray("•")} Output: ${chalk.white(outputPath)}\n` +
			`   ${chalk.gray("•")} Style: ${chalk.white(selectedStyle?.label || projectStyle)}\n` +
			`   ${chalk.gray("•")} IDE: ${chalk.white(selectedIDE?.label || ide)}\n\n` +
			chalk.cyan("📋 PRD") +
			"\n" +
			`   ${chalk.gray("•")} Status: ${hasPRDValue ? chalk.green("Has PRD") : chalk.yellow("New")}\n` +
			chalk.gray("─".repeat(40)),
		"Summary",
	);

	// ========== Next Steps ==========
	if (!prdData.prdExists && !hasPRDValue) {
		outro(chalk.yellow("📝 Complete your plan, then run: ") + chalk.white("npx aizen-gate start"));
		return;
	}

	if (!prdData.prdExists && hasPRDValue) {
		outro(
			chalk.yellow("📝 Add your plan to: ") +
				chalk.white(prdData.prdPath) +
				"\n" +
				chalk.yellow("Then run: ") +
				chalk.white("npx aizen-gate start"),
		);
		return;
	}

	// Done! Show next steps
	outro(chalk.green.bold("✓ ") + chalk.white("Ready! Run: ") + chalk.cyan("npx aizen-gate start"));
}

/**
 * Save onboarding configuration to file
 */
export async function saveOnboardingConfig(projectRoot: string, data: any): Promise<void> {
	const configPath = path.join(projectRoot, "aizen-gate", "config.json");
	const legacyConfigPath = path.join(projectRoot, "aizen-gate", "onboarding-config.json");

	// Check for legacy config file and migrate
	if ((await fs.pathExists(legacyConfigPath)) && !(await fs.pathExists(configPath))) {
		try {
			const legacyData = await fs.readJson(legacyConfigPath);
			await fs.writeJson(configPath, legacyData, { spaces: 2 });
			console.log(chalk.green("✓ Migrated legacy config to new location"));
			return; // Migration complete, don't overwrite
		} catch {
			// Migration failed, continue with new config
		}
	}

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
	const configPath = path.join(projectRoot, "aizen-gate", "config.json");
	let onboardingData = { projectStyle: "medium", ide: "cursor" };

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
