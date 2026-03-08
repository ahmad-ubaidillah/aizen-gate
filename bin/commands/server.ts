/**
 * Server CLI Commands
 */
import chalk from "chalk";
import type { Command } from "commander";

/**
 * Register server commands
 */
export function registerServer(program: Command): void {
	// MCP
	program
		.command("mcp")
		.description("Launch the Model Context Protocol (MCP) server")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching MCP Server ---\n"));
			// Dynamic import to load the module
			await import("../../src/server/mcp-server.js");
		});

	// API
	program
		.command("api")
		.description("Launch the Orchestrator REST API for external tools")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching Orchestrator API Server ---\n"));
			// Dynamic import to load the module
			await import("../../src/server/api-server.js");
		});
}
