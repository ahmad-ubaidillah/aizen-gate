/**
 * Enhanced Error Handler for Aizen-Gate Onboarding
 * Provides actionable error messages with solutions
 */

import chalk from "chalk";

/**
 * Error codes for Aizen-Gate
 */
export enum AizenErrorCode {
	// Prerequisites
	PREREQ_NODE_VERSION = "PREREQ_NODE_VERSION",
	PREREQ_NPM_VERSION = "PREREQ_NPM_VERSION",
	PREREQ_DISK_SPACE = "PREREQ_DISK_SPACE",
	PREREQ_PERMISSIONS = "PREREQ_PERMISSIONS",
	PREREQ_NETWORK = "PREREQ_NETWORK",

	// Installation
	INSTALL_DEPENDENCY = "INSTALL_DEPENDENCY",
	INSTALL_CONFIG = "INSTALL_CONFIG",
	INSTALL_DIRECTORY = "INSTALL_DIRECTORY",
	INSTALL_EXISTS = "INSTALL_EXISTS",

	// Configuration
	CONFIG_INVALID = "CONFIG_INVALID",
	CONFIG_MISSING = "CONFIG_MISSING",
	CONFIG_PARSE = "CONFIG_PARSE",

	// File Operations
	FILE_NOT_FOUND = "FILE_NOT_FOUND",
	FILE_PERMISSION = "FILE_PERMISSION",
	FILE_WRITE = "FILE_WRITE",

	// Process
	PROCESS_TIMEOUT = "PROCESS_TIMEOUT",
	PROCESS_CANCELLED = "PROCESS_CANCELLED",
	PROCESS_FAILED = "PROCESS_FAILED",

	// General
	UNKNOWN = "UNKNOWN",
}

/**
 * Error solution with steps to resolve
 */
export interface ErrorSolution {
	/** Short description of the solution */
	description: string;
	/** Step-by-step instructions */
	steps: string[];
	/** Optional command to run */
	command?: string;
	/** Link to documentation */
	docs?: string;
}

/**
 * Enhanced error with actionable solutions
 */
export interface AizenErrorInfo {
	/** Error code */
	code: AizenErrorCode;
	/** Error title */
	title: string;
	/** Detailed message */
	message: string;
	/** Technical details */
	details?: string;
	/** Solutions to try */
	solutions: ErrorSolution[];
	/** Related hints */
	hints?: string[];
	/** Whether this error is recoverable */
	recoverable: boolean;
	/** Severity level */
	severity: "error" | "warning" | "info";
}

/**
 * Error solutions database
 */
