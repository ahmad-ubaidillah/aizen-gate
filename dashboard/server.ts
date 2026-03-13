import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import http from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import path from "node:path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { getMeshRelay } from "../src/orchestration/mesh-relay.js";
import { getCheckpointManager } from "../src/orchestration/checkpoint-manager.js";

interface Task {
	id: string;
	filename: string;
	title: string;
	status: string;
	priority: string;
	assignee: string;
	labels: string[];
}

interface WebSocketClient extends WebSocket {
	isAlive?: boolean;
}

import { DashboardService } from "./dashboard-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DashboardServer {
	private projectDir: string;
	private port: number;
	private app: Hono;
	private server: http.Server | null = null;
	private wss: WebSocketServer | null = null;
	private tasksDir: string;
	private kanbanDirs: string[];
	private watcher: fs.FSWatcher | null = null;
	private swarmFeed: DashboardService;

	constructor(projectDir: string = process.cwd(), port: number = 6420) {
		this.projectDir = projectDir;
		this.port = port;
		this.app = new Hono();
		this.tasksDir = path.join(this.projectDir, "kanban", "backlog", "tasks");
		this.kanbanDirs = ["kanban/backlog", "kanban/dev", "kanban/test", "kanban/done"];
		this.swarmFeed = DashboardService.getInstance();

		if (!fs.existsSync(this.tasksDir)) {
			fs.mkdirSync(this.tasksDir, { recursive: true });
		}

		// Security and Middleware
		this.app.use("*", async (c, next) => {
			c.res.headers.set("X-Content-Type-Options", "nosniff");
			c.res.headers.set("X-Frame-Options", "DENY");
			c.res.headers.set("X-XSS-Protection", "1; mode=block");
			c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
			await next();
		});

		// Static files
		this.app.use("/static/*", serveStatic({ root: "./dashboard/public" }));

		this.setupRoutes();
	}

	async loadAllTasks(): Promise<Task[]> {
		const tasks: Task[] = [];
		const allDirs = [...this.kanbanDirs, "kanban/backlog/tasks"];

		for (const dirName of allDirs) {
			const absDir = path.join(this.projectDir, dirName);
			if (!fs.existsSync(absDir)) continue;

			try {
				const files = fs.readdirSync(absDir).filter((f) => f.endsWith(".md"));
				for (const f of files) {
					try {
						const content = fs.readFileSync(path.join(absDir, f), "utf8");
						const match = content.match(/---\n([\s\S]*?)\n---/);
						const titleMatch = content.match(/# (.*)/);

						if (match) {
							const fm = yaml.load(match[1]) as any;
							tasks.push({
								id: fm.id,
								filename: f,
								title: titleMatch ? titleMatch[1] : fm.id,
								status: fm.status || this.getStatusFromDir(dirName),
								priority: fm.priority || "medium",
								assignee: fm.assignee || "@none",
								labels: fm.labels || [],
							});
						}
					} catch (e: any) {
						console.error(`Failed to load task ${f} from ${dirName}`, e.message);
					}
				}
			} catch (e: any) {
				console.error(`Failed to read directory ${dirName}`, e.message);
			}
		}
		return tasks;
	}

	private getStatusFromDir(dir: string): string {
		if (dir.includes("dev")) return "In Progress";
		if (dir.includes("test")) return "Review";
		if (dir.includes("done")) return "Done";
		return "Todo";
	}

	private setupRoutes(): void {
		this.app.get("/api/tasks", async (c) => {
			try {
				const tasks = await this.loadAllTasks();
				return c.json(tasks);
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});

		this.app.post("/api/tasks/:taskId/move", async (c) => {
			const { status } = await c.req.json();
			const taskId = c.req.param("taskId");

			try {
				let sourcePath: string | null = null;
				const allDirs = [...this.kanbanDirs, "kanban/backlog/tasks"];
				for (const dir of allDirs) {
					const absDir = path.join(this.projectDir, dir);
					if (!fs.existsSync(absDir)) continue;
					const files = fs.readdirSync(absDir);
					const fileName = files.find((f) => f.toLowerCase().includes(taskId.toLowerCase()));
					if (fileName) {
						sourcePath = path.join(absDir, fileName);
						break;
					}
				}

				if (!sourcePath) {
					return c.json({ error: "Task not found" }, 404);
				}

				const targetDir = this.getDirFromStatus(status);
				const targetPath = path.join(this.projectDir, "kanban", targetDir, path.basename(sourcePath));

				if (sourcePath !== targetPath) {
					const targetParent = path.dirname(targetPath);
					if (!fs.existsSync(targetParent)) {
						fs.mkdirSync(targetParent, { recursive: true });
					}
					await fsPromises.rename(sourcePath, targetPath);
				}

				let content = fs.readFileSync(targetPath, "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);

				if (match) {
					let fm = yaml.load(match[1]) as any;
					const oldStatus = fm.status;
					fm.status = status;
					const newFm = yaml.dump(fm);
					content = content.replace(match[0], `---\n${newFm}---`);
					fs.writeFileSync(targetPath, content);
					this.broadcastUpdate(`Task ${taskId} moved from ${oldStatus} to ${status}`);
					return c.json({ success: true, taskId, status });
				}
				return c.json({ error: "No frontmatter found" }, 400);
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});

		// Pulse Control API
		this.app.post("/api/pulse/trigger", async (c) => {
			try {
				const { runAutoLoop } = await import("../src/orchestration/auto-loop.js");
				const res = await runAutoLoop(this.projectDir);
				return c.json({ success: true, ...res });
			} catch (e: any) {
				return c.json({ success: false, error: e.message }, 500);
			}
		});

		this.app.post("/api/pulse/kill", async (c) => {
			try {
				const { execSync } = await import("child_process");
				const { WorktreeManager } = await import("../src/orchestration/worktree-manager.js");
				const wtManager = new WorktreeManager(this.projectDir);
				const worktrees = wtManager.listWorktrees();
				
				for (const wt of worktrees) {
					if (wt !== this.projectDir && wt.includes(".worktrees")) {
						try {
							execSync(`git worktree remove --force "${wt}"`, { cwd: this.projectDir });
						} catch (err) {
							console.error(`Failed to remove worktree: ${wt}`, err);
						}
					}
				}
				
				this.swarmFeed.emitThought("SYSTEM", "Emergency Kill Signal received. Cleaning up all active worktrees.", { type: "emergency" });
				return c.json({ success: true });
			} catch (e: any) {
				return c.json({ success: false, error: e.message }, 500);
			}
		});

		// Wisdom Sync API (Phase 20)
		this.app.get("/api/wisdom/export", async (c) => {
			try {
				const { getMemoryStore } = await import("../src/memory/memory-store.js");
				const store = getMemoryStore(this.projectDir);
				const seeds = store.exportWisdom();
				return c.json(seeds);
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});

		this.app.post("/api/wisdom/import", async (c) => {
			try {
				const seeds = await c.req.json();
				const { getMemoryStore } = await import("../src/memory/memory-store.js");
				const store = getMemoryStore(this.projectDir);
				const imported = store.importWisdom(seeds);
				this.swarmFeed.emitThought("WISDOM_SYNC", `Successfully imported ${imported} knowledge seeds from external source.`, { count: imported });
				return c.json({ success: true, imported });
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});

		// Skill Factory API (Phase 21)
		this.app.get("/api/factory/probe", async (c) => {
			try {
				const { getSkillFactory } = await import("../src/orchestration/skill-factory.js");
				const factory = getSkillFactory(this.projectDir);
				const patterns = await factory.detectPatterns();
				return c.json(patterns);
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});

		this.app.post("/api/factory/generate", async (c) => {
			try {
				const { action, target } = await c.req.json();
				const { getSkillFactory } = await import("../src/orchestration/skill-factory.js");
				const factory = getSkillFactory(this.projectDir);
				const skillPath = await factory.generateAizenSkill({ action, target });
				
				this.swarmFeed.emitThought("SKILL_FACTORY", `Forged new autonomous skill: ${path.basename(skillPath)}`, { action, target });
				
				return c.json({ success: true, path: skillPath });
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});

		this.app.get("/api/metrics", (c) => {
			const used = Math.floor(Math.random() * 5000) + 1000;
			return c.json({
				latency: Math.floor(Math.random() * 50) + 10,
				density: Math.floor(Math.random() * 100),
				tokens: { used, total: 100000 },
				iq: 120 + Math.floor(Math.random() * 15) // Phase 27: Swarm IQ
			});
		});

		// Phase 29: Checkpoint API
		this.app.post("/api/checkpoint/resolve", async (c) => {
			const { id, choice } = await c.req.json();
			getCheckpointManager().resolveCheckpoint(id, choice);
			return c.json({ success: true });
		});

		// Mesh Networking API (Phase 26)
		this.app.get("/api/mesh/nodes", (c) => {
			const mesh = getMeshRelay();
			return c.json(mesh.getNodes());
		});

		this.app.post("/api/mesh/register", async (c) => {
			try {
				const node = await c.req.json();
				const mesh = getMeshRelay();
				mesh.registerNode(node);
				return c.json({ success: true });
			} catch (e: any) {
				return c.json({ error: e.message }, 500);
			}
		});
	}

	private setupWebSockets(server: http.Server): void {
		this.wss = new WebSocketServer({ server });
		this.swarmFeed.attachServer(this.wss);
		
		this.wss.on("connection", (ws: WebSocketClient) => {
			ws.isAlive = true;
			ws.on("pong", () => (ws.isAlive = true));

			ws.on("message", (message) => {
				try {
					const data = JSON.parse(message.toString());
					if (data.type === "subscribe") {
						this.watchTasks();
						this.broadcastUpdate(`New client connected.`);
					}
				} catch (e) {
					console.error("[Dashboard] Error processing WS message:", e);
				}
			});
		});

		const interval = setInterval(() => {
			this.wss?.clients.forEach((client) => {
				const ws = client as WebSocketClient;
				if (ws.isAlive === false) return ws.terminate();
				ws.isAlive = false;
				ws.ping();
			});
		}, 30000);
		this.wss.on("close", () => clearInterval(interval));
	}

	private watchTasks(): void {
		if (this.watcher) return;

		let timeout: NodeJS.Timeout | null = null;
		const allDirs = [...this.kanbanDirs, "kanban/backlog/tasks"];
		
		for (const dir of allDirs) {
			const absDir = path.join(this.projectDir, dir);
			if (!fs.existsSync(absDir)) continue;
			
			fs.watch(absDir, (_eventType, filename) => {
				if (filename?.endsWith(".md")) {
					if (timeout) clearTimeout(timeout);
					timeout = setTimeout(() => {
						this.broadcastUpdate(`File change detected in ${dir}: ${filename}`);
					}, 150);
				}
			});
		}
	}

	private getDirFromStatus(status: string): string {
		switch (status.toLowerCase()) {
			case "in progress": return "dev";
			case "review": return "test";
			case "done": return "done";
			default: return "backlog";
		}
	}

	async broadcastUpdate(eventMessage: string | null = null): Promise<void> {
		const payload = { type: "update", data: [] as Task[], event: eventMessage };
		try {
			payload.data = await this.loadAllTasks();
		} catch (e: any) {
			console.error("[Dashboard] Failed to read tasks:", e.message);
		}

		this.wss?.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(payload));
			}
		});
	}

	start(): void {
		this.server = serve({
			fetch: this.app.fetch,
			port: this.port
		}, (info) => {
			console.log(`\n[SA] 🚀 Dashboard Server running at http://localhost:${info.port}`);
		}) as unknown as http.Server;
		
		this.setupWebSockets(this.server);
	}
}
