import os from "node:os";
import { cancel, confirm, isCancel, note, text } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Installation Directory Step
 * Allows user to choose installation directory (current or custom)
 */
export interface InstallDirectoryResult {
	installDirectory: string;
	isCustomDirectory: boolean;
}

/**
 * Prompt for installation directory
 * Default is current directory, but user can specify custom
 */
export async function selectInstallDirectory(
	defaultDirectory?: string,
): Promise<InstallDirectoryResult | null> {
	const currentDir = defaultDirectory || process.cwd();
	const homeDir = os.homedir();

	// Ask if user wants to use current directory or custom
	const useCustom = await confirm({
		message: `Install Aizen-Gate in current directory (${chalk.yellow(currentDir)})?`,
		initialValue: true,
	});

	if (isCancel(useCustom)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	// If user wants current directory
	if (useCustom) {
		note(`${chalk.cyan("📁 Installation Directory:")} ${chalk.green(currentDir)}`, "Location");

		return {
			installDirectory: currentDir,
			isCustomDirectory: false,
		};
	}

	// User wants to specify custom directory
	const customDir = await text({
		message: "Enter the directory path where you want to install Aizen-Gate:",
		placeholder: "/path/to/your/project",
		validate: (input) => {
			if (!input || input.trim() === "") {
				return "Please enter a valid directory path";
			}
			// Expand ~ to home directory
			const expandedPath = input.replace(/^~/, homeDir);
			// Check if directory exists
			if (!fs.existsSync(expandedPath)) {
				return "Directory does not exist. Please create it first.";
			}
			// Check if it's a directory
			if (!fs.statSync(expandedPath).isDirectory()) {
				return "The path is not a directory. Please enter a valid directory.";
			}
			return undefined;
		},
	});

	if (isCancel(customDir)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	// Expand ~ to home directory
	const expandedPath = (customDir as string).replace(/^~/, homeDir);

	note(`${chalk.cyan("📁 Installation Directory:")} ${chalk.green(expandedPath)}`, "Location");

	return {
		installDirectory: expandedPath,
		isCustomDirectory: true,
	};
}

/**
 * Validate and normalize the installation directory
 */
export async function validateInstallDirectory(dirPath: string): Promise<{
	valid: boolean;
	message?: string;
	normalizedPath?: string;
}> {
	const homeDir = os.homedir();

	// Expand ~ to home directory
	const normalizedPath = dirPath.replace(/^~/, homeDir);

	// Check if directory exists
	if (!fs.existsSync(normalizedPath)) {
		return {
			valid: false,
			message: `Directory does not exist: ${normalizedPath}`,
		};
	}

	// Check if it's a directory
	if (!fs.statSync(normalizedPath).isDirectory()) {
		return {
			valid: false,
			message: `Path is not a directory: ${normalizedPath}`,
		};
	}

	// Check if directory is writable
	try {
		await fs.access(normalizedPath, fs.constants.W_OK);
	} catch {
		return {
			valid: false,
			message: `Directory is not writable: ${normalizedPath}`,
		};
	}

	return {
		valid: true,
		normalizedPath,
	};
}
