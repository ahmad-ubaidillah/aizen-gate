import { TaskCLI } from "./task-cli.js";

export class KanbanAutomation {
	private cli: TaskCLI;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.cli = new TaskCLI(projectRoot);
	}

	async onStart(taskId: string): Promise<void> {
		console.log(`[Kanban] Auto-updating ${taskId} to "In Progress"`);
		await this.cli.edit(taskId, { status: "In Progress" });
	}

	async onComplete(taskId: string): Promise<void> {
		console.log(`[Kanban] Auto-updating ${taskId} to "Review"`);
		await this.cli.edit(taskId, { status: "Review" });
	}

	async onMerge(taskId: string): Promise<void> {
		console.log(`[Kanban] Auto-updating ${taskId} to "Done"`);
		await this.cli.edit(taskId, { status: "Done" });
	}

	async onBlock(taskId: string): Promise<void> {
		await this.cli.edit(taskId, { status: "Blocked" });
	}
}
