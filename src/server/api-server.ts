import path from "node:path";
import chalk from "chalk";
import express from "express";
import fs from "fs-extra";
import { OrchestratorAPI } from "../orchestration/orchestrator-api.js";
import { TaskCLI } from "../tasks/task-cli.js";
import { logger } from "../utils/logger.js";
import { getMetrics, metricsMiddleware, prometheusExporter } from "../utils/metrics.js";

const app = express();
app.use(express.json());

// Metrics middleware
app.use(metricsMiddleware as any);

// Security headers
app.use((_req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Content-Security-Policy", "default-src 'self'");
	next();
});

// Simple rate limiting (100 requests per minute)
const rateLimit = new Map<string, { count: number; reset: number }>();
app.use((req, res, next) => {
	const ip = req.ip || req.connection.remoteAddress || "unknown";
	const now = Date.now();
	const windowMs = 60000;
	const maxRequests = 100;

	if (!rateLimit.has(ip)) {
		rateLimit.set(ip, { count: 1, reset: now + windowMs });
	} else {
		const data = rateLimit.get(ip)!;
		if (now > data.reset) {
			rateLimit.set(ip, { count: 1, reset: now + windowMs });
		} else if (data.count >= maxRequests) {
			return res.status(429).json({ error: "Too many requests" });
		} else {
			data.count++;
		}
	}
	next();
});

const projectRoot = process.cwd();
const api = new OrchestratorAPI(projectRoot);

/**
 * [AZ] Aizen-Gate Orchestrator API Server
 */

app.get("/api/status", async (_req, res) => {
	const _cli = new TaskCLI(projectRoot);
	// Simple state retrieval for dashboard
	res.json(api._envelope({ status: "active", platform: process.platform }));
});

app.get("/api/tasks", async (_req, res) => {
	const _cli = new TaskCLI(projectRoot);
	const tasksDir = path.join(projectRoot, "backlog", "tasks");
	if (!fs.existsSync(tasksDir)) {
		return res.json(api._envelope([]));
	}
	const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
	res.json(api._envelope(files));
});

app.post("/api/auto", async (_req, res) => {
	logger.info("[API] External trigger: auto-sprint");
	const result = await api.triggerAutoSprint();
	res.status(result.status).json(result);
});

app.post("/api/merge/:slug", async (req, res) => {
	const { slug } = req.params;
	logger.info(`[API] External trigger: merge feature ${slug}`);
	const result = await api.dispatchMerge(slug);
	res.status(result.status).json(result);
});

// Metrics endpoints
app.get("/api/metrics", (req, res) => {
	const format = req.query.format || "json";
	if (format === "prometheus") {
		res.set("Content-Type", "text/plain");
		res.send(prometheusExporter());
	} else {
		res.json(getMetrics());
	}
});

const PORT = process.env.AIZEN_API_PORT || 6421;
app.listen(PORT, () => {
	console.log(
		chalk.red.bold(`\n--- ⛩️ [AZ] Orchestrator API Active: http://localhost:${PORT} ---\n`),
	);
});
