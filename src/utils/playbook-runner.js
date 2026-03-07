const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * [AZ] Playbook Runner
 * Shared logic to locate and display playbooks in both local and installed environments.
 */
function runPlaybook(cmd, projectRoot = process.cwd(), extraArgs = null) {
	const findPlaybook = (name) => {
		const localPath = path.join(projectRoot, `commands/az-${name}.md`);
		const installedPath = path.join(projectRoot, `aizen-gate/commands/az-${name}.md`);
		const packagePath = path.join(__dirname, `../../commands/az-${name}.md`);

		if (fs.existsSync(localPath)) return localPath;
		if (fs.existsSync(installedPath)) return installedPath;
		if (fs.existsSync(packagePath)) return packagePath;
		return null;
	};

	const playbookPath = findPlaybook(cmd);
	if (!playbookPath) {
		console.log(chalk.red(`Error: Unknown playbook "${cmd}".`));
		return;
	}

	const content = fs.readFileSync(playbookPath, "utf8");
	const overviewMatch = content.match(/## Overview\n\n([\s\S]*?)\n\n##/);
	const overview = overviewMatch ? overviewMatch[1].trim() : "No overview provided.";

	console.log(chalk.red(`\n--- ⛩️ [Aizen] Launching az-${cmd} Playbook ---\n`));
	if (extraArgs) console.log(chalk.cyan(`Target: ${extraArgs}`));
	console.log(chalk.cyan(`Playbook: ${playbookPath}`));
	console.log(chalk.yellow(`\nOverview:\n${overview}\n`));
	console.log(
		chalk.gray(
			`Invoke agent: "Read ${playbookPath} and execute${extraArgs ? " for " + extraArgs : ""}."`,
		),
	);
}

module.exports = { runPlaybook };
