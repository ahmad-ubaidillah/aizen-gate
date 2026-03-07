const fs = require("fs-extra");
const path = require("node:path");
const matter = require("gray-matter");

class WorkPackage {
	constructor(fm, body, filePath) {
		this.id = fm.id || "WP00";
		this.title = fm.title || "";
		this.lane = fm.lane || "planned";
		this.dependencies = fm.dependencies || [];
		this.assignedAgent = fm.assignedAgent || null;
		this.body = body || "";
		this.filePath = filePath;
	}

	static async loadFromFile(filePath) {
		const content = await fs.readFile(filePath, "utf8");
		const { data, content: body } = matter(content);
		return new WorkPackage(data, body, filePath);
	}

	static async loadAllWPs(dir) {
		if (!fs.existsSync(dir)) return [];
		let targetDir = dir;
		const tasksPath = path.join(dir, "tasks");
		if (fs.existsSync(tasksPath) && fs.statSync(tasksPath).isDirectory()) {
			targetDir = tasksPath;
		}

		const files = await fs.readdir(targetDir);
		const wpFiles = files.filter((f) => f.startsWith("WP") && f.endsWith(".md"));
		const wps = [];
		for (const f of wpFiles) {
			wps.push(await WorkPackage.loadFromFile(path.join(targetDir, f)));
		}
		return wps;
	}

	async save() {
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

	async setLane(lane) {
		this.lane = lane;
		await this.save();
	}
}

module.exports = { WorkPackage };
