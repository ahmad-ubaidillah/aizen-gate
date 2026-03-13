import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import matter from "gray-matter";

/**
 * archiveTasks: Updates task status and moves them to a timestamped archive folder.
 */
export async function archiveTasks(projectRoot: string): Promise<void> {
	const tasksDir = path.join(projectRoot, "backlog", "tasks");
	const archiveRoot = path.join(tasksDir, "archive");
	const readmePath = path.join(projectRoot, "backlog", "readme.md");

	if (!fs.existsSync(tasksDir)) return;

	const files = await fs.readdir(tasksDir);
	const taskFiles = files.filter((f) => f.endsWith(".md") && !f.includes("archive"));

	if (taskFiles.length === 0) {
		console.log(chalk.gray("[AZ] No tasks found in backlog/tasks/ to archive."));
		return;
	}

	// Generate Timestamp: dd-mm-yyyy_HH-mm
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
	const archiveDir = path.join(archiveRoot, timestamp);

	await fs.ensureDir(archiveDir);

	console.log(chalk.blue(`[AZ] Archiving ${taskFiles.length} task(s) into ${timestamp}...`));

	for (const file of taskFiles) {
		const filePath = path.join(tasksDir, file);
		const content = await fs.readFile(filePath, "utf8");

		const { data, content: body } = matter(content);

		// [AZ] Only archive if status is Done
		if (data.status !== "Done") {
			console.log(chalk.gray(`   - Skipping active task: ${file} (Status: ${data.status})`));
			continue;
		}

		// 1. Update Frontmatter
		data.assignee = ["[AZ] - Aizen Orchestrator"];
		data.updated_date = new Date().toISOString().slice(0, 16).replace("T", " ");

		// 2. Mark Checkboxes in content
		const updatedBody = body.replace(/\[ \]/g, "[x]");

		// 3. Re-stringify
		const updatedContent = matter.stringify(updatedBody, data);

		// 4. Move to Timestamped Archive
		const destPath = path.join(archiveDir, file);
		await fs.writeFile(destPath, updatedContent);
		await fs.remove(filePath);

		console.log(chalk.green(`   ✔ Archived: ${file}`));
	}

	// 5. Update README.md
	if (fs.existsSync(readmePath)) {
		let readmeContent = await fs.readFile(readmePath, "utf8");
		// Update statuses in the table
		readmeContent = readmeContent.replace(/✅ Done/g, `✅ Archived (${timestamp})`);
		readmeContent = readmeContent.replace(/✅ Archived/g, `✅ Archived (${timestamp})`);
		await fs.writeFile(readmePath, readmeContent);
		console.log(chalk.cyan("[AZ] Updated backlog/readme.md with archive timestamp."));
	}

	console.log(chalk.green(`\n[AZ] Workspace optimized. History tracked in archive/${timestamp}.`));
}
