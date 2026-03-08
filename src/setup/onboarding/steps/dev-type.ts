import { cancel, isCancel, note, select } from "@clack/prompts";
import chalk from "chalk";
import { DEV_TYPE_OPTIONS } from "../config/options.js";

/**
 * Development Type Selection Step
 * Prompts user to select their development pace
 */
export async function selectDevType(_projectRoot: string): Promise<any> {
	// Map options to include details in the label
	const optionsWithDetails = DEV_TYPE_OPTIONS.map((opt: any) => ({
		...opt,
		label: `${opt.label}\n   ${chalk.dim(opt.details)}`,
	}));

	const devType = await select({
		message: "What development pace suits your project?",
		options: optionsWithDetails as any,
	});

	if (isCancel(devType)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedOption = DEV_TYPE_OPTIONS.find((opt: any) => opt.value === devType);

	if (!selectedOption) return null;

	note(
		`${chalk.cyan("Development Mode:")} ${selectedOption.label}\n` +
			`${chalk.dim(selectedOption.details)}`,
		"Development Type",
	);

	return {
		devType,
		label: selectedOption.label,
		description: selectedOption.description,
		details: selectedOption.details,
	};
}
