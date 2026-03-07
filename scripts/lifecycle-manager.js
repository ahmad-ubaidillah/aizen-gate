const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const { pauseSession, resumeSession } = require("./session-manager");

/**
 * [AZ] Lifecycle Manager
 * Manages auto-start, idle shutdown, and pause/resume hooks.
 */
class LifecycleManager {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.statePath = path.join(projectRoot, "aizen-gate", "shared", "lifecycle.json");
		this.idleTimeout = 30 * 60 * 1000; // 30 minutes
		this.checkInterval = 5 * 60 * 1000; // 5 minutes
	}

	async wake() {
		const handoffPath = path.join(this.projectRoot, "aizen-gate", "shared", "handoff.md");
		if (fs.existsSync(handoffPath)) {
			console.log(chalk.blue("[AZ] Detected paused session. Auto-resuming..."));
			await resumeSession(this.projectRoot);
		}
		await this.recordActivity();
	}

	async recordActivity() {
		const now = Date.now();
		const data = {
			last_activity: now,
			pid: process.pid,
			status: "active",
		};
		await fs.ensureDir(path.dirname(this.statePath));
		await fs.writeJson(this.statePath, data);
	}

	async checkIdle() {
		if (!fs.existsSync(this.statePath)) return;

		const data = await fs.readJson(this.statePath);
		const now = Date.now();

		// Check if app is running (Manual Testing Detection)
		const appRunning = await this.isAppRunning();
		if (appRunning && data.status === "active") {
			console.log(
				chalk.yellow(
					`[AZ] Detected manual testing (Port active or process running). Auto-pausing Aizen...`,
				),
			);
			await pauseSession(this.projectRoot, "Auto-pause for manual testing");
			await fs.writeJson(this.statePath, { ...data, status: "paused", reason: "manual-testing" });
			return;
		}

		if (data.status === "active" && now - data.last_activity > this.idleTimeout) {
			console.log(chalk.yellow(`\n[AZ] Idle for >30m. Auto-shutting down to save resources...`));
			await pauseSession(this.projectRoot, "Auto-shutdown on idle");
			await fs.writeJson(this.statePath, { ...data, status: "paused", reason: "idle" });
		}
	}

	async isAppRunning() {
		const { execSync } = require("node:child_process");
		try {
			// Common dev ports
			const ports = [3000, 5173, 8000, 8080];
			for (const port of ports) {
				try {
					const res = execSync(`lsof -i :${port}`, { stdio: "pipe" });
					if (res.toString().length > 0) return true;
				} catch (_e) {}
			}
			return false;
		} catch (_e) {
			return false;
		}
	}

	/**
	 * Watch for external processes (mock implementation)
	 * In a real system, this would monitor the process tree for 'npm start' etc.
	 */
	async monitorExternalTasks() {
		// This could be called periodically or hooked into shell events
	}
}

module.exports = { LifecycleManager };
