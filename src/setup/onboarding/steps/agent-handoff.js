const { note, text, cancel, isCancel } = require("@clack/prompts");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("node:path");
const { spawn } = require("child_process");
const { validatePRDReady } = require("./prd-flow");

/**
 * Agent Handoff Step
 * Handles "[AIZEN]" trigger and automated command execution
 */

/**
 * Check if user said "hey [AIZEN] the prd is ready"
 */
async function checkAIZENTrigger(userInput) {
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
async function readPRDForAIZEN(projectRoot) {
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
async function triggerAIZENForSpecify(projectRoot, onboardingData) {
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
async function assignPRDToPM(projectRoot, prdData) {
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
function executeAizenCommand(command, cwd) {
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

module.exports = {
	checkAIZENTrigger,
	readPRDForAIZEN,
	triggerAIZENForSpecify,
	assignPRDToPM,
	executeAizenCommand,
};
