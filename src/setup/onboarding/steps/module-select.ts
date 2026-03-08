import { cancel, isCancel, note, select } from "@clack/prompts";
import chalk from "chalk";
import { MODULE_OPTIONS } from "../config/options.js";

/**
 * Module Selection Step
 * Allows user to select the development mode/pace
 * Improved UX writing for better understanding
 */
export interface ModuleSelectResult {
	module: string;
	label: string;
	description: string;
	details: string;
}

/**
 * Prompt for module/installation type selection
 */
export async function selectModule(_projectRoot: string): Promise<ModuleSelectResult | null> {
	// Map options to include details in the label for better UX
	const optionsWithDetails = MODULE_OPTIONS.map((opt: any) => ({
		...opt,
		label: `${opt.label}\n   ${chalk.dim(opt.details)}`,
	}));

	const moduleType = await select({
		message: "What would you like to build today?",
		options: optionsWithDetails as any,
	});

	if (isCancel(moduleType)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedOption = MODULE_OPTIONS.find((opt: any) => opt.value === moduleType);

	if (!selectedOption) return null;

	note(
		`${chalk.cyan("🎯 Mode:")} ${selectedOption.label}\n` + `${chalk.dim(selectedOption.details)}`,
		"Development Mode",
	);

	return {
		module: moduleType as string,
		label: selectedOption.label,
		description: selectedOption.description,
		details: selectedOption.details || "",
	};
}

/**
 * Get module description for display
 */
export function getModuleDescription(moduleValue: string): string {
	const option = MODULE_OPTIONS.find((opt) => opt.value === moduleValue);
	return option?.description || "Custom development";
}

/**
 * Map module value to devType for backward compatibility
 */
export function mapModuleToDevType(moduleValue: string): string {
	switch (moduleValue) {
		case "ideation":
			return "fast";
		case "mvp":
			return "medium";
		case "enterprise":
			return "slow";
		default:
			return "medium";
	}
}
