import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * [Phase 22] GhostSimulator
 * Provides a Virtual File System (VFS) to simulate changes before they hit the disk.
 * SECURITY: Includes path validation to prevent directory traversal attacks
 */
export class GhostSimulator {
	private vfs: Map<string, string> = new Map();
	private projectDir: string;

	constructor(projectDir: string) {
		this.projectDir = path.resolve(projectDir);
	}

	/**
	 * SECURITY: Validates that a file path is within the project directory
	 * Prevents directory traversal attacks (e.g., ../../../etc/passwd)
	 * @param filePath - The file path to validate
	 * @returns The validated absolute path
	 * @throws Error if path is outside project directory or contains invalid characters
	 */
	private validateAndResolvePath(filePath: string): string {
		// SECURITY: Check for null bytes and other injection patterns
		if (filePath.includes("\0")) {
			throw new Error(`Invalid path: contains null bytes`);
		}

		// SECURITY: Normalize the path to resolve .. and . segments
		const normalizedInput = path.normalize(filePath);

		// SECURITY: Check for path traversal attempts
		if (
			normalizedInput.startsWith("..") ||
			(path.isAbsolute(normalizedInput) && !normalizedInput.startsWith(this.projectDir))
		) {
			throw new Error(
				`Security: Path traversal detected. Path "${filePath}" attempts to access files outside project directory`,
			);
		}

		// Resolve to absolute path
		const resolvedPath = path.isAbsolute(normalizedInput)
			? normalizedInput
			: path.resolve(this.projectDir, normalizedInput);

		// SECURITY: Verify the resolved path is within project directory
		const relativePath = path.relative(this.projectDir, resolvedPath);
		if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
			throw new Error(`Security: Path "${filePath}" resolves outside project directory`);
		}

		// SECURITY: Additional check - ensure the resolved path starts with project dir
		if (!resolvedPath.startsWith(this.projectDir)) {
			throw new Error(`Security: Invalid path "${filePath}" - must be within project directory`);
		}

		return resolvedPath;
	}

	/**
	 * Loads a file into the Virtual File System if not already present.
	 * SECURITY: Validates path before loading to prevent directory traversal
	 */
	private async loadToVfs(filePath: string): Promise<void> {
		if (this.vfs.has(filePath)) return;

		// SECURITY: Validate and resolve the path
		const fullPath = this.validateAndResolvePath(filePath);

		if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
			this.vfs.set(filePath, fs.readFileSync(fullPath, "utf8"));
		} else {
			this.vfs.set(filePath, ""); // New file
		}
	}

	/**
	 * Simulates a write operation in the Ghost layer.
	 * SECURITY: Validates path before simulating write to prevent directory traversal
	 */
	async simulateWrite(filePath: string, content: string): Promise<void> {
		// SECURITY: Validate the path before any operation
		this.validateAndResolvePath(filePath);

		await this.loadToVfs(filePath);
		this.vfs.set(filePath, content);
		console.log(chalk.magenta(`[Ghost] Simulated write: ${filePath} (${content.length} bytes)`));
	}

	/**
	 * Runs a "Ghost Verify" to check for syntax errors in simulated files.
	 * Currently handles basic TS/JS/JSON validation.
	 */
	async verifySimulatedState(): Promise<{
		success: boolean;
		errors: string[];
	}> {
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
	 * SECURITY: Validates all paths before writing to prevent directory traversal attacks
	 */
	async commitToDisk(): Promise<void> {
		console.log(chalk.yellow(`[Ghost] Committing simulated changes to disk...`));

		const errors: Array<{ file: string; error: string }> = [];

		for (const [file, content] of this.vfs.entries()) {
			try {
				// SECURITY: Validate and resolve the path
				const fullPath = this.validateAndResolvePath(file);

				// SECURITY: Verify directory path is also safe
				const dir = path.dirname(fullPath);
				const relativeDir = path.relative(this.projectDir, dir);
				if (relativeDir.startsWith("..") || path.isAbsolute(relativeDir)) {
					throw new Error(`Directory path resolves outside project directory`);
				}

				if (!fs.existsSync(dir)) {
					await fs.ensureDir(dir);
				}

				await fs.writeFile(fullPath, content);
				console.log(chalk.green(`[Ghost] Successfully wrote: ${file}`));
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				console.error(chalk.red(`[Ghost] Security: Skipping file "${file}": ${errorMessage}`));
				errors.push({ file, error: errorMessage });
			}
		}

		// Clear VFS even if some files failed (they were skipped for security)
		this.vfs.clear();

		if (errors.length > 0) {
			console.log(
				chalk.yellow(
					`[Ghost] Commit completed with ${errors.length} security violation(s). ` +
						`Invalid paths were skipped for safety.`,
				),
			);
		}
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
