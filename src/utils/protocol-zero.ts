import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import chalk from "chalk";

const execPromise = promisify(exec);

/**
 * [Phase 10] Protocol Zero: Sandbox Execution Layer
 * Enforces Zero-Trust orchestration by validating agent commands.
 */
export class ProtocolZero {
	private projectRoot: string;
	private blockedPatterns = [
		/rm -rf \/$/,
		/curl.*\|.*bash/,
		/wget.*\|.*bash/,
		/\.env/,
		/passwd/,
		/id_rsa/,
	];

	constructor(projectRoot: string) {
		this.projectRoot = path.resolve(projectRoot);
	}

	/**
	 * Validates and executes a command within the "Protocol Zero" sandbox.
	 */
	async run(command: string): Promise<{ stdout: string; stderr: string }> {
		// 1. Pattern Validation
		for (const pattern of this.blockedPatterns) {
			if (pattern.test(command)) {
				throw new Error(
					`[Protocol Zero] VIOLATION: Blocked pattern detected in command: "${command}"`,
				);
			}
		}

		// 2. Command Sanitization (Simplified for Lite)
		const sanitizedCommand = command.trim();

		console.log(chalk.gray(`[P0] Executing secured command: ${chalk.cyan(sanitizedCommand)}`));

		try {
			const { stdout, stderr } = await execPromise(sanitizedCommand, {
				cwd: this.projectRoot,
				env: { ...process.env, AIZEN_P0: "1" }, // Flag for being in Protocol Zero
			});
			return { stdout, stderr };
		} catch (error) {
			throw new Error(`[Protocol Zero] EXECUTION_FAILED: ${(error as Error).message}`);
		}
	}

	/**
	 * Validates if a file path is within the project root.
	 */
	isValidPath(targetPath: string): boolean {
		const resolved = path.resolve(this.projectRoot, targetPath);
		return resolved.startsWith(this.projectRoot);
	}
}

export const protocolZero = new ProtocolZero(process.cwd());
