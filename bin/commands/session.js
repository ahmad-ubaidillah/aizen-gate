function registerSession(program) {
	// Pause
	program
		.command("pause")
		.description("Pause the current session and save environment state")
		.action(async () => {
			const { pauseSession } = require("../../src/session/session-manager");
			await pauseSession(process.cwd());
		});

	// Resume
	program
		.command("resume")
		.description("Resume a previously paused session")
		.action(async () => {
			const { resumeSession } = require("../../src/session/session-manager");
			await resumeSession(process.cwd());
		});

	// Dashboard
	program
		.command("dashboard")
		.description("Launch the live Kanban dashboard server")
		.option("-p, --port <number>", "Port to run the dashboard on", "6420")
		.action(async (options) => {
			const { SkillWatcher } = require("../../src/utils/skill-watcher");
			const { DashboardServer } = require("../../dashboard/server");
			const watcher = new SkillWatcher(process.cwd());
			watcher.start();
			const server = new DashboardServer(process.cwd(), options.port);
			server.start();
		});
}

module.exports = { registerSession };
