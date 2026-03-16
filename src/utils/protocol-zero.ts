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
	// More robust blocked patterns - normalized for comparison
	private blockedCommands = [
		// Destructive commands
		/^\s*rm\s+-rf\s+\//i,
		/^\s*rm\s+-r\s+[/\w]+\s*$/i,
		/^\s*del\s+[a-z]:\\/i,
		/^\s*format\s+[a-z]:/i,
		// Pipe to shell (command injection)
		/\|\s*\/?(?:bin|usr)\/\w*sh/i,
		/\|\s*bash/i,
		/\|\s*sh\s*-c/i,
		/\|\s*python.*\s*-c/i,
		/\|\s*node.*\s*-e/i,
		// Sensitive file access
		/\.\.?\/etc\/passwd/i,
		/\.\.?\/etc\/shadow/i,
		/\.env/i,
		/\.\.\//i,
		/id_rsa/i,
		/id_ecdsa/i,
		/.ssh\/known_hosts/i,
		// Network exfiltration
		/curl\s+.*\s*>\s*\/?tmp/i,
		/wget\s+.*\s*>\s*\/?tmp/i,
		// Eval execution
		/^\s*eval\s+/i,
		/\bexec\s*\(/i,
	];

	constructor(projectRoot: string) {
		this.projectRoot = path.resolve(projectRoot);
	}

	/**
	 * Validates and executes a command within the "Protocol Zero" sandbox.
	 */
	async run(command: string): Promise<{ stdout: string; stderr: string }> {
		// 1. Normalize command for pattern matching (remove extra whitespace)
		const normalizedCommand = command.replace(/\s+/g, " ").trim();

		// 2. Pattern Validation - check against all blocked patterns
		for (const pattern of this.blockedCommands) {
			if (pattern.test(normalizedCommand)) {
				throw new Error(
					`[Protocol Zero] VIOLATION: Blocked pattern detected in command: "${command}"`,
				);
			}
		}

		// 3. Path validation - ensure command doesn't escape project root
		const pathValidation = this.validateExecutionPaths(command);
		if (!pathValidation.valid) {
			throw new Error(`[Protocol Zero] PATH VIOLATION: ${pathValidation.reason}`);
		}

		// 4. Command sanitization
		const sanitizedCommand = command.trim();

		console.log(chalk.gray(`[P0] Executing secured command: ${chalk.cyan(sanitizedCommand)}`));

		try {
			const { stdout, stderr } = await execPromise(sanitizedCommand, {
				cwd: this.projectRoot,
				env: { ...process.env, AIZEN_P0: "1" },
			});
			return { stdout, stderr };
		} catch (error) {
			throw new Error(`[Protocol Zero] EXECUTION_FAILED: ${(error as Error).message}`);
		}
	}

	/**
	 * Validates if file paths in command are within the project root.
	 */
	private validateExecutionPaths(command: string): { valid: boolean; reason?: string } {
		// Extract potential file paths from the command
		const pathPatterns = /([/'"\\])?([a-zA-Z]:[\\/]|[/])[\w.\-/\\]+/g;
		let match;

		while ((match = pathPatterns.exec(command)) !== null) {
			const fullPath = match[0];
			// Skip if it's a known safe pattern (flags, options, etc.)
			if (fullPath.startsWith("-") || fullPath.match(/^\/[a-z]+$/i)) {
				continue;
			}

			let resolvedPath: string;
			try {
				resolvedPath = path.isAbsolute(fullPath)
					? path.resolve(fullPath)
					: path.resolve(this.projectRoot, fullPath);
			} catch {
				continue;
			}

			// Check if path tries to escape project root
			if (!resolvedPath.startsWith(this.projectRoot)) {
				return {
					valid: false,
					reason: `Path '${fullPath}' resolves outside project root`,
				};
			}
		}

		return { valid: true };
	}

	/**
	 * Validates if a file path is within the project root (public API).
	 */
	isValidPath(targetPath: string): boolean {
		const resolved = path.resolve(this.projectRoot, targetPath);
		return resolved.startsWith(this.projectRoot);
	}
}

export const protocolZero = new ProtocolZero(process.cwd());
