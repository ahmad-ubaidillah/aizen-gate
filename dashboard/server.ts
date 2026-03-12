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
	private kanbanDirs: string[];
	// private boardPath: string; // Unused in current implementation
	private watcher: fs.FSWatcher | null = null;

	constructor(projectDir: string = process.cwd(), port: number = 6420) {
		this.projectDir = projectDir;
		this.port = port;
		this.app = express();
		this.server = http.createServer(this.app);
		this.wss = new WebSocketServer({ server: this.server });
		this.tasksDir = path.join(this.projectDir, "kanban", "backlog", "tasks"); // Legacy
		this.kanbanDirs = ["kanban/backlog", "kanban/dev", "kanban/test", "kanban/done"];

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
		const tasks: Task[] = [];
		const allDirs = [...this.kanbanDirs, "kanban/backlog/tasks"];

		for (const dirName of allDirs) {
			const absDir = path.join(this.projectDir, dirName);
			if (!fs.existsSync(absDir)) continue;

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
				// Find task in any dir
				let sourcePath: string | null = null;
				const allDirs = [...this.kanbanDirs, "kanban/backlog/tasks"];
				for (const dir of allDirs) {
					const absDir = path.join(this.projectDir, dir);
					if (!fs.existsSync(absDir)) continue;
					const files = fs.readdirSync(absDir);
					const fileName = files.find((f) => f.toLowerCase().includes((taskId as string).toLowerCase()));
					if (fileName) {
						sourcePath = path.join(absDir, fileName);
						break;
					}
				}

				if (!sourcePath) {
					res.status(404).json({ error: "Task not found" });
					return;
				}

				const targetDir = this.getDirFromStatus(status);
				const targetPath = path.join(this.projectDir, "kanban", targetDir, path.basename(sourcePath));

				// Physical Move
				if (sourcePath !== targetPath) {
					await fs.ensureDir(path.dirname(targetPath));
					await fs.move(sourcePath, targetPath, { overwrite: true });
				}

				// Update content status too
				let content = fs.readFileSync(targetPath, "utf8");
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
					fs.writeFileSync(targetPath, content);

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
