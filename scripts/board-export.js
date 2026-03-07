const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

async function exportBoard(projectRoot) {
	const boardPath = path.join(projectRoot, "aizen-gate", "shared", "board.md");
	const exportDir = path.join(projectRoot, "backlog", "exports");

	if (!fs.existsSync(boardPath)) {
		console.log(chalk.red("[Aizen] No board.md found to export."));
		return;
	}

	await fs.ensureDir(exportDir);

	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const exportFile = path.join(exportDir, `board-export-${timestamp}.md`);

	const boardContent = await fs.readFile(boardPath, "utf8");

	// You could do CSV conversion here, but standard markdown export with timestamp is great for versioning snapshots.
	await fs.writeFile(exportFile, boardContent);

	console.log(chalk.green(`✔ Board snapshot exported to: ${exportFile}`));
}

module.exports = { exportBoard };
