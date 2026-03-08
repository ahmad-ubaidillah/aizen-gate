import path from "node:path";
import fs from "fs-extra";
import matter from "gray-matter";

export class WorkPackage {
	public id: string;
	public title: string;
	public lane: string;
	public dependencies: string[];
	public assignedAgent: string | null;
	public body: string;
	public filePath: string;

	constructor(fm: any, body: string, filePath: string) {
		this.id = fm.id || "WP00";
		this.title = fm.title || "";
		this.lane = fm.lane || "planned";
		this.dependencies = fm.dependencies || [];
		this.assignedAgent = fm.assignedAgent || null;
		this.body = body || "";
		this.filePath = filePath;
	}

	static async loadFromFile(filePath: string): Promise<WorkPackage> {
		const content = await fs.readFile(filePath, "utf8");
		const { data, content: body } = matter(content);
		return new WorkPackage(data, body, filePath);
	}

	static async loadAllWPs(dir: string): Promise<WorkPackage[]> {
		if (!fs.existsSync(dir)) return [];
		let targetDir = dir;
		const tasksPath = path.join(dir, "tasks");
		if (fs.existsSync(tasksPath) && fs.statSync(tasksPath).isDirectory()) {
			targetDir = tasksPath;
		}

		const files = await fs.readdir(targetDir);
		const wpFiles = files.filter((f) => f.startsWith("WP") && f.endsWith(".md"));
		const wps: WorkPackage[] = [];
		for (const f of wpFiles) {
			wps.push(await WorkPackage.loadFromFile(path.join(targetDir, f)));
		}
		return wps;
	}

	async save(): Promise<void> {
		const fm = {
			id: this.id,
			title: this.title,
			lane: this.lane,
			dependencies: this.dependencies,
			assignedAgent: this.assignedAgent,
		};
		const content = matter.stringify(this.body, fm);
		await fs.writeFile(this.filePath, content);
	}

	async setLane(lane: string): Promise<void> {
		this.lane = lane;
		await this.save();
	}
}
