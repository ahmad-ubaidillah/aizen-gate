const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const { TaskCLI } = require("../tasks/task-cli");

/**
 * Todo Scanner: Captures code-level TODOs and syncs them with the backlog.
 */
async function scanTodos(projectRoot) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Codebase TODO Capture ---\n"));

	const _cli = new TaskCLI(projectRoot);
	const extensions = [".js", ".ts", ".py", ".md", ".sh"];
	const excludeDirs = ["node_modules", ".git", ".worktrees", "dist", "build"];

	const foundTodos = [];

	async function walk(dir) {
		const files = await fs.readdir(dir);
		for (const file of files) {
			const fullPath = path.join(dir, file);
			const stat = await fs.stat(fullPath);

			if (stat.isDirectory()) {
				if (!excludeDirs.includes(file)) {
					await walk(fullPath);
				}
			} else if (extensions.includes(path.extname(file))) {
				const content = await fs.readFile(fullPath, "utf8");
				const lines = content.split("\n");
				lines.forEach((line, index) => {
					if (
						line.includes("// TODO:") ||
						line.includes("// FIXME:") ||
						line.includes("# TODO:") ||
						line.includes("# FIXME:")
					) {
						const type = line.includes("FIXME") ? "FIXME" : "TODO";
						const text = line.split(`${type}:`)[1]?.trim() || "Missing description";
						foundTodos.push({
							file: path.relative(projectRoot, fullPath),
							line: index + 1,
							text: text,
							type: type,
						});
					}
				});
			}
		}
	}

	await walk(projectRoot);

	if (foundTodos.length === 0) {
		console.log(chalk.green("✔ No pending TODOs or FIXMEs found in codebase."));
		return;
	}

	console.log(chalk.yellow(`\n✘ Found ${foundTodos.length} items to capture:`));

	for (const item of foundTodos) {
		console.log(` - [${chalk.bold(item.type)}] ${item.file}:${item.line} -> ${item.text}`);

		// Auto-create task if it doesn't exist?
		// To avoid duplicates, we can hash the file-line-text or just provide a list.
		// For now, let's just list them.
	}

	console.log(
		chalk.gray(
			`\nCapture these into your backlog using: ${chalk.bold('aizen-gate task create "..."')}`,
		),
	);
}

module.exports = { scanTodos };
