/**
 * Prerequisite Checker for Aizen-Gate Onboarding
 * Validates the environment before installation
 */

import { exec as execCallback } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import chalk from "chalk";

const exec = promisify(execCallback);

/**
 * Prerequisite check result
 */
export interface PrerequisiteResult {
	/** Unique identifier for this check */
	id: string;
	/** Display name */
	name: string;
	/** Whether the check passed */
	passed: boolean;
	/** Optional message with details */
	message?: string;
	/** Optional error details */
	error?: string;
	/** Suggested fix for failures */
	fix?: string;
	/** Documentation link */
	docs?: string;
	/** Whether this is a critical requirement */
	critical: boolean;
	/** Category for grouping */
	category: "runtime" | "tools" | "environment" | "optional";
}

/**
 * System information gathered during checks
 */
export interface SystemInfo {
	platform: string;
	arch: string;
	nodeVersion: string;
	npmVersion: string;
	homedir: string;
	cpus: number;
	totalMemory: number;
	freeMemory: number;
}

/**
 * Options for prerequisite checking
 */
export interface PrerequisiteOptions {
	/** Skip optional checks */
	skipOptional?: boolean;
	/** Stop on first failure */
	stopOnFailure?: boolean;
	/** Verbose output */
	verbose?: boolean;
}

/**
 * Results of all prerequisite checks
 */
export interface PrerequisiteCheckResults {
	systemInfo: SystemInfo;
	results: PrerequisiteResult[];
	allPassed: boolean;
	criticalPassed: boolean;
	optionalSkipped: number;
	failures: PrerequisiteResult[];
	warnings: PrerequisiteResult[];
}

/**
 * Minimum required versions
 */
const MIN_VERSIONS = {
	node: "18.0.0",
	npm: "9.0.0",
	git: "2.0.0",
};

/**
 * Recommended versions
 */
const RECOMMENDED_VERSIONS = {
	node: "20.0.0",
	npm: "10.0.0",
	git: "2.30.0",
};

/**
 * Parse semver version string
 */
function parseVersion(versionStr: string): { major: number; minor: number; patch: number } {
	const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
	if (!match) {
		return { major: 0, minor: 0, patch: 0 };
	}
	return {
		major: parseInt(match[1], 10),
		minor: parseInt(match[2], 10),
		patch: parseInt(match[3], 10),
	};
}

/**
 * Compare two version strings
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
	const vA = parseVersion(a);
	const vB = parseVersion(b);

	if (vA.major !== vB.major) return vA.major < vB.major ? -1 : 1;
	if (vA.minor !== vB.minor) return vA.minor < vB.minor ? -1 : 1;
	if (vA.patch !== vB.patch) return vA.patch < vB.patch ? -1 : 1;
	return 0;
}

/**
 * Check if a version meets minimum requirements
 */
function meetsMinimum(version: string, minimum: string): boolean {
	return compareVersions(version, minimum) >= 0;
}

/**
 * Get system information
 */
export async function getSystemInfo(): Promise<SystemInfo> {
	const nodeVersion = process.versions.node;
	let npmVersion = "0.0.0";

	try {
		const { stdout } = await exec("npm --version");
		npmVersion = stdout.trim();
	} catch {
		// npm not found
	}

	return {
		platform: process.platform,
		arch: process.arch,
		nodeVersion,
		npmVersion,
		homedir: os.homedir(),
		cpus: os.cpus().length,
		totalMemory: os.totalmem(),
		freeMemory: os.freemem(),
	};
}

/**
 * Check Node.js version
 */
async function checkNodeVersion(): Promise<PrerequisiteResult> {
	const version = process.versions.node;
	const meetsMin = meetsMinimum(version, MIN_VERSIONS.node);
	const meetsRecommended = meetsMinimum(version, RECOMMENDED_VERSIONS.node);

	return {
		id: "node-version",
		name: "Node.js",
		passed: meetsMin,
		message: meetsRecommended
			? `v${version} ✓`
			: meetsMin
				? `v${version} (minimum met, recommended: v${RECOMMENDED_VERSIONS.node})`
				: `v${version} (required: v${MIN_VERSIONS.node}+)`,
		error: !meetsMin ? `Node.js v${MIN_VERSIONS.node} or higher is required` : undefined,
		fix: !meetsMin
			? `Install Node.js v${RECOMMENDED_VERSIONS.node}+ from https://nodejs.org/`
			: undefined,
		docs: "https://nodejs.org/en/download/",
		critical: true,
		category: "runtime",
	};
}

/**
 * Check npm version
 */
