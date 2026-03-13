import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import fs from "fs-extra";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * [AZ] Playbook Runner
 * Shared logic to locate and display playbooks in both local and installed environments.
 */
export function runPlaybook(
	cmd: string,
	projectRoot: string = process.cwd(),
	extraArgs: string | null = null,
) {
	const findPlaybook = (name: string) => {
		const localPath = path.join(projectRoot, `commands/az-${name}.md`);
		const installedPath = path.join(projectRoot, `aizen-gate/commands/az-${name}.md`);
		const packagePath = path.join(__dirname, `../../../commands/az-${name}.md`);

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

	let rawContent: string;
	try {
		rawContent = fs.readFileSync(playbookPath, "utf8");
	} catch (err) {
		console.error(chalk.red(`Error reading playbook: ${(err as Error).message}`));
		return;
	}

	let data: any, content: string;
	try {
		const parsed = matter(rawContent);
		data = parsed.data;
		content = parsed.content;
	} catch (err) {
		console.error(chalk.red(`Error parsing playbook YAML: ${(err as Error).message}`));
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
			chalk.gray(` "Read ${playbookPath} and execute${extraArgs ? ` for ${extraArgs}` : ""}."`),
	);
	console.log("");
}
