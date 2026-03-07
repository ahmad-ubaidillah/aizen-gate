const express = require("express");
const { OrchestratorAPI } = require("../orchestration/orchestrator-api");
const chalk = require("chalk");
const path = require("node:path");

const app = express();
app.use(express.json());

const projectRoot = process.cwd();
const api = new OrchestratorAPI(projectRoot);

/**
 * [AZ] Aizen-Gate Orchestrator API Server
 */

app.get("/api/status", async (_req, res) => {
	const { TaskCLI } = require("../tasks/task-cli");
	const _cli = new TaskCLI(projectRoot);
	// Simple state retrieval for dashboard
	res.json(api._envelope({ status: "active", platform: process.platform }));
});

app.get("/api/tasks", async (_req, res) => {
	const { TaskCLI } = require("../tasks/task-cli");
	const _cli = new TaskCLI(projectRoot);
	const tasksDir = path.join(projectRoot, "backlog", "tasks");
	const files = require("fs-extra")
		.readdirSync(tasksDir)
		.filter((f) => f.endsWith(".md"));
	res.json(api._envelope(files));
});

app.post("/api/auto", async (_req, res) => {
	console.log(chalk.red("[API] External trigger: auto-sprint"));
	const result = await api.triggerAutoSprint();
	res.status(result.status).json(result);
});

app.post("/api/merge/:slug", async (req, res) => {
	const { slug } = req.params;
	console.log(chalk.red(`[API] External trigger: merge feature ${slug}`));
	const result = await api.dispatchMerge(slug);
	res.status(result.status).json(result);
});

const PORT = process.env.AIZEN_API_PORT || 6421;
app.listen(PORT, () => {
	console.log(
		chalk.red.bold(`\n--- ⛩️ [AZ] Orchestrator API Active: http://localhost:${PORT} ---\n`),
	);
});
