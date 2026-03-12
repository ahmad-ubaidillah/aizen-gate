import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import yaml from "js-yaml";
import { ManifestGenerator } from "./manifest-generator.js";

export class TaskCLI {
	public tasksDir: string;
	public boardPath: string;
	private configPath: string;
	private metadata: { timestamp: string; version: string; engine: string };
	private projectRoot: string;
	private manifest: ManifestGenerator;

	constructor(projectRoot: string = process.cwd()) {
		this.projectRoot = projectRoot;
		this.tasksDir = path.join(projectRoot, "kanban", "backlog", "tasks"); // Legacy
		this.boardPath = path.join(projectRoot, "aizen-gate", "shared", "board.md");
		this.configPath = path.join(projectRoot, "kanban", "backlog", "config.yml");
		this.manifest = new ManifestGenerator(projectRoot);
		this.metadata = {
			timestamp: new Date().toISOString(),
			version: "2.2.4",
			engine: "aizen-gate",
		};
	}

	private getActiveDirs(): string[] {
		return ["kanban/backlog", "kanban/dev", "kanban/test", "kanban/done", "kanban/backlog/tasks"];
	}

	private findTaskById(id: string): { path: string; fileName: string } | null {
		for (const dir of this.getActiveDirs()) {
			const absoluteDir = path.join(this.projectRoot, dir);
			if (!fs.existsSync(absoluteDir)) continue;
			const files = fs.readdirSync(absoluteDir);
			const targetFile = files.find((f) => {
				const match = f.match(/^(task-\d+)/i);
				return match && match[1].toLowerCase() === id.toLowerCase();
			});
			if (targetFile) return { path: path.join(absoluteDir, targetFile), fileName: targetFile };
		}
		return null;
	}

	getConfig(): any {
		if (fs.existsSync(this.configPath)) {
			return yaml.load(fs.readFileSync(this.configPath, "utf8"));
		}
		return { statuses: ["Todo", "In Progress", "Done"] };
	}

	getNextAvailableId(): string {
		let highest = 0;
		for (const dir of this.getActiveDirs()) {
			const absoluteDir = path.join(this.projectRoot, dir);
			if (!fs.existsSync(absoluteDir)) continue;
			const files = fs.readdirSync(absoluteDir);
			files.forEach((f) => {
				const match = f.match(/task-(\d+)/i);
				if (match && parseInt(match[1], 10) > highest) {
					highest = parseInt(match[1], 10);
				}
			});
		}
		return `task-${String(highest + 1).padStart(3, "0")}`;
	}

	async create(title: string, options: any): Promise<void> {
		const id = this.getNextAvailableId();
		const config = this.getConfig();
		const date = new Date().toISOString().split("T")[0];
		const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
		const branch = `feature/${id}-${safeTitle}`;

		const frontmatter = {
			id: id.toLowerCase(),
			status: options.status || config.statuses[0],
			priority: options.priority || "medium",
			assignee: options.assignee || "@none",
			labels: options.labels ? options.labels.split(",") : [],
			created: new Date().toISOString(),
		};

		let content = `---
${yaml.dump(frontmatter)}---

# [${id.toUpperCase()}] - ${title}

## 📌 Metadata

- **Created:** ${date}
- **Status:** \`${(options.status || "Todo").toUpperCase()}\`
- **Priority:** \`${(options.priority || "Medium").toUpperCase()}\`
- **Assignee:** ${options.assignee || "@none"}
- **Branch:** \`${branch}\`

---

## 🎯 Scope & Impact

- **In-Scope:** ${options.description || "Direct objectives of this task"}
- **Out-of-Scope:** Not specified
- **Affected Areas:** Not specified
- **Potential Risks:** Not specified

---

## ⚙️ Technical Context

- **Architecture:** Not specified
- **Tech Constraints:** Not specified

---

## 🛠 Tasks (Execution Table)

| ID  | Task Description                        | Priority | Progress |
| :-- | :-------------------------------------- | :------- | :------- |
| 01  | Setup initial structure and boilerplate | \`HIGH\`   | [ ] 0%   |
| 02  | Implement core business logic           | \`HIGH\`   | [ ] 0%   |

---

## ✅ Acceptance Criteria (AC)

1. [ ] Requirement A
2. [ ] Requirement B

## 🧪 Definition of Done (DoD)

`;

		// DoD Defaults Injection
		const dods = config.definition_of_done || [
			"Code builds successfully",
			"Tests pass",
			"Manifest updated",
		];
		dods.forEach((dod: string) => {
			content += `- [ ] ${dod}\n`;
		});

		content += `
---

## 📜 Logs & Evidence History

| Date       | Activity               | Performed By | Reference / Doc Location      |
| :--------- | :--------------------- | :----------- | :---------------------------- |
| ${date} | Task Created           | User         | \`/kanban/backlog/${id}.md\`     |

---

## 🔗 References

- **Related Task:** #None
`;

		const filePath = path.join(this.projectRoot, "kanban", "backlog", `${id} - ${safeTitle}.md`);

		await fs.writeFile(filePath, content);
		console.log(chalk.green(`✔ Created task: ${id}`));

		await this.updateBoard(id, title, frontmatter.status, frontmatter.assignee);
	}

