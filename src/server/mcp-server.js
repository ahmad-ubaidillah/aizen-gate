/**
 * [AZ] MCP Server - Model Context Protocol Integration
 * Uses dynamic import to handle ESM/CommonJS compatibility
 */

let server = null;

async function getServer() {
	if (server) return server;

	// Dynamic import to handle ESM/CommonJS mismatch
	const MCP = await import("@modelcontextprotocol/sdk/server/index.js");
	const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
	const { CallToolRequestSchema, ListToolsRequestSchema } = await import(
		"@modelcontextprotocol/sdk/types.js"
	);

	const { TaskCLI } = require("../tasks/task-cli");
	const { MemoryStore } = require("../memory/memory-store");
	const fs = require("fs-extra");
	const path = require("node:path");
	const yaml = require("js-yaml");

	const projectRoot = process.env.AIZEN_PROJECT_ROOT || process.cwd();

	server = new MCP.Server(
		{
			name: "aizen-gate-mcp",
			version: "1.0.0",
		},
		{
			capabilities: {
				tools: {},
			},
		},
	);

	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: [
				{
					name: "task_create",
					description: "Create a new Aizen-Gate backlog task",
					inputSchema: {
						type: "object",
						properties: {
							title: { type: "string", description: "The title of the task" },
							description: { type: "string", description: "The description of the task" },
							priority: { type: "string", description: "Priority (low, medium, high)" },
							assignee: { type: "string", description: "The assigned agent/developer" },
							status: { type: "string", description: "The initial status (e.g. Todo)" },
						},
						required: ["title"],
					},
				},
				{
					name: "task_list",
					description: "List all existing Aizen-Gate backlog tasks",
					inputSchema: {
						type: "object",
						properties: {},
					},
				},
				{
					name: "task_edit",
					description: "Edit an existing Aizen-Gate backlog task by ID",
					inputSchema: {
						type: "object",
						properties: {
							id: { type: "string", description: "The task ID (e.g. aizen-001)" },
							status: { type: "string", description: "New status" },
							priority: { type: "string", description: "New priority" },
							assignee: { type: "string", description: "New assignee" },
						},
						required: ["id"],
					},
				},
				{
					name: "memory_add",
					description: "Add a new fact or memory to the global Aizen-Gate Memory Store",
					inputSchema: {
						type: "object",
						properties: {
							text: { type: "string", description: "The memory text to store" },
						},
						required: ["text"],
					},
				},
				{
					name: "memory_query",
					description: "Query the global Aizen-Gate Memory Store for relevant facts",
					inputSchema: {
						type: "object",
						properties: {
							query: { type: "string", description: "The query string to search for" },
							limit: {
								type: "number",
								description: "Max number of results to return (default: 5)",
							},
						},
						required: ["query"],
					},
				},
			],
		};
	});

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const cli = new TaskCLI(projectRoot);
		const memoryStore = new MemoryStore(projectRoot);

		switch (request.params.name) {
			case "task_create": {
				const { title, description, priority, assignee, status } = request.params.arguments;
				// Overwrite console.log to capture output
				let output = "";
				const originalLog = console.log;
				console.log = (msg) => {
					output += `${msg}\n`;
				};

				try {
					await cli.create(title, { description, priority, assignee, status });
					console.log = originalLog;
					return {
						content: [
							{
								type: "text",
								text: `Task created successfully.\nOutput:\n${output}`,
							},
						],
					};
				} catch (e) {
					console.log = originalLog;
					return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
				}
			}

			case "task_list": {
				const files = fs.readdirSync(cli.tasksDir).filter((f) => f.endsWith(".md"));
				const taskList = [];
				for (const f of files) {
					const content = fs.readFileSync(path.join(cli.tasksDir, f), "utf8");
					const match = content.match(/---\n([\s\S]*?)\n---/);
					if (match) {
						const fm = yaml.load(match[1]);
						taskList.push(
							`[${fm.id}] ${fm.status} | ${fm.assignee} | ${f.replace(/aizen-\d+ - (.*)\.md/, "$1")}`,
						);
					}
				}
				return {
					content: [{ type: "text", text: taskList.join("\n") || "No tasks found." }],
				};
			}

			case "task_edit": {
				const { id, status, priority, assignee } = request.params.arguments;
				let output = "";
				const originalLog = console.log;
				console.log = (msg) => {
					output += `${msg}\n`;
				};

				try {
					await cli.edit(id, { status, priority, assignee });
					console.log = originalLog;
					return {
						content: [
							{
								type: "text",
								text: `Task edited successfully.\nOutput:\n${output}`,
							},
						],
					};
				} catch (e) {
					console.log = originalLog;
					return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
				}
			}

			case "memory_add": {
				const { text } = request.params.arguments;
				try {
					await memoryStore.add(text);
					return {
						content: [{ type: "text", text: `Successfully added memory: "${text}"` }],
					};
				} catch (e) {
					return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
				}
			}

			case "memory_query": {
				const { query, limit } = request.params.arguments;
				try {
					const max = typeof limit === "number" ? limit : 5;
					const results = await memoryStore.findRelevant(query, max);
					let responseText = "Search Results:\n\n";
					results.forEach((r, i) => {
						responseText += `${i + 1}. [Score: ${r.compositeScore?.toFixed(3) ?? "N/A"}] (${r.sector}) ${r.text}\n`;
					});
					return {
						content: [{ type: "text", text: responseText || "No relevant memories found." }],
					};
				} catch (e) {
					return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
				}
			}

			default:
				throw new Error("Unknown tool requested");
		}
	});

	return { server, StdioServerTransport };
}

async function main() {
	const { server: mcpServer, StdioServerTransport } = await getServer();
	const transport = new StdioServerTransport();
	await mcpServer.connect(transport);
	console.error("Aizen-Gate MCP Server running on stdio");
}

main().catch((error) => {
	console.error("MCP Server Error:", error);
	process.exit(1);
});
