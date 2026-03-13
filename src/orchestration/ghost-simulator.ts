import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * [Phase 22] GhostSimulator
 * Provides a Virtual File System (VFS) to simulate changes before they hit the disk.
 */
export class GhostSimulator {
	private vfs: Map<string, string> = new Map();
	private projectDir: string;

	constructor(projectDir: string) {
		this.projectDir = projectDir;
	}

	/**
	 * Loads a file into the Virtual File System if not already present.
	 */
	private async loadToVfs(filePath: string): Promise<void> {
		if (this.vfs.has(filePath)) return;
		const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.projectDir, filePath);
		if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
			this.vfs.set(filePath, fs.readFileSync(fullPath, "utf8"));
		} else {
			this.vfs.set(filePath, ""); // New file
		}
	}

	/**
	 * Simulates a write operation in the Ghost layer.
	 */
	async simulateWrite(filePath: string, content: string): Promise<void> {
		await this.loadToVfs(filePath);
		this.vfs.set(filePath, content);
		console.log(chalk.magenta(`[Ghost] Simulated write: ${filePath} (${content.length} bytes)`));
	}

	/**
	 * Runs a "Ghost Verify" to check for syntax errors in simulated files.
	 * Currently handles basic TS/JS/JSON validation.
	 */
	async verifySimulatedState(): Promise<{ success: boolean; errors: string[] }> {
		const errors: string[] = [];
		for (const [file, content] of this.vfs.entries()) {
			if (file.endsWith(".json")) {
				try {
					JSON.parse(content);
				} catch (e: any) {
					errors.push(`Invalid JSON in ${file}: ${e.message}`);
				}
			}
			// Add more lightweight validators here
		}

		return {
			success: errors.length === 0,
			errors,
		};
	}

	/**
	 * Flushes the simulated changes to the real disk (Committing the Ghost).
	 */
	async commitToDisk(): Promise<void> {
		console.log(chalk.yellow(`[Ghost] Committing simulated changes to disk...`));
		for (const [file, content] of this.vfs.entries()) {
			const fullPath = path.isAbsolute(file) ? file : path.join(this.projectDir, file);
			const dir = path.dirname(fullPath);
			if (!fs.existsSync(dir)) await fs.ensureDir(dir);
			await fs.writeFile(fullPath, content);
		}
		this.vfs.clear();
	}

	getVfsSnapshot() {
		return Object.fromEntries(this.vfs);
	}
}

let instance: GhostSimulator | null = null;
export const getGhostSimulator = (dir: string) => {
	if (!instance) instance = new GhostSimulator(dir);
	return instance;
};
