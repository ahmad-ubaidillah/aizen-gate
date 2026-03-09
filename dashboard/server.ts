import express, { type Request, type Response, type NextFunction } from "express";
import http from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import path from "node:path";
import fs from "fs-extra";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export class DashboardServer {
	private projectDir: string;
	private port: number;
	private app: express.Application;
	private server: http.Server;
	private wss: WebSocketServer;
	private tasksDir: string;
	// private boardPath: string; // Unused in current implementation
	private watcher: fs.FSWatcher | null = null;

	constructor(projectDir: string = process.cwd(), port: number = 6420) {
		this.projectDir = projectDir;
		this.port = port;
		this.app = express();
		this.server = http.createServer(this.app);
		this.wss = new WebSocketServer({ server: this.server });
		this.tasksDir = path.join(this.projectDir, "backlog", "tasks");
		// this.boardPath = path.join(this.projectDir, "aizen-gate", "shared", "board.md");

		fs.ensureDirSync(this.tasksDir);

		this.app.use(express.static(path.join(__dirname, "public")));
		this.app.use(express.json());

		// Security headers
		this.app.use((_req: Request, res: Response, next: NextFunction) => {
			res.setHeader("X-Content-Type-Options", "nosniff");
			res.setHeader("X-Frame-Options", "DENY");
			res.setHeader("X-XSS-Protection", "1; mode=block");
			res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
			next();
		});

		// Simple rate limiting (100 requests per minute)
		const rateLimit = new Map<string, { count: number; reset: number }>();
		this.app.use((req: Request, res: Response, next: NextFunction) => {
			const ip = (req.ip || req.get("x-forwarded-for") || req.socket.remoteAddress || "unknown").toString();
			const now = Date.now();
			const windowMs = 60000;
			const maxRequests = 100;

			const data = rateLimit.get(ip);
			if (!data) {
				rateLimit.set(ip, { count: 1, reset: now + windowMs });
			} else {
				if (now > data.reset) {
					rateLimit.set(ip, { count: 1, reset: now + windowMs });
				} else if (data.count >= maxRequests) {
					res.status(429).json({ error: "Too many requests" });
					return;
				} else {
					data.count++;
				}
			}
			next();
		});

		this.setupRoutes();
		this.setupWebSockets();
	}

	async loadAllTasks(): Promise<Task[]> {
		if (!fs.existsSync(this.tasksDir)) return [];
		const files = fs.readdirSync(this.tasksDir).filter((f) => f.endsWith(".md"));
		const tasks: Task[] = [];

		for (const f of files) {
			try {
				const content = fs.readFileSync(path.join(this.tasksDir, f), "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);
				const titleMatch = content.match(/# (.*)/);

				if (match) {
					const fm = yaml.load(match[1]) as any;
					tasks.push({
						id: fm.id,
						filename: f,
						title: titleMatch ? titleMatch[1] : fm.id,
						status: fm.status || "Todo",
						priority: fm.priority || "medium",
						assignee: fm.assignee || "@none",
						labels: fm.labels || [],
					});
				}
			} catch (e: any) {
				console.error(`Failed to load task ${f}`, e.message);
			}
		}
		return tasks;
	}

	private setupRoutes(): void {
		this.app.get("/api/tasks", async (_req: Request, res: Response) => {
			try {
				const tasks = await this.loadAllTasks();
				res.json(tasks);
			} catch (e: any) {
				res.status(500).json({ error: e.message });
			}
		});

		this.app.post("/api/tasks/:taskId/move", async (req: Request, res: Response) => {
			const { status } = req.body;
			const { taskId } = req.params;

			try {
				const files = fs.readdirSync(this.tasksDir);
				const targetFile = files.find((f) => f.toLowerCase().includes((taskId as string).toLowerCase()));

				if (!targetFile) {
					res.status(404).json({ error: "Task not found" });
					return;
				}

				const filePath = path.join(this.tasksDir, targetFile);
				let content = fs.readFileSync(filePath, "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);

				if (match) {
					let fm: any;
					try {
						fm = yaml.load(match[1]);
					} catch (_yamlErr) {
						res.status(400).json({ error: "Invalid YAML in task file" });
						return;
					}
					const oldStatus = fm.status;
					fm.status = status;
					const newFm = yaml.dump(fm);
					content = content.replace(match[0], `---\n${newFm}---`);
					fs.writeFileSync(filePath, content);

					res.json({ success: true, taskId, status });
					this.broadcastUpdate(`Task ${taskId} moved from ${oldStatus} to ${status}`);
				} else {
					res.status(400).json({ error: "No frontmatter found in task file" });
				}
			} catch (e: any) {
				res.status(500).json({ error: e.message });
			}
		});
	}

	private setupWebSockets(): void {
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
			this.wss.clients.forEach((client) => {
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
		this.watcher = fs.watch(this.tasksDir, (_eventType, filename) => {
			if (filename?.endsWith(".md")) {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					this.broadcastUpdate(`File change detected: ${filename}`);
				}, 150);
			}
		});
	}

	async broadcastUpdate(eventMessage: string | null = null): Promise<void> {
		const payload = { type: "update", data: [] as Task[], event: eventMessage };
		try {
			payload.data = await this.loadAllTasks();
		} catch (e: any) {
			console.error("[Dashboard] Failed to read tasks:", e.message);
		}

		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(payload));
			}
		});
	}

	start(): void {
		this.server.listen(this.port, () => {
			console.log(`\n[SA] 🚀 Dashboard Server running at http://localhost:${this.port}`);
		});
	}
}
