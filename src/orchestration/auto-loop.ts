import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import yaml from "js-yaml";
import { DashboardService } from "../../dashboard/dashboard-service.js";
import { ContextEngine } from "../memory/context-engine.js";
import { TaskCLI } from "../tasks/task-cli.js";
import { CircuitBreaker } from "./circuit-breaker.js";
import { getPulseOrchestrator } from "./pulse-orchestrator.js";
import { WorktreeManager } from "./worktree-manager.js";

/**
 * Aizen-Gate Autonomous Shield
 * The engine that powers the parallel implementation wave.
 */
export async function runAutoLoop(projectRoot: string) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Entering Autonomous Loop (Parallel Mode) ---\n"));

	const tasksDir = path.join(projectRoot, "backlog", "tasks");
	if (!fs.existsSync(tasksDir)) {
		console.log(chalk.red('[Aizen] No tasks found. Run "npx aizen-gate task create" to start.'));
		return;
	}

	try {
		const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
		const tasks: any[] = [];

		for (const f of files) {
			const content = fs.readFileSync(path.join(tasksDir, f), "utf8");
			const match = content.match(/---\n([\s\S]*?)\n---([\s\S]*)/);
			if (match) {
				const fm = yaml.load(match[1]) as any;
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

		const feed = DashboardService.getInstance();
		feed.emitThought(
			"Orchestrator",
			`🌊 Parallel Wave Identified: ${executableTasks.map((t) => t.id).join(", ")}`,
		);

		const _wtManager = new WorktreeManager(projectRoot);
		const circuitBreaker = new CircuitBreaker(projectRoot, 3);
		const cli = new TaskCLI(projectRoot);
		const _contextEngine = new ContextEngine(projectRoot);
		const orchestrator = getPulseOrchestrator(projectRoot);

		for (const task of executableTasks) {
			if (circuitBreaker.isTripped(task.id)) {
				const reason = circuitBreaker.getTripReason(task.id) || "UNKNOWN_ERROR";
				console.log(chalk.red(`\n[CB] 🛑 Circuit Tripped for ${task.id}: ${reason}`));
				continue;
			}

			console.log(chalk.cyan(`\n>> Initiating Pulse v2 Cycle for ${task.id}`));

			// For Phase 25 demo, we simulate a WRITE action from the task
			const payload = {
				path: `src/${task.id}.ts`,
				content: `// Auto-generated implementation for ${task.title}\nexport const ${task.id.replace(/-/g, "")} = () => console.log("${task.title}");`,
			};

			circuitBreaker.recordAttempt(task.id);
			const success = await orchestrator.executeCycle(task.id, "WRITE", payload);

			if (success) {
				await cli.edit(task.id, { status: "Review" });
				feed.emitTaskUpdate(task.id, "Review", `Implementation complete. Waiting for user review.`);
			} else {
				circuitBreaker.recordFailure(task.id, "Pulse v2 Cycle Failed");
				await cli.edit(task.id, { status: "Blocked (Pulse Failure)" });
			}
		}

		console.log(
			chalk.yellow(`\n[Aizen] Shield loop active. Subagents, please consume the tasks above.`),
		);
		return { success: true, wave: executableTasks };
	} catch (error) {
		console.error(chalk.red(`\n[Aizen] Shield error: ${(error as Error).message}`));
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Register signal handlers for graceful shutdown
 * Call this explicitly when starting the autonomous loop
 */
export function registerSignalHandlers() {
	process.on("SIGINT", async () => {
		const { pauseSession } = await import("../session/session-manager.js");
		console.log(chalk.yellow("\n[Aizen] SIGINT received. Initiating auto-pause..."));
		await pauseSession(process.cwd(), "Process SIGINT");
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		const { pauseSession } = await import("../session/session-manager.js");
		console.log(chalk.yellow("\n[Aizen] SIGTERM received. Initiating auto-pause..."));
		await pauseSession(process.cwd(), "Process SIGTERM");
		process.exit(0);
	});

	console.log(chalk.gray("[Aizen] Signal handlers registered for graceful shutdown"));
}
