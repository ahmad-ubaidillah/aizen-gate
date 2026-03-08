/**
 * CircuitBreaker: Protects the autonomous loop from infinite failures and stagnation.
 */

import { execSync } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Circuit state
 */
interface CircuitState {
	attempts: Record<string, number>;
	lastHashes: Record<string, string>;
	stalledCount: Record<string, number>;
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
	 * Checks if a WP has exceeded max retries.
	 */
	isTripped(wpId: string): boolean {
		const count = this.state.attempts[wpId] || 0;
		return count >= this.maxRetries;
	}

	/**
	 * Computes a hash of the current workspace state for a given WP.
	 * Use this to detect if anything actually changed between attempts.
	 */
	async hashWorkspace(_wpId: string): Promise<string> {
		try {
			// Simplified: hash the git diff or status
			// In a real scenario, we might use 'git diff' output
			const diff = execSync("git diff HEAD", { cwd: this.projectRoot, encoding: "utf8" });
			return crypto
				.createHash("md5")
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