async function checkNpmVersion(): Promise<PrerequisiteResult> {
	try {
		const { stdout } = await exec("npm --version");
		const version = stdout.trim();
		const meetsMin = meetsMinimum(version, MIN_VERSIONS.npm);
		const meetsRecommended = meetsMinimum(version, RECOMMENDED_VERSIONS.npm);

		return {
			id: "npm-version",
			name: "npm",
			passed: meetsMin,
			message: meetsRecommended
				? `v${version} ✓`
				: meetsMin
					? `v${version} (minimum met, recommended: v${RECOMMENDED_VERSIONS.npm})`
					: `v${version} (required: v${MIN_VERSIONS.npm}+)`,
			error: !meetsMin ? `npm v${MIN_VERSIONS.npm} or higher is required` : undefined,
			fix: !meetsMin
				? `Update npm: npm install -g npm@${RECOMMENDED_VERSIONS.npm.split(".")[0]}`
				: undefined,
			docs: "https://docs.npmjs.com/try-the-latest-stable-version-of-npm",
			critical: true,
			category: "runtime",
		};
	} catch (error) {
		return {
			id: "npm-version",
			name: "npm",
			passed: false,
			error: "npm not found",
			fix: "npm should be installed with Node.js. Reinstall Node.js from https://nodejs.org/",
			critical: true,
			category: "runtime",
		};
	}
}

/**
 * Check Git installation
 */
async function checkGit(): Promise<PrerequisiteResult> {
	try {
		const { stdout } = await exec("git --version");
		const match = stdout.match(/git version (\d+\.\d+\.\d+)/);
		const version = match ? match[1] : "unknown";
		const meetsMin = meetsMinimum(version, MIN_VERSIONS.git);

		return {
			id: "git",
			name: "Git",
			passed: meetsMin,
			message: `v${version}`,
			error: !meetsMin ? `Git v${MIN_VERSIONS.git}+ recommended` : undefined,
			fix: !meetsMin ? "Update Git from https://git-scm.com/downloads" : undefined,
			docs: "https://git-scm.com/book/en/v2/Getting-Started-Installing-Git",
			critical: false, // Git is recommended but not strictly required
			category: "tools",
		};
	} catch {
		return {
			id: "git",
			name: "Git",
			passed: false,
			error: "Git not installed",
			message: "Git is recommended for version control integration",
			fix: "Install Git from https://git-scm.com/downloads",
			docs: "https://git-scm.com/book/en/v2/Getting-Started-Installing-Git",
			critical: false,
			category: "tools",
		};
	}
}

/**
 * Check available disk space
 */
async function checkDiskSpace(): Promise<PrerequisiteResult> {
	const minSpaceMB = 100; // Minimum 100MB
	const recommendedSpaceMB = 500; // Recommended 500MB

	try {
		// Get disk stats based on platform
		const projectRoot = process.cwd();
		let freeSpaceMB: number;

		if (process.platform === "win32") {
			// Windows: use wmic command
			const { stdout } = await exec(
				`wmic logicaldisk where "DeviceID='${projectRoot.charAt(0)}:'" get FreeSpace`,
			);
			const match = stdout.match(/\d+/g);
			freeSpaceMB = match ? parseInt(match[1], 10) / (1024 * 1024) : 0;
		} else {
			// Unix-like: use df command
			const { stdout } = await exec(`df -m "${projectRoot}" | tail -1`);
			const parts = stdout.trim().split(/\s+/);
			freeSpaceMB = parts[3] ? parseInt(parts[3], 10) : 0;
		}

		const hasMinSpace = freeSpaceMB >= minSpaceMB;
		const hasRecommendedSpace = freeSpaceMB >= recommendedSpaceMB;

		return {
			id: "disk-space",
			name: "Disk Space",
			passed: hasMinSpace,
			message: hasRecommendedSpace
				? `${(freeSpaceMB / 1024).toFixed(1)} GB available`
				: `${freeSpaceMB} MB available (recommended: ${recommendedSpaceMB} MB)`,
			error: !hasMinSpace ? `Insufficient disk space. Need at least ${minSpaceMB} MB` : undefined,
			fix: !hasMinSpace ? "Free up disk space before installing" : undefined,
			critical: !hasMinSpace,
			category: "environment",
		};
	} catch {
		return {
			id: "disk-space",
			name: "Disk Space",
			passed: true, // Assume OK if we can't check
			message: "Could not verify (assuming sufficient)",
			critical: false,
			category: "environment",
		};
	}
}

/**
 * Check memory availability
 */
