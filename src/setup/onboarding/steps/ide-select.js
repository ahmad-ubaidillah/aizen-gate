const { select, note, cancel, isCancel } = require("@clack/prompts");
const chalk = require("chalk");
const { IDE_OPTIONS } = require("../config/options");

/**
 * IDE/CLI Selection Step
 * Prompts user to select their primary development environment
 */
async function selectIDE(projectRoot) {
	const ide = await select({
		message: "What IDE/CLI do you primarily use for development?",
		options: IDE_OPTIONS,
	});

	if (isCancel(ide)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedOption = IDE_OPTIONS.find((opt) => opt.value === ide);

	note(
		`Selected: ${chalk.cyan(selectedOption.label)}\n` +
			`${chalk.dim("AIZEN will optimize context for: " + selectedOption.description)}`,
		"IDE/CLI Selection",
	);

	return {
		ide,
		label: selectedOption.label,
		description: selectedOption.description,
	};
}

module.exports = { selectIDE };
