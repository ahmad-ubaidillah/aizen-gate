import { spawn } from "node:child_process";
import path from "node:path";
import { note } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { validatePRDReady } from "./prd-flow.js";

/**
 * Agent Handoff Step
 * Handles "[AIZEN]" trigger and automated command execution
 */

/**
 * Check if user said "hey [AIZEN] the prd is ready"
 */
export async function checkAIZENTrigger(userInput: string): Promise<any> {
	const triggerPhrase = "hey [aizen]";
	const triggerFull = "hey [aizen] the prd is ready";

	const normalizedInput = userInput.toLowerCase().trim();

	return {
		isTrigger: normalizedInput.includes(triggerPhrase),
		isFullTrigger: normalizedInput === triggerFull,
	};
}

/**
 * Read PRD content for AIZEN to process
 */
export async function readPRDForAIZEN(projectRoot: string): Promise<any> {
	const validation = await validatePRDReady(projectRoot);

	if (!validation.ready) {
		return {
			success: false,
			message: validation.message,
		};
	}

	const prdContent = await fs.readFile(validation.prdPath, "utf-8");

	return {
		success: true,
		prdPath: validation.prdPath,
		content: prdContent,
	};
}

/**
 * Trigger AIZEN to run specify command
 * This simulates: "hey [AIZEN] the prd is ready"
 */
export async function triggerAIZENForSpecify(
	projectRoot: string,
	onboardingData: any,
): Promise<any> {
	note(
		`${chalk.cyan("[AIZEN] Processing PRD...")}\n\n` +
			`Reading: ${chalk.yellow(path.join(projectRoot, "aizen-gate/PRD/prd.md"))}\n` +
			`IDE: ${chalk.yellow(onboardingData.ide)}\n` +
			`Dev Mode: ${chalk.yellow(onboardingData.devType)}\n\n` +
			`→ Running: ${chalk.yellow("npx aizen-gate specify")}`,
		"AIZEN Handoff",
	);

	// This would trigger the specify command with PRD context
	// For now, we guide the user to run it
	return {
		ready: true,
		nextCommand: "npx aizen-gate specify",
		message: "The PM Agent will now create your spec.md based on the PRD.",
	};
}

/**
 * Simulate AIZEN assigning PRD to PM agent
 */
export async function assignPRDToPM(_projectRoot: string, prdData: any): Promise<any> {
	note(
		`${chalk.cyan("[AIZEN] Assigning PRD to [PM] Agent...")}\n\n` +
			`${chalk.yellow("PRD Analysis:")}\n` +
			`- Location: ${prdData.prdPath}\n` +
			`- Development Type: ${prdData.devType}\n` +
			`- IDE: ${prdData.ide}\n\n` +
			`${chalk.yellow("Next Action:")}\n` +
			`[PM] will analyze the PRD and create spec.md with:\n` +
			`• Executive Summary\n` +
			`• User Stories\n` +
			`• Functional Requirements\n` +
			`• Acceptance Criteria\n\n` +
			`Run: ${chalk.yellow("npx aizen-gate specify")}`,
		"PM Agent Assignment",
	);

	return {
		assigned: true,
		agent: "[PM]",
		nextStep: "specify",
	};
}

/**
 * Execute aizen-gate command programmatically
 */
export function executeAizenCommand(command: string, cwd: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const args = command.replace("npx aizen-gate ", "").split(" ");
		const child = spawn("npx", ["aizen-gate", ...args], {
			cwd,
			stdio: "inherit",
		});

		child.on("close", (code) => {
			if (code === 0) {
				resolve({ success: true, code });
			} else {
				reject(new Error(`Command failed with code ${code}`));
			}
		});

		child.on("error", reject);
	});
}