async function checkMemory(): Promise<PrerequisiteResult> {
	const minMemoryGB = 2;
	const recommendedMemoryGB = 4;
	const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
	const freeMemoryGB = os.freemem() / (1024 * 1024 * 1024);

	const hasMinMemory = totalMemoryGB >= minMemoryGB;
	const hasRecommendedMemory = totalMemoryGB >= recommendedMemoryGB;

	return {
		id: "memory",
		name: "System Memory",
		passed: hasMinMemory,
		message: hasRecommendedMemory
			? `${totalMemoryGB.toFixed(1)} GB total, ${freeMemoryGB.toFixed(1)} GB free`
			: `${totalMemoryGB.toFixed(1)} GB total (recommended: ${recommendedMemoryGB} GB)`,
		error: !hasMinMemory ? `At least ${minMemoryGB} GB RAM recommended` : undefined,
		fix: !hasMinMemory ? "Consider upgrading system memory for better performance" : undefined,
		critical: false,
		category: "environment",
	};
}

/**
 * Check write permissions in current directory
 */
async function checkWritePermissions(): Promise<PrerequisiteResult> {
	const testFile = path.join(process.cwd(), ".aizen-write-test");
	try {
		fs.writeFileSync(testFile, "test");
		fs.unlinkSync(testFile);
		return {
			id: "write-permissions",
			name: "Write Permissions",
			passed: true,
			message: "Can write to project directory",
			critical: true,
			category: "environment",
		};
	} catch (error) {
		return {
			id: "write-permissions",
			name: "Write Permissions",
			passed: false,
			error: "Cannot write to current directory",
			fix: "Run from a directory where you have write permissions, or use sudo (not recommended)",
			critical: true,
			category: "environment",
		};
	}
}

/**
 * Check for common build tools (for native modules)
 */
async function checkBuildTools(): Promise<PrerequisiteResult> {
	const results: string[] = [];
	let hasPython = false;
	let hasMake = false;
	let hasGcc = false;

	// Check Python
	try {
		const { stdout } = await exec("python3 --version || python --version");
		hasPython = true;
		results.push(`Python: ${stdout.trim()}`);
	} catch {
		results.push("Python: not found");
	}

	// Check make/gcc on Unix
	if (process.platform !== "win32") {
		try {
			await exec("make --version");
			hasMake = true;
			results.push("make: ✓");
		} catch {
			results.push("make: not found");
		}

		try {
			await exec("gcc --version");
			hasGcc = true;
			results.push("gcc: ✓");
		} catch {
			results.push("gcc: not found");
		}
	}

	const hasBasicTools = process.platform === "win32" ? hasPython : hasPython && (hasMake || hasGcc);

	return {
		id: "build-tools",
		name: "Build Tools",
		passed: true, // Not critical, just informational
		message: results.join(", "),
		error: !hasBasicTools ? "Some build tools missing (may affect native modules)" : undefined,
		fix: !hasBasicTools
			? process.platform === "win32"
				? "Install Python from https://www.python.org/downloads/"
				: "Install build-essential (Ubuntu) or Xcode CLI tools (macOS)"
			: undefined,
		critical: false,
		category: "optional",
	};
}

/**
 * Check for existing Aizen-Gate installation
 */
async function checkExistingInstallation(): Promise<PrerequisiteResult> {
	const projectRoot = process.cwd();
	const configPath = path.join(projectRoot, "aizen-gate", "config.json");
	const agentPath = path.join(projectRoot, ".agent");

	const hasConfig = fs.existsSync(configPath);
	const hasAgent = fs.existsSync(agentPath);

	if (hasConfig || hasAgent) {
		return {
			id: "existing-install",
			name: "Existing Installation",
			passed: true,
			message: "Aizen-Gate is already installed in this project",
			critical: false,
			category: "environment",
		};
	}

	return {
		id: "existing-install",
		name: "Existing Installation",
		passed: true,
		message: "Fresh installation",
		critical: false,
		category: "environment",
	};
}

/**
 * Check network connectivity (for downloading packages)
 */
async function checkNetworkConnectivity(): Promise<PrerequisiteResult> {
	try {
		// Try to reach npm registry
		await exec("npm ping --registry https://registry.npmjs.org", {
			timeout: 5000,
		} as any);

		return {
			id: "network",
			name: "Network Connectivity",
			passed: true,
			message: "Connected to npm registry",
			critical: false,
			category: "environment",
		};
	} catch {
		return {
			id: "network",
			name: "Network Connectivity",
			passed: true, // Not critical, just a warning
			message: "Could not verify (offline mode available)",
			error: "May not be able to download packages",
			fix: "Check your internet connection if installation fails",
			critical: false,
			category: "environment",
		};
	}
}

/**
 * Check for optional AI dependencies
 */
async function checkAIDependencies(): Promise<PrerequisiteResult> {
	const results: string[] = [];

	// Check for node-llama-cpp
	try {
		await import("node-llama-cpp");
		results.push("node-llama-cpp: ✓");
	} catch {
		results.push("node-llama-cpp: not installed");
	}

	// Check for transformers
	try {
		await import("@xenova/transformers");
		results.push("transformers: ✓");
	} catch {
		results.push("transformers: not installed");
	}

	return {
		id: "ai-deps",
		name: "AI Dependencies",
		passed: true,
		message: results.join(", "),
		error: "AI features will run in lite mode without these packages",
		fix: "For full AI capabilities: npm install node-llama-cpp @xenova/transformers",
		critical: false,
		category: "optional",
	};
}

