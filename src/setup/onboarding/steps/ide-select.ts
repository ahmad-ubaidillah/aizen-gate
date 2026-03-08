import { cancel, isCancel, note, select } from "@clack/prompts";
import chalk from "chalk";
import { IDE_OPTIONS } from "../config/options.js";

/**
 * IDE/CLI Selection Step
 * Prompts user to select their primary development environment
 */
export async function selectIDE(_projectRoot: string): Promise<any> {
	const ide = await select({
		message: "What IDE/CLI do you primarily use for development?",
		options: IDE_OPTIONS as any,
	});

	if (isCancel(ide)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedOption = IDE_OPTIONS.find((opt: any) => opt.value === ide);

	if (!selectedOption) return null;

	note(
		`Selected: ${chalk.cyan(selectedOption.label)}\n` +
			`${chalk.dim(`AIZEN will optimize context for: ${selectedOption.description}`)}`,
		"IDE/CLI Selection",
	);

	return {
		ide,
		label: selectedOption.label,
		description: selectedOption.description,
	};
}
