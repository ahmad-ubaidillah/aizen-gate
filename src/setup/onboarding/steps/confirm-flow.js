const { select, note, cancel, isCancel } = require("@clack/prompts");
const chalk = require("chalk");
const { CONFIRM_OPTIONS } = require("../config/options");

/**
 * Confirmation Flow Step
 * Handles user confirmation before proceeding to task creation
 */

/**
 * Display PRD summary and get user confirmation
 */
async function confirmPRD(projectRoot, prdData) {
	// Display summary
	note(
		`${chalk.cyan("PRD Summary:")}\n\n` +
			`📁 Location: ${chalk.yellow(prdData.prdPath)}\n` +
			`📊 Development Mode: ${chalk.yellow(prdData.devType)}\n` +
			`🖥️ IDE: ${chalk.yellow(prdData.ide)}\n` +
			`📝 PRD Exists: ${prdData.prdExists ? chalk.green("Yes") : chalk.red("No")}`,
		"Summary",
	);

	// Get confirmation
	const confirmation = await select({
		message: "Are you ready to continue?",
		options: CONFIRM_OPTIONS,
	});

	if (isCancel(confirmation)) {
		cancel("Onboarding cancelled.");
		return { confirmed: false, action: "cancel" };
	}

	switch (confirmation) {
		case "yes":
			return {
				confirmed: true,
				action: "proceed",
				message: "Proceeding to task creation...",
			};

		case "edit":
			return {
				confirmed: false,
				action: "edit",
				message: "Please edit your PRD at: " + prdData.prdPath,
			};

		case "restart":
			return {
				confirmed: false,
				action: "restart",
				message: "Restarting onboarding...",
			};

		default:
			return { confirmed: false, action: "unknown" };
	}
}

/**
 * Display task creation progress
 */
async function showTaskCreationProgress() {
	note(
		`${chalk.cyan("Creating Atomic Tasks...")}\n\n` +
			`1. ${chalk.yellow("[PM]")} Analyzing PRD\n` +
			`2. ${chalk.yellow("[ARCH]")} Creating architecture blueprint\n` +
			`3. ${chalk.yellow("[AIZEN]")} Breaking down into Work Packages\n\n` +
			`Run: ${chalk.yellow("npx aizen-gate tasks")} to continue`,
		"Next Steps",
	);
}

/**
 * Display the next recommended command based on current state
 */
function getNextCommand(state) {
	const commands = {
		ideSelected: "npx aizen-gate onboarding",
		devTypeSelected: "npx aizen-gate onboarding",
		prdNotReady: "npx aizen-gate idea",
		prdReady: "hey [AIZEN] the prd is ready",
		tasksReady: "npx aizen-gate tasks",
	};

	return commands[state] || "npx aizen-gate status";
}

module.exports = {
	confirmPRD,
	showTaskCreationProgress,
	getNextCommand,
};
