const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const yaml = require("js-yaml");

class TaskCLI {
	constructor(projectRoot = process.cwd()) {
		this.projectRoot = projectRoot;
		this.tasksDir = path.join(projectRoot, "backlog", "tasks");
		this.boardPath = path.join(projectRoot, "aizen-gate", "shared", "board.md");
		this.configPath = path.join(projectRoot, "backlog", "config.yml");
		fs.ensureDirSync(this.tasksDir);
	}

	getConfig() {
		if (fs.existsSync(this.configPath)) {
			return yaml.load(fs.readFileSync(this.configPath, "utf8"));
		}
		return { statuses: ["Todo", "In Progress", "Done"] };
	}

	getNextAvailableId() {
		const files = fs.readdirSync(this.tasksDir);
		let highest = 0;
		files.forEach((f) => {
			const match = f.match(/aizen-(\d+)/i);
			if (match && parseInt(match[1]) > highest) {
				highest = parseInt(match[1]);
			}
		});
		return `aizen-${String(highest + 1).padStart(3, "0")}`;
	}

	async create(title, options) {
		const id = this.getNextAvailableId();
		const config = this.getConfig();

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

# ${title}

${options.description || "Description goes here."}

## Acceptance Criteria
- [ ] AC1

`;

		// DoD Defaults Injection (Task 8)
		if (!options.noDodDefaults && config.definition_of_done) {
			content += `## Definition of Done\n`;
			config.definition_of_done.forEach((dod) => {
				content += `- [ ] ${dod}\n`;
			});
		}

		const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
		const filePath = path.join(this.tasksDir, `${id} - ${safeTitle}.md`);

		await fs.writeFile(filePath, content);
		console.log(chalk.green(`✔ Created task: ${id}`));

		await this.updateBoard(id, title, frontmatter.status, frontmatter.assignee);
	}

	async list() {
		const files = fs.readdirSync(this.tasksDir).filter((f) => f.endsWith(".md"));
		console.log(chalk.cyan.bold("\n--- 📋 Aizen-Gate Tasks ---\n"));

		files.forEach((f) => {
			const content = fs.readFileSync(path.join(this.tasksDir, f), "utf8");
			const match = content.match(/---\n([\s\S]*?)\n---/);
			if (match) {
				const fm = yaml.load(match[1]);
				const statusColor =
					fm.status === "Done"
						? chalk.green
						: fm.status === "In Progress"
							? chalk.yellow
							: chalk.white;
				console.log(
					`${chalk.bold(fm.id)} [${statusColor(fm.status)}] | Assignee: ${fm.assignee} | ${f.replace(/aizen-\d+ - (.*)\.md/, "$1")}`,
				);
			}
		});
	}

	async edit(id, options) {
		const files = fs.readdirSync(this.tasksDir);
		const targetFile = files.find((f) => f.toLowerCase().includes(id.toLowerCase()));
		if (!targetFile) return console.log(chalk.red(`Task ${id} not found.`));

		const filePath = path.join(this.tasksDir, targetFile);
		let content = fs.readFileSync(filePath, "utf8");
		const match = content.match(/---\n([\s\S]*?)\n---/);

		if (match) {
			const fm = yaml.load(match[1]);
			let changed = false;

			if (options.status) {
				fm.status = options.status;
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

	async updateBoard(id, title, status, assignee) {
		if (!fs.existsSync(this.boardPath)) return;

		let board = fs.readFileSync(this.boardPath, "utf8");
		const rowRegex = new RegExp(`\\|\\s*\\[?\\b${id}\\b\\]?.*?\\|`, "i");
		const newRow = `| [${id}](../../backlog/tasks/) | ${title} | ${assignee} | ${status} |`;

		if (rowRegex.test(board)) {
			board = board.replace(rowRegex, newRow);
		} else if (/(\|.*\|)/.test(board)) {
			board = board.replace(/(\|.*\|\n?)(?!\|)/m, `$1\n${newRow}`);
		} else {
			board += `\n| Task | Assignee | Status |\n|:---|:---|:---|\n${newRow}\n`;
		}
		await fs.writeFile(this.boardPath, board);
	}
}

module.exports = { TaskCLI };
