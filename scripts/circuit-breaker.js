const fs = require("fs-extra");
const path = require("node:path");
const crypto = require("node:crypto");
const chalk = require("chalk");

/**
 * CircuitBreaker: Protects the autonomous loop from infinite failures and stagnation.
 */
class CircuitBreaker {
	constructor(projectRoot, maxRetries = 3) {
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

	loadState() {
		if (fs.existsSync(this.statePath)) {
			try {
				const data = fs.readJsonSync(this.statePath);
				this.state = { ...this.state, ...data };
			} catch (e) {
				console.error(chalk.yellow(`[CB] Failed to load circuit state: ${e.message}`));
			}
		}
	}

	saveState() {
		try {
			fs.ensureDirSync(path.dirname(this.statePath));
			fs.writeJsonSync(this.statePath, this.state, { spaces: 2 });
		} catch (e) {
			console.error(chalk.red(`[CB] Failed to save circuit state: ${e.message}`));
		}
	}

	/**
	 * Records an attempt to implement a WP.
	 */
	recordAttempt(wpId) {
		this.state.attempts[wpId] = (this.state.attempts[wpId] || 0) + 1;
		this.saveState();
		return this.state.attempts[wpId];
	}

	/**
	 * Checks if a WP has exceeded max retries.
	 */
	isTripped(wpId) {
		const count = this.state.attempts[wpId] || 0;
		return count >= this.maxRetries;
	}

	/**
	 * Computes a hash of the current workspace state for a given WP.
	 * Use this to detect if anything actually changed between attempts.
	 */
	async hashWorkspace(_wpId) {
		try {
			// Simplified: hash the git diff or status
			// In a real scenario, we might use 'git diff' output
			const { execSync } = require("node:child_process");
			const diff = execSync("git diff HEAD", { cwd: this.projectRoot, encoding: "utf8" });
			return crypto
				.createHash("md5")
				.update(diff || "no-changes")
				.digest("hex");
		} catch (_e) {
			return Date.now().toString(); // Fallback to timestamp if not a git repo
		}
	}

	/**
	 * Checks for response stagnation by hashing the "result" or "output".
	 */
	checkStagnation(wpId, currentHash) {
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
	reset(wpId) {
		delete this.state.attempts[wpId];
		delete this.state.lastHashes[wpId];
		delete this.state.stalledCount[wpId];
		this.saveState();
	}

	/**
	 * Detects if the workspace files changed since last check.
	 * Logic: compares git status or atime of files.
	 */
	async detectNoChanges(_wpId, _lastMtime) {
		// Implementation for later: check file system for modifications
		// For now placeholder
		return false;
	}
}

module.exports = { CircuitBreaker };