	async list(): Promise<void> {
		console.log(chalk.cyan.bold("\n--- 📋 Aizen-Gate Tasks ---\n"));

		for (const dir of this.getActiveDirs()) {
			const absoluteDir = path.join(this.projectRoot, dir);
			if (!fs.existsSync(absoluteDir)) continue;
			const files = fs.readdirSync(absoluteDir).filter((f) => f.endsWith(".md"));

			files.forEach((f) => {
				const content = fs.readFileSync(path.join(absoluteDir, f), "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);
				if (match) {
					const fm = yaml.load(match[1]) as any;
					const statusColor =
						fm.status === "Done"
							? chalk.green
							: fm.status === "In Progress"
								? chalk.yellow
								: chalk.white;
					console.log(
						`${chalk.bold(fm.id)} [${statusColor(fm.status)}] | ${chalk.gray(dir)} | ${f.replace(/aizen-\d+ - (.*)\.md/, "$1")}`,
					);
				}
			});
		}
	}

	async edit(id: string, options: any): Promise<void> {
		const task = this.findTaskById(id);
		if (!task) return console.log(chalk.red(`Task ${id} not found.`));

		let filePath = task.path;
		let content = fs.readFileSync(filePath, "utf8");
		const match = content.match(/---\n([\s\S]*?)\n---/);

		if (match) {
			const fm = yaml.load(match[1]) as any;
			let changed = false;

			if (options.status) {
				fm.status = options.status;
				const targetFolder = this.getFolderFromStatus(options.status);
				const fileName = path.basename(filePath);
				const targetPath = path.join(this.projectRoot, "kanban", targetFolder, fileName);

				if (filePath !== targetPath) {
					await fs.ensureDir(path.join(this.projectRoot, "kanban", targetFolder));
					await fs.move(filePath, targetPath, { overwrite: true });
					console.log(chalk.blue(`[Kanban] Moved task to kanban/${targetFolder}/`));
					filePath = targetPath; // Update track for nested edits

					// Update manifest if moving to/from dev
					if (targetFolder === "dev" || filePath.includes("/kanban/dev/")) {
						await this.manifest.updateManifest();
					}
				}
				changed = true;
			}
			if (options.priority) {
				fm.priority = options.priority;
				changed = true;
			}
			if (options.assignee) {
				fm.assignee = options.assignee;
				changed = true;
			}

			if (changed) {
				content = content.replace(match[0], `---\n${yaml.dump(fm)}---`);
				await fs.writeFile(filePath, content);
				console.log(chalk.green(`✔ Updated task ${id}`));

				// Extract title from h1
				const titleMatch = content.match(/# (.*)/);
				const title = titleMatch ? titleMatch[1] : id;
				await this.updateBoard(id, title, fm.status, fm.assignee);
			} else {
				console.log(chalk.gray("No changes specified."));
			}
		}
	}

	async updateBoard(id: string, title: string, status: string, assignee: string): Promise<void> {
		if (!fs.existsSync(this.boardPath)) return;

		let board = fs.readFileSync(this.boardPath, "utf8");
		const rowRegex = new RegExp(`\\|\\s*\\[?\\b${id}\\b\\]?.*?\\|`, "i");
		const newRow = `| [${id}](../../kanban/backlog/tasks/) | ${title} | ${assignee} | ${status} |`;

		if (rowRegex.test(board)) {
			board = board.replace(rowRegex, newRow);
		} else if (/(\|.*\|)/.test(board)) {
			board = board.replace(/(\|.*\|\n?)(?!\|)/m, `$1\n${newRow}`);
		} else {
			board += `\n| Task | Assignee | Status |\n|:---|:---|:---|\n${newRow}\n`;
		}
	}

	private getFolderFromStatus(status: string): string {
		switch (status.toLowerCase()) {
			case "in progress":
				return "dev";
			case "review":
				return "test";
			case "done":
				return "done";
			default:
				return "backlog";
		}
	}
}
