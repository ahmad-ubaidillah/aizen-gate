/**
 * Session CLI Commands
 */
import type { Command } from "commander";

interface SessionOptions {
	port?: string;
}

/**
 * Register session commands
 */
export function registerSession(program: Command): void {
	// Pause
	program
		.command("pause")
		.description("Pause the current session and save environment state")
		.action(async () => {
			const { pauseSession } = await import("../../src/session/session-manager.js");
			await pauseSession(process.cwd());
		});

	// Resume
	program
		.command("resume")
		.description("Resume a previously paused session")
		.action(async () => {
			const { resumeSession } = await import("../../src/session/session-manager.js");
			await resumeSession(process.cwd());
		});

	// Dashboard
	program
		.command("dashboard")
		.description("Launch the live Kanban dashboard server")
		.option("-p, --port <number>", "Port to run the dashboard on", "6420")
		.action(async (options: SessionOptions) => {
			const { SkillWatcher } = await import("../../src/utils/skill-watcher.js");
			const { DashboardServer } = await import("../../dashboard/server.js");
			const watcher = new SkillWatcher(process.cwd()) as any;
			watcher.start();
			const server = new DashboardServer(
				process.cwd(),
				parseInt(options.port || "6420", 10),
			) as any;
			server.start();
		});
}
