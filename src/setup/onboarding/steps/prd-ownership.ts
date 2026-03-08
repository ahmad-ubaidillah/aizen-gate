import path from "node:path";
import { cancel, confirm, isCancel, note, select } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * PRD Ownership Step
 * Asks if user already has a PRD document
 */
export interface PRDOwnershipResult {
	hasPRD: boolean;
	prdPath?: string;
	brainstormingPath?: string;
	prdExists?: boolean;
	userActionRequired?: string;
}

/**
 * Prompt for PRD ownership
 */
export async function selectPRDOwnership(projectRoot: string): Promise<PRDOwnershipResult | null> {
	const hasPRD = await select({
		message: "Do you already have a Product Requirements Document (PRD)?",
		options: [
			{
				label: "✅ Yes, I have a feature plan (PRD)",
				value: "yes",
				description: "I already have a document describing my project",
			},
			{
				label: "❌ No, I need help creating one",
				value: "no",
				description: "Let's create one together - perfect for beginners!",
			},
		] as any,
	});

	if (isCancel(hasPRD)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	// If user says YES - they already have a PRD
	if (hasPRD === "yes") {
		note(
			`${chalk.cyan("📋 Great! Please place your PRD at:")}\n` +
				`${chalk.yellow(path.join(projectRoot, "aizen-gate", "PRD", "prd.md"))}\n\n` +
				`${chalk.dim("The file should be named 'prd.md' (lowercase).")}`,
			"Import Your PRD",
		);

		const prdFolderPath = path.join(projectRoot, "aizen-gate", "PRD");
		const prdFilePath = path.join(prdFolderPath, "prd.md");
		const brainstormingPath = path.join(prdFolderPath, "brainstorming.md");

		// Ensure PRD folder exists
		await fs.ensureDir(prdFolderPath);

		// Check if prd.md already exists
		const prdExists = await fs.pathExists(prdFilePath);

		if (prdExists) {
			note(chalk.green("✅ PRD file found!"), "PRD Ready");
			return {
				hasPRD: true,
				prdPath: prdFilePath,
				brainstormingPath,
				prdExists: true,
			};
		}

		// Ask user to create the file
		const shouldCreate = await confirm({
			message: `Would you like to create prd.md now?`,
		});

		if (shouldCreate) {
			note(
				`${chalk.cyan("Please create your PRD file at:")}\n${chalk.yellow(prdFilePath)}\n\n` +
					`Then run: ${chalk.yellow("npx aizen-gate onboarding")}`,
				"Create PRD File",
			);
		}

		return {
			hasPRD: true,
			prdPath: prdFilePath,
			brainstormingPath,
			prdExists: false,
			userActionRequired: shouldCreate ? "create_prd" : "skip",
		};
	}

	// If user says NO - they need help creating one
	note(
		`${chalk.cyan("🎉 Perfect! I'll help you create one.")}\n\n` +
			`AIZEN will guide you through creating a comprehensive feature plan.\n` +
			`You can use the ${chalk.yellow("brainstorming.md")} template or let our PM Agent help you.`,
		"Creating Your PRD",
	);

	const prdFolderPath = path.join(projectRoot, "aizen-gate", "PRD");
	const prdFilePath = path.join(prdFolderPath, "prd.md");
	const brainstormingPath = path.join(prdFolderPath, "brainstorming.md");

	// Ensure PRD folder exists
	await fs.ensureDir(prdFolderPath);

	return {
		hasPRD: false,
		prdPath: prdFilePath,
		brainstormingPath,
		prdExists: false,
	};
}

/**
 * Check if PRD exists at the expected location
 */
export async function checkPRDExists(projectRoot: string): Promise<{
	exists: boolean;
	path: string;
}> {
	const prdPath = path.join(projectRoot, "aizen-gate", "PRD", "prd.md");
	const exists = await fs.pathExists(prdPath);

	return {
		exists,
		path: prdPath,
	};
}
