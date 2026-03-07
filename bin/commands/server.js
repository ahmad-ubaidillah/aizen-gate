const chalk = require("chalk");

function registerServer(program) {
	// MCP
	program
		.command("mcp")
		.description("Launch the Model Context Protocol (MCP) server")
		.action(() => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching MCP Server ---\n"));
			require("../../src/server/mcp-server");
		});

	// API
	program
		.command("api")
		.description("Launch the Orchestrator REST API for external tools")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching Orchestrator API Server ---\n"));
			require("../../src/server/api-server");
		});
}

module.exports = { registerServer };
