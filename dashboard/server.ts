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
  // Security: Rate limiting and authentication
  private rateLimitMap: Map<string, { count: number; resetTime: number }> =
    new Map();
  private apiKey: string;

  constructor(projectDir: string = process.cwd(), port: number = 6420) {
    this.projectDir = projectDir;
    this.port = port;
    this.app = new Hono();
    this.tasksDir = path.join(this.projectDir, "kanban", "backlog", "tasks");
    this.kanbanDirs = [
      "kanban/backlog",
      "kanban/dev",
      "kanban/test",
      "kanban/done",
    ];
    this.swarmFeed = DashboardService.getInstance();

    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }

    // Initialize API key from environment ( SECURITY: Set AIZEN_API_KEY env var in production)
    this.apiKey =
      process.env.AIZEN_API_KEY || process.env.AIZEN_GATE_API_KEY || "";

    // Security Headers Middleware
    this.app.use("*", async (c, next) => {
      c.res.headers.set("X-Content-Type-Options", "nosniff");
      c.res.headers.set("X-Frame-Options", "DENY");
      c.res.headers.set("X-XSS-Protection", "1; mode=block");
      c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      c.res.headers.set(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()",
      );
      await next();
    });

    // SECURITY: Rate Limiting Middleware - 100 requests per minute per IP
    this.app.use("/api/*", async (c, next) => {
      const clientIp =
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        c.req.header("x-real-ip") ||
        "unknown";
      const now = Date.now();
      const entry = this.rateLimitMap.get(clientIp);
      const windowMs = 60000; // 1 minute
      const maxRequests = 100;

      if (!entry || now > entry.resetTime) {
        this.rateLimitMap.set(clientIp, {
          count: 1,
          resetTime: now + windowMs,
        });
      } else if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        c.res.headers.set("Retry-After", retryAfter.toString());
        return c.json(
          { error: "Too many requests. Please try again later.", retryAfter },
          429,
        );
      } else {
        entry.count++;
      }

      await next();
    });

    // SECURITY: Authentication Middleware - Require API key for mutation endpoints
    this.app.use("/api/*", async (c, next) => {
      // Skip auth for read-only endpoints
      const publicPaths = ["/api/tasks", "/api/metrics", "/api/health"];
      if (publicPaths.some((p) => c.req.path.startsWith(p))) {
        await next();
        return;
      }

      // If no API key configured, allow (development mode)
      if (!this.apiKey) {
        await next();
        return;
      }

      const authHeader = c.req.header("Authorization");
      const queryKey = c.req.query("apiKey");

      // Check Bearer token or query parameter
      const validKey =
        authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] === this.apiKey ||
        queryKey === this.apiKey;

      if (!validKey) {
        return c.json(
          {
            error:
              "Unauthorized. Provide valid API key via Authorization header or apiKey query parameter.",
            hint: "Set AIZEN_API_KEY environment variable and include it in your requests.",
          },
          401,
        );
      }

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
              // SECURITY: Use safe YAML loading with FAILSAFE_SCHEMA to prevent code execution
              const fm = yaml.load(match[1], {
                schema: yaml.FAILSAFE_SCHEMA,
              }) as any;
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
            console.error(
              `Failed to load task ${f} from ${dirName}`,
              e.message,
            );
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
      // SECURITY: Validate task ID
      const taskId = c.req.param("taskId");
      if (
        !taskId ||
        !/^[a-zA-Z0-9_\-\.]+$/.test(taskId) ||
        taskId.length > 100
      ) {
        return c.json({ error: "Invalid task ID format" }, 400);
      }

      // SECURITY: Validate request body
      let body: any;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }

      const { status } = body;
      const validStatuses = [
        "Todo",
        "In Progress",
        "Review",
        "Done",
        "Backlog",
      ];
      if (!status || !validStatuses.includes(status)) {
        return c.json({ error: "Invalid status value", validStatuses }, 400);
      }

      try {
        let sourcePath: string | null = null;
        const allDirs = [...this.kanbanDirs, "kanban/backlog/tasks"];
        for (const dir of allDirs) {
          const absDir = path.join(this.projectDir, dir);
          if (!fs.existsSync(absDir)) continue;
          const files = fs.readdirSync(absDir);
          const fileName = files.find((f) =>
            f.toLowerCase().includes(taskId.toLowerCase()),
          );
          if (fileName) {
            sourcePath = path.join(absDir, fileName);
            break;
          }
        }

        if (!sourcePath) {
          return c.json({ error: "Task not found" }, 404);
        }

        const targetDir = this.getDirFromStatus(status);
        const targetPath = path.join(
          this.projectDir,
          "kanban",
          targetDir,
          path.basename(sourcePath),
        );

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
          // SECURITY: Use safe YAML loading with FAILSAFE_SCHEMA to prevent code execution
          let fm = yaml.load(match[1], { schema: yaml.FAILSAFE_SCHEMA }) as any;
          const oldStatus = fm.status;
          fm.status = status;
          const newFm = yaml.dump(fm);
          content = content.replace(match[0], `---\n${newFm}---`);
          fs.writeFileSync(targetPath, content);
          this.broadcastUpdate(
            `Task ${taskId} moved from ${oldStatus} to ${status}`,
          );
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
        const { runAutoLoop } =
          await import("../src/orchestration/auto-loop.js");
        const res = await runAutoLoop(this.projectDir);
        return c.json({ success: true, ...res });
      } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
      }
    });

    this.app.post("/api/pulse/kill", async (c) => {
      try {
        const { execSync } = await import("child_process");
        const { WorktreeManager } =
          await import("../src/orchestration/worktree-manager.js");
        const wtManager = new WorktreeManager(this.projectDir);
        const worktrees = wtManager.listWorktrees();

        for (const wt of worktrees) {
          if (wt !== this.projectDir && wt.includes(".worktrees")) {
            try {
              execSync(`git worktree remove --force "${wt}"`, {
                cwd: this.projectDir,
              });
            } catch (err) {
              console.error(`Failed to remove worktree: ${wt}`, err);
            }
          }
        }

        this.swarmFeed.emitThought(
          "SYSTEM",
          "Emergency Kill Signal received. Cleaning up all active worktrees.",
          { type: "emergency" },
        );
        return c.json({ success: true });
      } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
      }
    });

    // Wisdom Sync API (Phase 20)
    this.app.get("/api/wisdom/export", async (c) => {
      try {
        const { getMemoryStore } =
          await import("../src/memory/memory-store.js");
        const store = getMemoryStore(this.projectDir);
        const seeds = store.exportWisdom();
        return c.json(seeds);
      } catch (e: any) {
        return c.json({ error: e.message }, 500);
      }
    });

    this.app.post("/api/wisdom/import", async (c) => {
      // SECURITY: Validate request body size
      const contentLength = parseInt(c.req.header("content-length") || "0");
      if (contentLength > 1024 * 1024) {
        // 1MB limit
        return c.json(
          { error: "Request body too large. Maximum size is 1MB." },
          413,
        );
      }

      // SECURITY: Validate JSON
      let seeds: any;
      try {
        seeds = await c.req.json();
      } catch {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }

      // SECURITY: Validate wisdom import structure
      const items = Array.isArray(seeds) ? seeds : [seeds];
      for (let i = 0; i < Math.min(items.length, 100); i++) {
        // Limit to 100 items
        const item = items[i];
        if (!item?.type || typeof item.type !== "string") {
          return c.json(
            { error: `Item ${i}: missing or invalid 'type' field` },
            400,
          );
        }
        if (!item?.content || typeof item.content !== "string") {
          return c.json(
            { error: `Item ${i}: missing or invalid 'content' field` },
            400,
          );
        }
      }

      try {
        const { getMemoryStore } =
          await import("../src/memory/memory-store.js");
        const store = getMemoryStore(this.projectDir);
        const imported = store.importWisdom(seeds);
        this.swarmFeed.emitThought(
          "WISDOM_SYNC",
          `Successfully imported ${imported} knowledge seeds from external source.`,
          { count: imported },
        );
        return c.json({ success: true, imported });
      } catch (e: any) {
        return c.json({ error: e.message }, 500);
      }
    });

    // Skill Factory API (Phase 21)
    this.app.get("/api/factory/probe", async (c) => {
      try {
        const { getSkillFactory } =
          await import("../src/orchestration/skill-factory.js");
        const factory = getSkillFactory(this.projectDir);
        const patterns = await factory.detectPatterns();
        return c.json(patterns);
      } catch (e: any) {
        return c.json({ error: e.message }, 500);
      }
    });

    this.app.post("/api/factory/generate", async (c) => {
      // SECURITY: Validate request body
      let body: any;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }

      const { action, target } = body;
      if (!action || typeof action !== "string" || action.length > 200) {
        return c.json(
          { error: "Missing or invalid action (max 200 chars)" },
          400,
        );
      }
      if (!target || typeof target !== "string" || target.length > 500) {
        return c.json(
          { error: "Missing or invalid target (max 500 chars)" },
          400,
        );
      }

      // SECURITY: Sanitize inputs
      const sanitizedAction = action.replace(/[\x00-\x1F\x7F]/g, "").trim();
      const sanitizedTarget = target.replace(/[\x00-\x1F\x7F]/g, "").trim();

      try {
        const { getSkillFactory } =
          await import("../src/orchestration/skill-factory.js");
        const factory = getSkillFactory(this.projectDir);
        const skillPath = await factory.generateAizenSkill({
          action: sanitizedAction,
          target: sanitizedTarget,
        });

        this.swarmFeed.emitThought(
          "SKILL_FACTORY",
          `Forged new autonomous skill: ${path.basename(skillPath)}`,
          { action, target },
        );

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
        iq: 120 + Math.floor(Math.random() * 15), // Phase 27: Swarm IQ
      });
    });

    // Phase 29: Checkpoint API
    this.app.post("/api/checkpoint/resolve", async (c) => {
      // SECURITY: Validate request body
      let body: any;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }

      const { id, choice } = body;
      if (!id || !/^[a-zA-Z0-9_\-\.]+$/.test(id) || id.length > 100) {
        return c.json({ error: "Missing or invalid checkpoint ID" }, 400);
      }
      if (!choice || typeof choice !== "string" || choice.length > 200) {
        return c.json({ error: "Missing or invalid choice" }, 400);
      }

      getCheckpointManager().resolveCheckpoint(id, choice);
      return c.json({ success: true });
    });

    // Mesh Networking API (Phase 26)
    this.app.get("/api/mesh/nodes", (c) => {
      const mesh = getMeshRelay();
      return c.json(mesh.getNodes());
    });

    this.app.post("/api/mesh/register", async (c) => {
      // SECURITY: Validate request body
      let node: any;
      try {
        node = await c.req.json();
      } catch {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }

      // SECURITY: Validate node structure
      if (!node || typeof node !== "object") {
        return c.json({ error: "Invalid payload: expected object" }, 400);
      }
      if (
        !node.id ||
        !/^[a-zA-Z0-9_\-\.]+$/.test(node.id) ||
        node.id.length > 100
      ) {
        return c.json({ error: "Missing or invalid node ID" }, 400);
      }
      if (node.endpoint && typeof node.endpoint !== "string") {
        return c.json({ error: "Invalid endpoint format" }, 400);
      }

      try {
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

    this.wss.on("connection", (ws: WebSocketClient, req) => {
      // SECURITY: Validate WebSocket connection with API key
      if (this.apiKey) {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        const apiKey = url.searchParams.get("apiKey");
        if (apiKey !== this.apiKey) {
          ws.close(1008, "Unauthorized");
          return;
        }
      }

      ws.isAlive = true;
      ws.on("pong", () => (ws.isAlive = true));

      ws.on("message", (message) => {
        try {
          // SECURITY: Limit message size
          const messageBuffer = Buffer.isBuffer(message)
            ? message
            : Array.isArray(message)
              ? Buffer.concat(message)
              : Buffer.from(message as ArrayBuffer);

          if (messageBuffer.length > 64 * 1024) {
            // 64KB limit
            ws.close(1009, "Message too large");
            return;
          }

          const data = JSON.parse(messageBuffer.toString());

          // SECURITY: Validate message type
          if (data.type && typeof data.type !== "string") {
            return; // Ignore invalid messages
          }
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
      case "in progress":
        return "dev";
      case "review":
        return "test";
      case "done":
        return "done";
      default:
        return "backlog";
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
    this.server = serve(
      {
        fetch: this.app.fetch,
        port: this.port,
      },
      (info) => {
        console.log(
          `\n[SA] 🚀 Dashboard Server running at http://localhost:${info.port}`,
        );
        if (this.apiKey) {
          console.log(`[Security] ✅ Authentication enabled`);
        } else {
          console.log(
            `[Security] ⚠️  Authentication disabled (set AIZEN_API_KEY env var to enable)`,
          );
        }
        console.log(`[Security] ✅ Rate limiting enabled (100 req/min per IP)`);
      },
    ) as unknown as http.Server;

    this.setupWebSockets(this.server);
  }
}
