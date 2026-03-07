const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const yaml = require("js-yaml");

class TaskSearch {
	constructor(projectRoot = process.cwd()) {
		this.tasksDir = path.join(projectRoot, "backlog", "tasks");
		fs.ensureDirSync(this.tasksDir);
	}

	async search(query, options = {}) {
		const files = fs.readdirSync(this.tasksDir).filter((f) => f.endsWith(".md"));
		const results = [];

		files.forEach((f) => {
			const filePath = path.join(this.tasksDir, f);
			const content = fs.readFileSync(filePath, "utf8");
			const match = content.match(/---\n([\s\S]*?)\n---/);

			let score = 0;
			let fm = null;

			if (match) {
				fm = yaml.load(match[1]);
				if (options.status && fm.status !== options.status) return;
				if (options.priority && fm.priority !== options.priority) return;
				if (options.assignee && fm.assignee !== options.assignee) return;

				const textToSearch = (f + " " + content).toLowerCase();
				const searchTerms = query.toLowerCase().split(/\s+/);

				searchTerms.forEach((term) => {
					if (textToSearch.includes(term)) {
						score += Math.max(1, textToSearch.split(term).length - 1);
					}
				});

				if (score > 0) {
					results.push({
						id: fm.id,
						title: f.replace(/aizen-\d+ - (.*)\.md/, "$1"),
						status: fm.status,
						assignee: fm.assignee,
						score: score,
					});
				}
			}
		});

		return results.sort((a, b) => b.score - a.score);
	}

	async display(query, options) {
		const results = await this.search(query, options);

		console.log(chalk.cyan.bold(`\n--- 🔍 Task Search: "${query}" ---\n`));

		if (results.length === 0) {
			console.log(chalk.gray("No tasks match your criteria."));
			return;
		}

		results.forEach((r) => {
			const color = r.status === "Done" ? chalk.green : chalk.yellow;
			console.log(
				`${chalk.bold(r.id)} [${color(r.status)}] | ${color(r.title)} | @${r.assignee} (Score: ${r.score})`,
			);
		});
		console.log("");
	}
}

module.exports = { TaskSearch };
