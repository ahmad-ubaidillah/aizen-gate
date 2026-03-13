import fs from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import chalk from "chalk";
import { Hono } from "hono";
import { OrchestratorAPI } from "../orchestration/orchestrator-api.js";
import { logger } from "../utils/logger.js";
import { getMetrics, prometheusExporter } from "../utils/metrics.js";

const app = new Hono();

// Security headers middleware
app.use("*", async (c, next) => {
	c.res.headers.set("X-Content-Type-Options", "nosniff");
	c.res.headers.set("X-Frame-Options", "DENY");
	c.res.headers.set("X-XSS-Protection", "1; mode=block");
	c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	c.res.headers.set("Content-Security-Policy", "default-src 'self'");
	await next();
});

// Simple rate limiting (manual implementation for Hono)
const rateLimit = new Map<string, { count: number; reset: number }>();
app.use("*", async (c, next) => {
	const ip = "unknown"; // Implementation detail for node-server
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
			return c.json({ error: "Too many requests" }, 429);
		} else {
			data.count++;
		}
	}
	await next();
});

const projectRoot = process.cwd();
const api = new OrchestratorAPI(projectRoot);

/**
 * [AZ] Aizen-Gate Orchestrator API Server (Hono Edition)
 */

app.get("/api/status", async (c) => {
	return c.json(api._envelope({ status: "active", platform: process.platform }));
});

app.get("/api/tasks", async (c) => {
	const tasksDir = path.join(projectRoot, "backlog", "tasks");
	if (!fs.existsSync(tasksDir)) {
		return c.json(api._envelope([]));
	}
	const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md"));
	return c.json(api._envelope(files));
});

app.post("/api/auto", async (c) => {
	logger.info("[API] External trigger: auto-sprint");
	const result = await api.triggerAutoSprint();
	return c.json(result, result.status as any);
});

app.post("/api/merge/:slug", async (c) => {
	const slug = c.req.param("slug");
	logger.info(`[API] External trigger: merge feature ${slug}`);
	const result = await api.dispatchMerge(slug);
	return c.json(result, result.status as any);
});

// Metrics endpoints
app.get("/api/metrics", (c) => {
	const format = c.req.query("format") || "json";
	if (format === "prometheus") {
		return c.text(prometheusExporter());
	} else {
		return c.json(getMetrics());
	}
});

const PORT = Number(process.env.AIZEN_API_PORT) || 6421;

console.log(chalk.red.bold(`\n--- ⛩️ [AZ] Orchestrator API Active: http://localhost:${PORT} ---\n`));

serve({
	fetch: app.fetch,
	port: PORT,
});
