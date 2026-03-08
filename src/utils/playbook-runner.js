const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const matter = require("gray-matter");

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

	let rawContent;
	try {
		rawContent = fs.readFileSync(playbookPath, "utf8");
	} catch (err) {
		console.error(chalk.red(`Error reading playbook: ${err.message}`));
		return;
	}

	let data, content;
	try {
		const parsed = matter(rawContent);
		data = parsed.data;
		content = parsed.content;
	} catch (err) {
		console.error(chalk.red(`Error parsing playbook YAML: ${err.message}`));
		return;
	}

	// Extract overview from frontmatter OR from ## Overview section
	let overview = data.description || "";

	if (!overview) {
		const overviewMatch = content.match(/## Overview\n\n([\s\S]*?)\n\n##/);
		overview = overviewMatch ? overviewMatch[1].trim() : "No overview provided.";
	}

	console.log(chalk.red.bold(`\n⛩️  [Aizen] Launching Playbook: ${chalk.white(cmd)}`));
	if (extraArgs) console.log(chalk.cyan(`   Target: ${chalk.white(extraArgs)}`));
	console.log(chalk.dim(`   Source: ${playbookPath}`));
	console.log(chalk.yellow(`\nOverview:\n${chalk.white(overview)}\n`));
	console.log(
		chalk.magenta.bold`   >> SIGNAL SENT TO AGENT:` +
			chalk.gray(` "Read ${playbookPath} and execute${extraArgs ? " for " + extraArgs : ""}."`),
	);
	console.log("");
}

module.exports = { runPlaybook };
