import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import yaml from "js-yaml";

export class TaskSearch {
	private projectRoot: string;

	constructor(projectRoot: string = process.cwd()) {
		this.projectRoot = projectRoot;
	}

	private getActiveDirs(): string[] {
		return ["kanban/backlog", "kanban/dev", "kanban/test", "kanban/done", "kanban/backlog/tasks"];
	}

	async search(query: string, options: any = {}): Promise<any[]> {
		const results: any[] = [];

		for (const dirName of this.getActiveDirs()) {
			const absDir = path.join(this.projectRoot, dirName);
			if (!fs.existsSync(absDir)) continue;

			const files = fs.readdirSync(absDir).filter((f) => f.endsWith(".md"));
			files.forEach((f) => {
				const filePath = path.join(absDir, f);
				const content = fs.readFileSync(filePath, "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);

				let score = 0;
				let fm: any = null;

				if (match) {
					fm = yaml.load(match[1]);
					if (options.status && fm.status !== options.status) return;
					if (options.priority && fm.priority !== options.priority) return;
					if (options.assignee && fm.assignee !== options.assignee) return;

					const textToSearch = `${f} ${content}`.toLowerCase();
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
		}

		return results.sort((a, b) => b.score - a.score);
	}

	async execute(query: string, options: any = {}): Promise<void> {
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
