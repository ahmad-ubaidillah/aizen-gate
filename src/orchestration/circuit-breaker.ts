/**
 * CircuitBreaker: Protects the autonomous loop from infinite failures and stagnation.
 */

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import chalk from "chalk";
import fs, { pathExistsSync, statSync } from "fs-extra";

/**
 * Circuit state
 */
interface CircuitState {
	attempts: Record<string, number>;
	lastHashes: Record<string, string>;
	stalledCount: Record<string, number>;
	failurePatterns: Record<string, string[]>;
	trippedReasons: Record<string, string>;
}

/**
 * CircuitBreaker: Protects the autonomous loop from infinite failures and stagnation.
 */
export class CircuitBreaker {
	public projectRoot: string;
	public maxRetries: number;
	public statePath: string;
	public state: CircuitState;

	constructor(projectRoot: string, maxRetries = 3) {
		this.projectRoot = projectRoot;
		this.maxRetries = maxRetries;
		this.statePath = path.join(projectRoot, "aizen-gate", "shared", "circuit-state.json");
		this.state = {
			attempts: {}, // wpId -> count
			lastHashes: {}, // wpId -> md5 of last implementation result
			stalledCount: {}, // wpId -> count of cycles with no changes
			failurePatterns: {}, // wpId -> array of last 3 error outputs
			trippedReasons: {}, // wpId -> reason for trip
		};
		this.loadState();
	}

	loadState(): void {
		if (fs.existsSync(this.statePath)) {
			try {
				const data = fs.readJsonSync(this.statePath);
				this.state = { ...this.state, ...data };
			} catch (e) {
				const errorMessage = e instanceof Error ? e.message : "Unknown error";
				console.error(chalk.yellow(`[CB] Failed to load circuit state: ${errorMessage}`));
			}
		}
	}

	saveState(): void {
		try {
			fs.ensureDirSync(path.dirname(this.statePath));
			fs.writeJsonSync(this.statePath, this.state, { spaces: 2 });
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : "Unknown error";
			console.error(chalk.red(`[CB] Failed to save circuit state: ${errorMessage}`));
		}
	}

	/**
	 * Records an attempt to implement a WP.
	 */
	recordAttempt(wpId: string): number {
		this.state.attempts[wpId] = (this.state.attempts[wpId] || 0) + 1;
		this.saveState();
		return this.state.attempts[wpId];
	}

	/**
	 * Checks if a WP has exceeded max retries or hit a recursive loop.
	 */
	isTripped(wpId: string): boolean {
		if (this.state.trippedReasons[wpId]) return true;

		const count = this.state.attempts[wpId] || 0;
		if (count >= this.maxRetries) {
			this.state.trippedReasons[wpId] = "MAX_RETRIES_EXCEEDED";
			return true;
		}
		return false;
	}

	getTripReason(wpId: string): string | null {
		return this.state.trippedReasons[wpId] || null;
	}

	/**
	 * Phase 17: Pattern Recognition for Recursive Loops
	 */
	recordFailure(wpId: string, error: string): boolean {
		if (!this.state.failurePatterns[wpId]) this.state.failurePatterns[wpId] = [];

		const patterns = this.state.failurePatterns[wpId];
		patterns.push(error.slice(0, 200)); // Sample the error

		if (patterns.length > 3) patterns.shift();

		// Detect recursion: check if the last 3 errors are identical or very similar
		if (patterns.length === 3 && patterns.every((p) => p === patterns[0])) {
			this.state.trippedReasons[wpId] = "RECURSIVE_LOOP_DETECTED";
			this.saveState();
			console.log(
				chalk.red.bold(
					`[CB] 🛑 RECURSIVE LOOP DETECTED for ${wpId}. Automatic Kill-Switch activated.`,
				),
			);
			return true;
		}

		this.saveState();
		return false;
	}

	/**
	 * Computes a hash of the current workspace state for a given WP.
	 * Use this to detect if anything actually changed between attempts.
	 * SECURITY: Uses SHA-256 instead of MD5 to prevent collision attacks.
	 * SECURITY: Uses spawn with args array instead of execSync to prevent command injection.
	 */
	async hashWorkspace(_wpId: string): Promise<string> {
		try {
			// SECURITY: Validate projectRoot exists and is a directory
			if (!pathExistsSync(this.projectRoot)) {
				return Date.now().toString();
			}

			try {
				const stats = statSync(this.projectRoot);
				if (!stats.isDirectory()) {
					return Date.now().toString();
				}
			} catch {
				return Date.now().toString();
			}

			// SECURITY: Use spawn with args array to prevent command injection
			// The git command arguments are passed as separate array elements
			const diff = await new Promise<string>((resolve, reject) => {
				const proc = spawn("git", ["diff", "HEAD"], {
					cwd: this.projectRoot,
					timeout: 10000, // 10 second timeout
				});

				let output = "";
				let errorOutput = "";

				proc.stdout.on("data", (data) => {
					output += data.toString();
				});

				proc.stderr.on("data", (data) => {
					errorOutput += data.toString();
				});

				proc.on("close", (code) => {
					if (code === 0 || code === 1) {
						// git diff returns 0 if no changes, 1 if changes exist
						resolve(output);
					} else {
						reject(new Error(`git diff exited with code ${code}: ${errorOutput}`));
					}
				});

				proc.on("error", (err) => {
					reject(err);
				});
			});

			return crypto
				.createHash("sha256")
				.update(diff || "no-changes")
				.digest("hex");
		} catch {
			return Date.now().toString(); // Fallback to timestamp if not a git repo
		}
	}

	/**
	 * Checks for response stagnation by hashing the "result" or "output".
	 */
	checkStagnation(wpId: string, currentHash: string): boolean {
		const lastHash = this.state.lastHashes[wpId];

		if (lastHash === currentHash) {
			this.state.stalledCount[wpId] = (this.state.stalledCount[wpId] || 0) + 1;
			this.saveState();
			return this.state.stalledCount[wpId] >= 2;
		} else {
			this.state.lastHashes[wpId] = currentHash;
			this.state.stalledCount[wpId] = 0;
			this.saveState();
			return false;
		}
	}

	/**
	 * Resets state for a specific WP (e.g. after manual fix).
	 */
	reset(wpId: string): void {
		delete this.state.attempts[wpId];
		delete this.state.lastHashes[wpId];
		delete this.state.stalledCount[wpId];
		this.saveState();
	}

	/**
	 * Detects if the workspace files changed since last check.
	 * Logic: compares git status or atime of files.
	 */
	async detectNoChanges(_wpId: string, _lastMtime: number): Promise<boolean> {
		// Implementation for later: check file system for modifications
		// For now placeholder
		return false;
	}
}
