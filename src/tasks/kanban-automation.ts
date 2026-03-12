import path from "node:path";
import fs from "fs-extra";
import { ManifestGenerator } from "./manifest-generator.js";
import { TaskCLI } from "./task-cli.js";
import { findTaskFile } from "./task-utils.js";

export class KanbanAutomation {
	private projectRoot: string;
	private cli: TaskCLI;
	private manifest: ManifestGenerator;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.cli = new TaskCLI(projectRoot);
		this.manifest = new ManifestGenerator(projectRoot);
	}

	private async moveTask(taskId: string, targetFolder: string): Promise<void> {
		const sourcePath = findTaskFile(this.projectRoot, taskId);
		if (!sourcePath) {
			console.error(`[Kanban] Task ${taskId} not found in any directory.`);
			return;
		}

		const fileName = path.basename(sourcePath);
		const targetPath = path.join(this.projectRoot, targetFolder, fileName);

		if (sourcePath === targetPath) return;

		console.log(`[Kanban] Moving ${taskId} from ${path.dirname(sourcePath)} to ${targetFolder}`);

		await fs.ensureDir(path.join(this.projectRoot, targetFolder));
		await fs.move(sourcePath, targetPath, { overwrite: true });

		// Update manifest if moving to/from dev
		if (targetFolder === "dev" || sourcePath.includes("/dev/")) {
			await this.manifest.updateManifest();
		}

		// Optional: Maintain frontmatter status for compatibility
		await this.cli.edit(taskId, { status: this.getStatusFromFolder(targetFolder) });
	}

	private getStatusFromFolder(folder: string): string {
		switch (folder) {
			case "dev":
				return "In Progress";
			case "test":
				return "Review";
			case "done":
				return "Done";
			default:
				return "Todo";
		}
	}

	async onStart(taskId: string): Promise<void> {
		await this.moveTask(taskId, "dev");
	}

	async onComplete(taskId: string): Promise<void> {
		await this.moveTask(taskId, "test");
	}

	async onMerge(taskId: string): Promise<void> {
		await this.moveTask(taskId, "done");
	}

	async onBlock(taskId: string): Promise<void> {
		// Moving back to backlog or keeping in dev but with blocked status?
		// PRD doesn't specify, we'll keep it in 'backlog' or 'dev' but edit status.
		await this.cli.edit(taskId, { status: "Blocked" });
	}
}
