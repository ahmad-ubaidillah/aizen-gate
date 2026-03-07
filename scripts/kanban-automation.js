const _path = require("node:path");
const { TaskCLI } = require("./task-cli");

class KanbanAutomation {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.cli = new TaskCLI(projectRoot);
	}

	async onStart(taskId) {
		console.log(`[Kanban] Auto-updating ${taskId} to "In Progress"`);
		await this.cli.edit(taskId, { status: "In Progress" });
	}

	async onComplete(taskId) {
		console.log(`[Kanban] Auto-updating ${taskId} to "Review"`);
		await this.cli.edit(taskId, { status: "Review" });
	}

	async onMerge(taskId) {
		console.log(`[Kanban] Auto-updating ${taskId} to "Done"`);
		await this.cli.edit(taskId, { status: "Done" });
	}

	async onBlock(taskId) {
		await this.cli.edit(taskId, { status: "Blocked" });
	}
}

module.exports = { KanbanAutomation };
