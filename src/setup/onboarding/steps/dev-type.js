const { select, note, cancel, isCancel } = require("@clack/prompts");
const chalk = require("chalk");
const { DEV_TYPE_OPTIONS } = require("../config/options");

/**
 * Development Type Selection Step
 * Prompts user to select their development pace
 */
async function selectDevType(projectRoot) {
	// Map options to include details in the label
	const optionsWithDetails = DEV_TYPE_OPTIONS.map((opt) => ({
		...opt,
		label: `${opt.label}\n   ${chalk.dim(opt.details)}`,
	}));

	const devType = await select({
		message: "What development pace suits your project?",
		options: optionsWithDetails,
	});

	if (isCancel(devType)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const selectedOption = DEV_TYPE_OPTIONS.find((opt) => opt.value === devType);

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

module.exports = { selectDevType };
