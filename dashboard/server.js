const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");

class DashboardServer {
	constructor(projectDir = process.cwd(), port = 6420) {
		this.projectDir = projectDir;
		this.port = port;
		this.app = express();
		this.server = http.createServer(this.app);
		this.wss = new WebSocket.Server({ server: this.server });
		this.tasksDir = path.join(this.projectDir, "backlog", "tasks");
		this.boardPath = path.join(this.projectDir, "aizen-gate", "shared", "board.md");
		this.watcher = null;

		fs.ensureDirSync(this.tasksDir);

		this.app.use(express.static(path.join(__dirname, "public")));
		this.app.use(express.json());

		this.setupRoutes();
		this.setupWebSockets();
	}

	async loadAllTasks() {
		const files = fs.readdirSync(this.tasksDir).filter((f) => f.endsWith(".md"));
		const tasks = [];

		for (const f of files) {
			try {
				const content = fs.readFileSync(path.join(this.tasksDir, f), "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);
				const titleMatch = content.match(/# (.*)/);

				if (match) {
					const fm = yaml.load(match[1]);
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
			} catch (e) {
				console.error(`Failed to load task ${f}`, e);
			}
		}
		return tasks;
	}

	setupRoutes() {
		this.app.get("/api/tasks", async (req, res) => {
			try {
				const tasks = await this.loadAllTasks();
				res.json(tasks);
			} catch (e) {
				res.status(500).json({ error: e.message });
			}
		});

		this.app.post("/api/tasks/:taskId/move", async (req, res) => {
			const { status } = req.body;
			const { taskId } = req.params;

			try {
				const files = fs.readdirSync(this.tasksDir);
				const targetFile = files.find((f) => f.toLowerCase().includes(taskId.toLowerCase()));

				if (!targetFile) return res.status(404).json({ error: "Task not found" });

				const filePath = path.join(this.tasksDir, targetFile);
				let content = fs.readFileSync(filePath, "utf8");
				const match = content.match(/---\n([\s\S]*?)\n---/);

				if (match) {
					const fm = yaml.load(match[1]);
					const oldStatus = fm.status;
					fm.status = status;
					content = content.replace(match[0], `---\n${yaml.dump(fm)}---`);
					fs.writeFileSync(filePath, content);

					res.json({ success: true, taskId, status });
					this.broadcastUpdate(`Task ${taskId} moved from ${oldStatus} to ${status}`);

					// Note: in a full implementation we'd also update board.md here.
				}
			} catch (e) {
				res.status(500).json({ error: e.message });
			}
		});
	}

	setupWebSockets() {
		this.wss.on("connection", (ws) => {
			ws.isAlive = true;
			ws.on("pong", () => (ws.isAlive = true));

			ws.on("message", (message) => {
				try {
					const data = JSON.parse(message);
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
			this.wss.clients.forEach(function each(ws) {
				if (ws.isAlive === false) return ws.terminate();
				ws.isAlive = false;
				ws.ping();
			});
		}, 30000);
		this.wss.on("close", () => clearInterval(interval));
	}

	watchTasks() {
		if (this.watcher) return;

		let timeout = null;
		this.watcher = fs.watch(this.tasksDir, (eventType, filename) => {
			if (filename && filename.endsWith(".md")) {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					this.broadcastUpdate(`File change detected: ${filename}`);
				}, 150);
			}
		});
	}

	async broadcastUpdate(eventMessage = null) {
		const payload = { type: "update", data: [], event: eventMessage };
		try {
			payload.data = await this.loadAllTasks();
		} catch (e) {
			console.error("[Dashboard] Failed to read tasks:", e.message);
		}

		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(payload));
			}
		});
	}

	start() {
		this.server.listen(this.port, () => {
			console.log(`\n[SA] 🚀 Dashboard Server running at http://localhost:${this.port}`);
		});
	}
}

module.exports = { DashboardServer };