const ERROR_SOLUTIONS: Record<AizenErrorCode, AizenErrorInfo> = {
	// Prerequisites
	[AizenErrorCode.PREREQ_NODE_VERSION]: {
		code: AizenErrorCode.PREREQ_NODE_VERSION,
		title: "Node.js Version Too Old",
		message: "Your Node.js version does not meet the minimum requirements.",
		solutions: [
			{
				description: "Update Node.js to the latest LTS version",
				steps: [
					"Visit https://nodejs.org/",
					"Download the LTS version (recommended)",
					"Install and restart your terminal",
					"Run 'node --version' to verify",
				],
				command: "nvm install --lts",
				docs: "https://nodejs.org/en/download/",
			},
			{
				description: "Use nvm to manage Node.js versions",
				steps: [
					"Install nvm: https://github.com/nvm-sh/nvm",
					"Run: nvm install 20",
					"Run: nvm use 20",
				],
				command: "nvm install 20 && nvm use 20",
			},
		],
		hints: [
			"Aizen-Gate requires Node.js 18+ for optimal performance",
			"Node.js 20+ is recommended for best compatibility",
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.PREREQ_NPM_VERSION]: {
		code: AizenErrorCode.PREREQ_NPM_VERSION,
		title: "npm Version Too Old",
		message: "Your npm version does not meet the minimum requirements.",
		solutions: [
			{
				description: "Update npm to the latest version",
				steps: ["Run the update command below", "Verify with 'npm --version'"],
				command: "npm install -g npm@latest",
			},
		],
		hints: ["npm is included with Node.js - updating Node.js often updates npm too"],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.PREREQ_DISK_SPACE]: {
		code: AizenErrorCode.PREREQ_DISK_SPACE,
		title: "Insufficient Disk Space",
		message: "Not enough disk space to complete installation.",
		solutions: [
			{
				description: "Free up disk space",
				steps: [
					"Clear npm cache: npm cache clean --force",
					"Remove unused node_modules folders",
					"Clear temporary files",
					"Try installation again",
				],
				command: "npm cache clean --force",
			},
		],
		hints: [
			"Aizen-Gate needs at least 100MB of free space",
			"Run 'df -h .' (Unix) or 'dir' (Windows) to check space",
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.PREREQ_PERMISSIONS]: {
		code: AizenErrorCode.PREREQ_PERMISSIONS,
		title: "Permission Denied",
		message: "Cannot write to the current directory.",
		solutions: [
			{
				description: "Fix directory permissions",
				steps: [
					"Check you have write access to this directory",
					"On Unix: chmod u+w .",
					"Or run from a directory you own",
				],
				command: "chmod u+w .",
			},
			{
				description: "Use a different directory",
				steps: [
					"Navigate to a directory you have write access to",
					"Or create a new project directory",
				],
			},
		],
		hints: [
			"Never use 'sudo' with npm - it causes permission issues",
			"Consider using nvm to avoid permission problems",
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.PREREQ_NETWORK]: {
		code: AizenErrorCode.PREREQ_NETWORK,
		title: "Network Connectivity Issue",
		message: "Cannot connect to package registry.",
		solutions: [
			{
				description: "Check your internet connection",
				steps: [
					"Verify you're connected to the internet",
					"Check if you're behind a corporate firewall",
					"Try again in a moment",
				],
			},
			{
				description: "Configure npm proxy",
				steps: [
					"If behind a proxy, configure npm:",
					"npm config set proxy http://proxy:port",
					"npm config set https-proxy http://proxy:port",
				],
			},
			{
				description: "Use offline mode",
				steps: ["Aizen-Gate can work in limited offline mode", "Some features may be unavailable"],
			},
		],
		hints: ["You can try again once your connection is restored"],
		recoverable: true,
		severity: "warning",
	},

	// Installation
	[AizenErrorCode.INSTALL_DEPENDENCY]: {
		code: AizenErrorCode.INSTALL_DEPENDENCY,
		title: "Dependency Installation Failed",
		message: "Failed to install required dependencies.",
		solutions: [
			{
				description: "Clear npm cache and retry",
				steps: [
					"Clear the npm cache",
					"Remove node_modules if it exists",
					"Try installation again",
				],
				command: "npm cache clean --force && rm -rf node_modules && npm install",
			},
			{
				description: "Check for native module issues",
				steps: [
					"Ensure you have build tools installed",
					"On macOS: xcode-select --install",
					"On Ubuntu: sudo apt-get install build-essential",
					"On Windows: npm install -g windows-build-tools",
				],
			},
		],
		hints: [
			"Native modules may require additional build tools",
			"Check the error log for specific package issues",
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.INSTALL_CONFIG]: {
		code: AizenErrorCode.INSTALL_CONFIG,
		title: "Configuration Error",
		message: "Failed to create configuration files.",
		solutions: [
			{
				description: "Check file permissions",
				steps: [
					"Ensure you have write access",
					"Check if files are locked by another process",
					"Try again",
				],
			},
		],
		hints: ["Close any editors that might have config files open"],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.INSTALL_DIRECTORY]: {
		code: AizenErrorCode.INSTALL_DIRECTORY,
		title: "Directory Creation Failed",
		message: "Failed to create required directories.",
		solutions: [
			{
				description: "Create directories manually",
				steps: ["Check parent directory permissions", "Create the required folder structure"],
				command: "mkdir -p aizen-gate .agent",
			},
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.INSTALL_EXISTS]: {
		code: AizenErrorCode.INSTALL_EXISTS,
		title: "Already Installed",
		message: "Aizen-Gate is already installed in this project.",
		solutions: [
			{
				description: "Update existing installation",
				steps: ["Run the update command to get the latest version"],
				command: "npx aizen-gate update",
			},
			{
				description: "Reinstall fresh",
				steps: ["Remove existing installation", "Run install again"],
				command: "rm -rf aizen-gate .agent && npx aizen-gate install",
			},
			{
				description: "Continue with existing",
				steps: ["Your existing setup is ready to use", "Run 'npx aizen-gate start' to begin"],
			},
		],
		recoverable: true,
		severity: "info",
	},

	// Configuration
	[AizenErrorCode.CONFIG_INVALID]: {
		code: AizenErrorCode.CONFIG_INVALID,
		title: "Invalid Configuration",
		message: "The configuration file contains invalid values.",
		solutions: [
			{
				description: "Reset configuration",
				steps: ["Delete the config file", "Run onboarding again"],
				command: "rm aizen-gate/config.json && npx aizen-gate install",
			},
			{
				description: "Fix manually",
				steps: [
					"Open aizen-gate/config.json",
					"Check for syntax errors",
					"Validate required fields",
				],
			},
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.CONFIG_MISSING]: {
		code: AizenErrorCode.CONFIG_MISSING,
		title: "Configuration Missing",
		message: "No configuration file found. Run install first.",
		solutions: [
			{
				description: "Run installation",
				steps: ["Initialize Aizen-Gate in your project"],
				command: "npx aizen-gate install",
			},
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.CONFIG_PARSE]: {
		code: AizenErrorCode.CONFIG_PARSE,
		title: "Configuration Parse Error",
		message: "Failed to parse configuration file.",
		solutions: [
			{
				description: "Fix JSON syntax",
				steps: [
					"Open aizen-gate/config.json",
					"Look for syntax errors (missing commas, brackets)",
					"Use a JSON validator",
				],
			},
		],
		recoverable: true,
		severity: "error",
	},

	// File Operations
	[AizenErrorCode.FILE_NOT_FOUND]: {
		code: AizenErrorCode.FILE_NOT_FOUND,
		title: "File Not Found",
		message: "A required file was not found.",
		solutions: [
			{
				description: "Check file exists",
				steps: ["Verify the file path is correct", "Run install to recreate missing files"],
			},
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.FILE_PERMISSION]: {
		code: AizenErrorCode.FILE_PERMISSION,
		title: "File Permission Error",
		message: "Cannot access file due to permission restrictions.",
		solutions: [
			{
				description: "Fix file permissions",
				steps: ["Check file ownership", "Adjust permissions as needed"],
				command: "chmod 644 <file>",
			},
		],
		recoverable: true,
		severity: "error",
	},

	[AizenErrorCode.FILE_WRITE]: {
		code: AizenErrorCode.FILE_WRITE,
		title: "File Write Error",
		message: "Failed to write to file.",
		solutions: [
			{
				description: "Check disk space and permissions",
				steps: ["Ensure disk isn't full", "Check write permissions", "Verify file isn't locked"],
			},
		],
		recoverable: true,
		severity: "error",
	},

	// Process
	[AizenErrorCode.PROCESS_TIMEOUT]: {
		code: AizenErrorCode.PROCESS_TIMEOUT,
		title: "Operation Timed Out",
		message: "The operation took too long to complete.",
		solutions: [
			{
				description: "Try again",
				steps: ["Check your network connection", "Run the command again"],
			},
			{
				description: "Increase timeout",
				steps: [
					"Set AIZEN_TIMEOUT environment variable",
					"Example: AIZEN_TIMEOUT=120 npx aizen-gate install",
				],
			},
		],
		hints: ["Slow networks may cause timeouts - try again when connection is better"],
		recoverable: true,
		severity: "warning",
	},

	[AizenErrorCode.PROCESS_CANCELLED]: {
		code: AizenErrorCode.PROCESS_CANCELLED,
		title: "Operation Cancelled",
		message: "The operation was cancelled by the user.",
		solutions: [
			{
				description: "Resume installation",
				steps: ["Run the install command again to continue"],
				command: "npx aizen-gate install",
			},
		],
		recoverable: true,
		severity: "info",
	},

	[AizenErrorCode.PROCESS_FAILED]: {
		code: AizenErrorCode.PROCESS_FAILED,
		title: "Process Failed",
		message: "An unexpected error occurred during the operation.",
		solutions: [
			{
				description: "Check error details",
				steps: [
					"Review the error message above",
					"Try the suggested fix",
					"Run with --verbose for more details",
				],
			},
			{
				description: "Get help",
				steps: ["Check the documentation", "Report the issue if it persists"],
				docs: "https://github.com/ahmad-ubaidillah/aizen-gate/issues",
			},
		],
		recoverable: false,
		severity: "error",
	},

	// General
	[AizenErrorCode.UNKNOWN]: {
		code: AizenErrorCode.UNKNOWN,
		title: "Unknown Error",
		message: "An unexpected error occurred.",
		solutions: [
			{
				description: "Get support",
				steps: [
					"Check the documentation",
					"Search for similar issues",
					"Report with full error details",
				],
				docs: "https://github.com/ahmad-ubaidillah/aizen-gate/issues",
			},
		],
		recoverable: false,
		severity: "error",
	},
};

/**
 * Custom Aizen error class
 */
export class AizenError extends Error {
	public readonly code: AizenErrorCode;
	public readonly info: AizenErrorInfo;
	public readonly cause?: Error;

	constructor(code: AizenErrorCode, message?: string, cause?: Error) {
		const info = ERROR_SOLUTIONS[code] || ERROR_SOLUTIONS[AizenErrorCode.UNKNOWN];
		super(message || info.message);
		this.name = "AizenError";
		this.code = code;
		this.info = info;
		this.cause = cause;
	}

	/**
	 * Create from any error
	 */
	static from(error: Error, code?: AizenErrorCode): AizenError {
		if (error instanceof AizenError) {
			return error;
		}
		return new AizenError(code || AizenErrorCode.UNKNOWN, error.message, error);
	}
}

/**
 * Display an error with formatted output
 */
export function displayError(error: AizenError | Error): void {
	const aizenError = error instanceof AizenError ? error : AizenError.from(error);

	const { info } = aizenError;

	console.log();

	// Error header
	const severityColors = {
		error: chalk.red,
		warning: chalk.yellow,
		info: chalk.blue,
	};
	const severityIcons = {
		error: "✗",
		warning: "⚠",
		info: "ℹ",
	};

	const color = severityColors[info.severity];
	const icon = severityIcons[info.severity];

	console.log(color.bold(`  ${icon} ${info.title}`));
	console.log(chalk.dim("  " + "─".repeat(50)));
	console.log();

	// Error message
	console.log(chalk.white(`  ${info.message}`));

	if (aizenError.cause?.message && aizenError.cause.message !== info.message) {
		console.log(chalk.dim(`  Details: ${aizenError.cause.message}`));
	}

	console.log();

	// Solutions
	if (info.solutions.length > 0) {
		console.log(chalk.cyan.bold("  How to fix:"));
		console.log();

		for (let i = 0; i < info.solutions.length; i++) {
			const solution = info.solutions[i];
			console.log(chalk.white(`  ${i + 1}. ${solution.description}`));

			for (const step of solution.steps) {
				console.log(chalk.dim(`     • ${step}`));
			}

			if (solution.command) {
				console.log(chalk.green(`     $ ${solution.command}`));
			}

			if (solution.docs) {
				console.log(chalk.blue.dim(`     📖 ${solution.docs}`));
			}

			console.log();
		}
	}

	// Hints
	if (info.hints && info.hints.length > 0) {
		console.log(chalk.yellow.bold("  💡 Tips:"));
		for (const hint of info.hints) {
			console.log(chalk.dim(`     • ${hint}`));
		}
		console.log();
	}

	// Recovery status
	if (info.recoverable) {
		console.log(chalk.green("  This error can be recovered. Try the solutions above."));
	} else {
		console.log(chalk.red("  This error requires manual intervention."));
	}

	console.log();
}

/**
 * Display a warning message
 */
export function displayWarning(title: string, message: string, hints?: string[]): void {
	console.log();
	console.log(chalk.yellow.bold(`  ⚠ ${title}`));
	console.log(chalk.dim("  " + "─".repeat(50)));
	console.log();
	console.log(chalk.white(`  ${message}`));

	if (hints && hints.length > 0) {
		console.log();
		console.log(chalk.dim("  Tips:"));
		for (const hint of hints) {
			console.log(chalk.dim(`    • ${hint}`));
		}
	}

	console.log();
}

/**
 * Display an info message
 */
export function displayInfoBox(title: string, message: string, command?: string): void {
	console.log();
	console.log(chalk.blue.bold(`  ℹ ${title}`));
	console.log(chalk.dim("  " + "─".repeat(50)));
	console.log();
	console.log(chalk.white(`  ${message}`));

	if (command) {
		console.log();
		console.log(chalk.green(`  $ ${command}`));
	}

	console.log();
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: Error): string {
	if (error instanceof AizenError) {
		return JSON.stringify(
			{
				code: error.code,
				title: error.info.title,
				message: error.message,
				cause: error.cause?.message,
				stack: error.stack,
			},
			null,
			2,
		);
	}

	return JSON.stringify(
		{
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
		null,
		2,
	);
}

/**
 * Try to execute a function with error handling
 */
export async function tryWithErrorHandling<T>(
	fn: () => Promise<T>,
	errorCode: AizenErrorCode = AizenErrorCode.UNKNOWN,
): Promise<{ success: true; data: T } | { success: false; error: AizenError }> {
	try {
		const data = await fn();
		return { success: true, data };
	} catch (error) {
		const aizenError = AizenError.from(error as Error, errorCode);
		return { success: false, error: aizenError };
	}
}

/**
 * Get error info by code
 */
export function getErrorInfo(code: AizenErrorCode): AizenErrorInfo {
	return ERROR_SOLUTIONS[code] || ERROR_SOLUTIONS[AizenErrorCode.UNKNOWN];
}

/**
 * Check if an error is recoverable
 */
export function isRecoverable(error: Error): boolean {
	if (error instanceof AizenError) {
		return error.info.recoverable;
	}
	return false;
}

export { ERROR_SOLUTIONS };
