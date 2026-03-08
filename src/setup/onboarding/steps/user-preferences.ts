import os from "node:os";
import path from "node:path";
import { cancel, confirm, isCancel, note, select, text } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { LANGUAGE_OPTIONS, PRONOUN_OPTIONS } from "../config/options.js";

/**
 * User Preferences Step
 * Handles user name, pronouns, languages, and output directory
 */
export interface UserPreferencesResult {
	userName: string;
	pronoun: string;
	interactionLanguage: string;
	outputLanguage: string;
	outputDirectory: string;
}

/**
 * Get default output directory based on install directory
 */
function getDefaultOutputDirectory(installDir: string): string {
	return path.join(installDir, "aizen-gate", "output");
}

/**
 * Prompt for user preferences
 */
export async function selectUserPreferences(
	installDirectory: string,
): Promise<UserPreferencesResult | null> {
	// Step 1: User name
	const userName = await text({
		message: "What should Aizen call you?",
		placeholder: "your name",
		initialValue: "user",
	});

	if (isCancel(userName)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const finalUserName = (userName as string).trim() || "user";

	note(`${chalk.cyan("👤 I'll call you:")} ${chalk.green(finalUserName)}`, "Name");

	// Step 2: Pronouns
	const pronoun = await select({
		message: "What pronouns should I use?",
		options: PRONOUN_OPTIONS as any,
		initialValue: "you",
	});

	if (isCancel(pronoun)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedPronoun = PRONOUN_OPTIONS.find((p: any) => p.value === pronoun);
	note(
		`${chalk.cyan("📖 Pronouns:")} ${chalk.green(selectedPronoun?.label || "You/Your")}`,
		"Pronouns",
	);

	// Step 3: Interaction Language
	const interactionLanguage = await select({
		message: "What language should Aizen use when talking to you?",
		options: LANGUAGE_OPTIONS as any,
		initialValue: "en",
	});

	if (isCancel(interactionLanguage)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedInteractionLang = LANGUAGE_OPTIONS.find(
		(l: any) => l.value === interactionLanguage,
	);
	note(
		`${chalk.cyan("🗣️ Interaction Language:")} ${chalk.green(selectedInteractionLang?.label || "English")}`,
		"Language",
	);

	// Step 4: Output Language
	const outputLanguage = await select({
		message: "What language should Aizen use for output files?",
		options: LANGUAGE_OPTIONS as any,
		initialValue: "en",
	});

	if (isCancel(outputLanguage)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedOutputLang = LANGUAGE_OPTIONS.find((l: any) => l.value === outputLanguage);
	note(
		`${chalk.cyan("📄 Output Language:")} ${chalk.green(selectedOutputLang?.label || "English")}`,
		"Language",
	);

	// Step 5: Output Directory
	const defaultOutputDir = getDefaultOutputDirectory(installDirectory);

	const useCustomOutput = await confirm({
		message: `Save outputs to ${chalk.yellow(defaultOutputDir)}?`,
		initialValue: true,
	});

	if (isCancel(useCustomOutput)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	let outputDirectory: string;

	if (useCustomOutput) {
		outputDirectory = defaultOutputDir;
	} else {
		const customOutputDir = await text({
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

		if (isCancel(customOutputDir)) {
			cancel("Onboarding cancelled.");
			return null;
		}

		outputDirectory = (customOutputDir as string).replace(/^~/, os.homedir());
	}

	note(`${chalk.cyan("📁 Output Directory:")} ${chalk.green(outputDirectory)}`, "Location");

	// Summary
	note(
		`${chalk.white("Summary:")}\n` +
			`  ${chalk.gray("•")} ${chalk.cyan("Name:")} ${chalk.white(finalUserName)}\n` +
			`  ${chalk.gray("•")} ${chalk.cyan("Pronouns:")} ${chalk.white(selectedPronoun?.description || "You/Your")}\n` +
			`  ${chalk.gray("•")} ${chalk.cyan("Talk to me in:")} ${chalk.white(selectedInteractionLang?.label || "English")}\n` +
			`  ${chalk.gray("•")} ${chalk.cyan("Output files in:")} ${chalk.white(selectedOutputLang?.label || "English")}\n` +
			`  ${chalk.gray("•")} ${chalk.cyan("Save outputs to:")} ${chalk.white(outputDirectory)}`,
		"Preferences",
	);

	return {
		userName: finalUserName,
		pronoun: pronoun as string,
		interactionLanguage: interactionLanguage as string,
		outputLanguage: outputLanguage as string,
		outputDirectory,
	};
}

/**
 * Get language label by value
 */
export function getLanguageLabel(value: string): string {
	const lang = LANGUAGE_OPTIONS.find((l: any) => l.value === value);
	return lang?.label || value;
}

/**
 * Get pronoun label by value
 */
export function getPronounLabel(value: string): string {
	const pronoun = PRONOUN_OPTIONS.find((p: any) => p.value === value);
	return pronoun?.label || value;
}
