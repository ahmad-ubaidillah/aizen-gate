import path from "node:path";
import fs from "fs-extra";

export function findTaskFile(projectRoot: string, taskId: string): string | null {
	const folders = ["backlog", "dev", "test", "done"];
	for (const folder of folders) {
		const dir = path.join(projectRoot, folder);
		if (!fs.existsSync(dir)) continue;

		const files = fs.readdirSync(dir);
		const match = files.find(
			(f) => f.toLowerCase().includes(taskId.toLowerCase()) && f.endsWith(".md"),
		);
		if (match) return path.join(dir, match);
	}

	// Check legacy location
	const legacyDir = path.join(projectRoot, "backlog", "tasks");
	if (fs.existsSync(legacyDir)) {
		const files = fs.readdirSync(legacyDir);
		const match = files.find(
			(f) => f.toLowerCase().includes(taskId.toLowerCase()) && f.endsWith(".md"),
		);
		if (match) return path.join(legacyDir, match);
	}

	return null;
}
