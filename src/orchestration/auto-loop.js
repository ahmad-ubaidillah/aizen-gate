const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const yaml = require("js-yaml");
const { WorktreeManager } = require("./worktree-manager");
const { CircuitBreaker } = require("./circuit-breaker");
const { ContextEngine } = require("../memory/context-engine");
const { TaskCLI } = require("../tasks/task-cli");

/**
 * Aizen-Gate Autonomous Shield
 * The engine that powers the parallel implementation wave.
 */
async function runAutoLoop(projectRoot) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Entering Autonomous Loop (Parallel Mode) ---\n"));

	const tasksDir = path.join(projectRoot, "backlog", "tasks");
	if (!fs.existsSync(tasksDir)) {
		console.log(chalk.red('[Aizen] No tasks found. Run "npx aizen-gate task create" to start.'));
		return;
	}

	try {
		const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
		const tasks = [];

		for (const f of files) {
			const content = fs.readFileSync(path.join(tasksDir, f), "utf8");
			const match = content.match(/---\n([\s\S]*?)\n---([\s\S]*)/);
			if (match) {
				const fm = yaml.load(match[1]);
				const body = match[2];
				// Extract description section or fallback to first 200 chars
				const descMatch = body.match(/## Description\s+([\s\S]*?)(##|\n\n\n)/);
				const description = descMatch ? descMatch[1].trim() : body.trim().slice(0, 500);

				tasks.push({
					id: fm.id,
					title: fm.title || fm.id,
					filename: f,
					status: fm.status || "Todo",
					assignee: fm.assignee || "@none",
					description,
				});
			}
		}

		const executableTasks = tasks.filter(
			(t) => t.status.toLowerCase().replace(/\s/g, "") === "todo",
		);

		if (executableTasks.length === 0) {
			const blocked = tasks.filter((t) => t.status === "Doing").length > 0;
			if (blocked) {
				console.log(
					chalk.yellow(`[Aizen] Pending tasks are currently "Doing". Wait for them to finish.`),
				);
			} else {
				console.log(chalk.green("[Aizen] No pending tasks found. Shield state COMPLETE! ⛩️"));
			}
			return { success: true, finished: true };
		}

		console.log(
			`[Aizen] 🌊 Parallel Wave Identified: ${executableTasks.map((t) => t.id).join(", ")}`,
		);

		const wtManager = new WorktreeManager(projectRoot);
		const circuitBreaker = new CircuitBreaker(projectRoot, 3);
		const cli = new TaskCLI(projectRoot);
		const contextEngine = new ContextEngine(projectRoot);

		for (const task of executableTasks) {
			if (circuitBreaker.isTripped(task.id)) {
				console.log(chalk.red(`\n[CB] 🛑 Circuit Tripped for ${task.id}: Max retries exceeded.`));
				continue;
			}

			console.log(chalk.cyan(`\n>> Dispatching ${task.id}`));

			circuitBreaker.recordAttempt(task.id);
			await cli.edit(task.id, { status: "In Progress" });

			try {
				// 1. Create Git Worktree for isolation
				const wtPath = wtManager.createWorktree("backlog", task.id, null);

				// 2. [AIZEN-019] Fresh Context Isolation
				// Assemble only relevant artifacts and memories for this specific task
				const fullTask = tasks.find((t) => t.id === task.id);
				const taskObj = {
					id: task.id,
					title: fullTask?.title || task.id,
					content: fullTask?.description || "Complete implementation.",
				};

				// Root is used as fallback featureDir
				const context = await contextEngine.assembleWPContext(projectRoot, taskObj);
				const xmlPrompt = await contextEngine.formatXMLPrompt(taskObj, context);

				const wpFilePath = path.join(wtPath, "WORK_PACKAGE.md");
				await fs.writeFile(wpFilePath, xmlPrompt);

				console.log(chalk.green(`   [Aizen] Created fresh isolated context: ${wpFilePath}`));
				console.log(`   [Aizen] Worktree Ready: ${wtPath}`);
			} catch (e) {
				console.log(chalk.red(`   [Aizen] Could not bootstrap ${task.id}: ${e.message}`));
			}
		}

		console.log(
			chalk.yellow(`\n[Aizen] Shield loop active. Subagents, please consume the tasks above.`),
		);
		return { success: true, wave: executableTasks };
	} catch (error) {
		console.error(chalk.red(`\n[Aizen] Shield error: ${error.message}`));
		return { success: false, error: error.message };
	}
}

// ⛩️ Signal Handlers for Session Persistence
const { pauseSession } = require("../session/session-manager");
process.on("SIGINT", async () => {
	console.log(chalk.yellow("\n[Aizen] SIGINT received. Initiating auto-pause..."));
	await pauseSession(process.cwd(), "Process SIGINT");
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log(chalk.yellow("\n[Aizen] SIGTERM received. Initiating auto-pause..."));
	await pauseSession(process.cwd(), "Process SIGTERM");
	process.exit(0);
});

module.exports = { runAutoLoop };
