/**
 * [AZ] Lifecycle Manager
 * Manages auto-start, idle shutdown, and pause/resume hooks.
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { pauseSession, resumeSession } from "./session-manager.js";

/**
 * Lifecycle state
 */
export interface LifecycleState {
	last_activity: number;
	pid: number;
	status: "active" | "paused";
	reason?: string;
}

/**
 * [AZ] Lifecycle Manager
 */
export class LifecycleManager {
	public projectRoot: string;
	public statePath: string;
	public idleTimeout: number;
	public checkInterval: number;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.statePath = path.join(projectRoot, "shared", "lifecycle.json");
		this.idleTimeout = 30 * 60 * 1000; // 30 minutes
		this.checkInterval = 5 * 60 * 1000; // 5 minutes
	}

	async wake(): Promise<void> {
		const handoffPath = path.join(this.projectRoot, "shared", "handoff.md");
		if (fs.existsSync(handoffPath)) {
			console.log(chalk.blue("[AZ] Detected paused session. Auto-resuming..."));
			await resumeSession(this.projectRoot);
		}
		await this.recordActivity();
	}

	async recordActivity(): Promise<void> {
		const now = Date.now();
		const data: LifecycleState = {
			last_activity: now,
			pid: process.pid,
			status: "active",
		};
		const dir = path.dirname(this.statePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		await fsPromises.writeFile(this.statePath, JSON.stringify(data, null, 2));
	}

	async checkIdle(): Promise<void> {
		if (!fs.existsSync(this.statePath)) return;

		const data = JSON.parse(await fsPromises.readFile(this.statePath, "utf8")) as LifecycleState;
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
			await fsPromises.writeFile(
				this.statePath,
				JSON.stringify({ ...data, status: "paused", reason: "manual-testing" }, null, 2),
			);
			return;
		}

		if (data.status === "active" && now - data.last_activity > this.idleTimeout) {
			console.log(chalk.yellow(`\n[AZ] Idle for >30m. Auto-shutting down to save resources...`));
			await pauseSession(this.projectRoot, "Auto-shutdown on idle");
			await fsPromises.writeFile(
				this.statePath,
				JSON.stringify({ ...data, status: "paused", reason: "idle" }, null, 2),
			);
		}
	}

	/**
	 * Check if common dev ports are in use (indicates manual testing).
	 * SECURITY: Uses spawn with args array to prevent command injection.
	 */
	async isAppRunning(): Promise<boolean> {
		const { spawn } = await import("node:child_process");
		try {
			// Common dev ports - validated to be integers in range 1-65535
			const ports = [3000, 5173, 8000, 8080];

			for (const port of ports) {
				// SECURITY: Validate port number
				if (!Number.isInteger(port) || port < 1 || port > 65535) {
					console.warn(`[LifecycleManager] Invalid port skipped: ${port}`);
					continue;
				}

				try {
					const isPortInUse = await new Promise<boolean>((resolve) => {
						// SECURITY: Use spawn with args array instead of execSync with interpolation
						// This prevents command injection even if port were user-controlled
						const proc = spawn("lsof", ["-i", `:${port}`], {
							timeout: 5000,
						});

						let output = "";
						proc.stdout.on("data", (data) => {
							output += data.toString();
						});

						proc.on("close", (code) => {
							// lsof returns 0 if found, 1 if not found
							resolve(code === 0 && output.length > 0);
						});

						proc.on("error", () => {
							resolve(false);
						});
					});

					if (isPortInUse) return true;
				} catch {
					// Port not in use or lsof failed
				}
			}
			return false;
		} catch {
			return false;
		}
	}

	/**
	 * Watch for external processes (mock implementation)
	 * In a real system, this would monitor the process tree for 'npm start' etc.
	 */
	async monitorExternalTasks(): Promise<void> {
		// This could be called periodically or hooked into shell events
	}
}
