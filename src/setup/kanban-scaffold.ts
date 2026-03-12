import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

export class KanbanScaffolder {
	private projectRoot: string;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
	}

	async scaffold(): Promise<void> {
		const dirs = ["backlog", "dev", "test", "done", "aizen-gate/shared"];

		console.log(chalk.cyan(`[Kanban] Initializing directory structure...`));
		for (const dir of dirs) {
			const absDir = path.join(this.projectRoot, dir);
			if (!fs.existsSync(absDir)) {
				fs.ensureDirSync(absDir);
				console.log(chalk.gray(`  ✔ Created ${dir}`));
			}
		}

		// Create PROJECT_CONSTITUTION.md if it doesn't exist
		const constitutionPath = path.join(this.projectRoot, "PROJECT_CONSTITUTION.md");
		if (!fs.existsSync(constitutionPath)) {
			const content =
				`# 📜 PROJECT CONSTITUTION: ${path.basename(this.projectRoot)}\n\n` +
				`## AI-Agent Guidelines\n` +
				`- Always check \`CURRENT_SPRINT.md\` before starting work.\n` +
				`- Keep atomic commits mapped to Task IDs.\n` +
				`- Follow the "Physical State Mapping" protocol.\n\n` +
				`## Tech Stack\n` +
				`- Primary: Node.js / TypeScript\n\n` +
				`## Quality Standards\n` +
				`- 100% test coverage for core logic.\n`;
			fs.writeFileSync(constitutionPath, content);
			console.log(chalk.gray(`  ✔ Created PROJECT_CONSTITUTION.md`));
		}

		console.log(
			chalk.green(`[Kanban] Scaffolding complete. Aizen-Gate is now aligned with Kanban-Agent.`),
		);
	}
}
