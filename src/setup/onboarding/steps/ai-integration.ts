import { cancel, isCancel, multiselect, note } from "@clack/prompts";
import chalk from "chalk";
import { AI_TOOL_OPTIONS } from "../config/options.js";

/**
 * AI Tool Integration Step
 * Allows user to select which AI coding tools to integrate with
 */
export interface AIIntegrationResult {
	selectedTools: string[];
	toolLabels: Record<string, string>;
}

/**
 * Prompt for AI tool selection (multi-select)
 */
export async function selectAIIntegration(): Promise<AIIntegrationResult | null> {
	const toolOptions = AI_TOOL_OPTIONS.map((tool: any) => ({
		value: tool.value,
		label: tool.label,
	}));

	const selected = await multiselect({
		message: "Which AI coding tools would you like to integrate with?",
		options: toolOptions,
		required: false,
	});

	if (isCancel(selected)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	// Create labels mapping
	const toolLabels: Record<string, string> = {};
	AI_TOOL_OPTIONS.forEach((tool: any) => {
		toolLabels[tool.value] = tool.label;
	});

	const selectedTools = selected as string[];

	// Show summary
	if (selectedTools.length > 0) {
		const toolList = selectedTools.map((t) => `  ${chalk.green("✓")} ${toolLabels[t]}`).join("\n");
		note(`${chalk.cyan("🤖 Integrated AI Tools:")}\n${toolList}`, "AI Integration");
	} else {
		note(
			`${chalk.yellow("⚠️ No AI tools selected")}\n${chalk.dim("You can integrate more tools later with: npx aizen-gate config")}`,
			"AI Integration",
		);
	}

	return {
		selectedTools,
		toolLabels,
	};
}

/**
 * Check if a specific AI tool is integrated
 */
export function isToolIntegrated(tools: string[], toolValue: string): boolean {
	return tools.includes(toolValue);
}

/**
 * Get all available AI tool values
 */
export function getAllAITools(): string[] {
	return AI_TOOL_OPTIONS.map((tool: any) => tool.value);
}

/**
 * Get tool label by value
 */
export function getToolLabel(value: string): string {
	const tool = AI_TOOL_OPTIONS.find((t: any) => t.value === value);
	return tool?.label || value;
}
