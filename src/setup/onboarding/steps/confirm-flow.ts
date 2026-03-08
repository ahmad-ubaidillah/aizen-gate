import { note } from "@clack/prompts";
import chalk from "chalk";

/**
 * Confirmation Flow - BMad V6 Style
 * Clean and simple
 */

/**
 * Show next steps - clean and simple
 */
export async function showTaskCreationProgress(): Promise<void> {
	note(
		chalk.white("Next:\n") +
			chalk.gray("1. ") +
			chalk.white("npx aizen-gate start") +
			chalk.gray(" - Create tasks\n") +
			chalk.gray("2. ") +
			chalk.white("npx aizen-gate tasks") +
			chalk.gray(" - View work packages"),
		"Next Steps",
	);
}

/**
 * Get next command
 */
export function getNextCommand(_state: string): string {
	return "npx aizen-gate start";
}