/**
 * Run all prerequisite checks
 */
export async function runPrerequisiteChecks(
	options: PrerequisiteOptions = {},
): Promise<PrerequisiteCheckResults> {
	const { skipOptional = false, stopOnFailure = false } = options;

	const systemInfo = await getSystemInfo();
	const results: PrerequisiteResult[] = [];

	// Core checks
	const coreChecks = [
		checkNodeVersion(),
		checkNpmVersion(),
		checkGit(),
		checkDiskSpace(),
		checkMemory(),
		checkWritePermissions(),
		checkExistingInstallation(),
		checkNetworkConnectivity(),
	];

	// Run core checks
	for (const check of coreChecks) {
		const result = await check;
		results.push(result);

		if (stopOnFailure && !result.passed && result.critical) {
			break;
		}
	}

	// Optional checks
	if (!skipOptional) {
		const optionalChecks = [checkBuildTools(), checkAIDependencies()];

		for (const check of optionalChecks) {
			results.push(await check);
		}
	}

	// Analyze results
	const failures = results.filter((r) => !r.passed && r.critical);
	const warnings = results.filter((r) => !r.passed && !r.critical);
	const allPassed = results.every((r) => r.passed);
	const criticalPassed = failures.length === 0;
	const optionalSkipped = skipOptional ? 2 : 0;

	return {
		systemInfo,
		results,
		allPassed,
		criticalPassed,
		optionalSkipped,
		failures,
		warnings,
	};
}

/**
 * Display prerequisite check results
 */
export function displayPrerequisiteResults(checkResults: PrerequisiteCheckResults): void {
	console.log();
	console.log(chalk.bold.cyan("🔍 System Requirements Check"));
	console.log(chalk.dim("─".repeat(50)));

	// Group results by category
	const categories = ["runtime", "tools", "environment", "optional"] as const;

	for (const category of categories) {
		const categoryResults = checkResults.results.filter((r) => r.category === category);
		if (categoryResults.length === 0) continue;

		const categoryNames: Record<string, string> = {
			runtime: "Runtime",
			tools: "Tools",
			environment: "Environment",
			optional: "Optional",
		};

		console.log();
		console.log(chalk.dim(`  ${categoryNames[category]}:`));

		for (const result of categoryResults) {
			const icon = result.passed
				? chalk.green("✓")
				: result.critical
					? chalk.red("✗")
					: chalk.yellow("○");

			const name = result.name.padEnd(20);
			const message = result.message || result.error || "";

			console.log(`    ${icon} ${name} ${chalk.dim(message)}`);
		}
	}

	// Summary
	console.log();
	console.log(chalk.dim("─".repeat(50)));

	if (checkResults.allPassed) {
		console.log(chalk.green.bold("  ✓ All checks passed!"));
	} else if (checkResults.criticalPassed) {
		console.log(chalk.yellow.bold("  ⚠ Passed with warnings"));
	} else {
		console.log(chalk.red.bold("  ✗ Some checks failed"));
	}

	// Show fixes for failures
	if (checkResults.failures.length > 0) {
		console.log();
		console.log(chalk.red.bold("  Required fixes:"));
		for (const failure of checkResults.failures) {
			console.log(chalk.red(`    • ${failure.name}: ${failure.fix || failure.error}`));
		}
	}

	// Show warnings
	if (checkResults.warnings.length > 0) {
		console.log();
		console.log(chalk.yellow.bold("  Warnings:"));
		for (const warning of checkResults.warnings) {
			console.log(chalk.yellow(`    • ${warning.name}: ${warning.message || warning.error}`));
		}
	}

	console.log();
}

/**
 * Quick check if system is ready for installation
 */
export async function isSystemReady(): Promise<{
	ready: boolean;
	issues: string[];
}> {
	const results = await runPrerequisiteChecks({ skipOptional: true });
	const issues: string[] = [];

	for (const result of results.failures) {
		issues.push(`${result.name}: ${result.error}`);
	}

	return {
		ready: results.criticalPassed,
		issues,
	};
}

/**
 * Format system info for display
 */
export function formatSystemInfo(info: SystemInfo): string {
	const lines = [
		`Platform: ${info.platform} (${info.arch})`,
		`Node.js: v${info.nodeVersion}`,
		`npm: v${info.npmVersion}`,
		`CPUs: ${info.cpus}`,
		`Memory: ${(info.totalMemory / (1024 * 1024 * 1024)).toFixed(1)} GB`,
	];

	return lines.join("\n");
}
