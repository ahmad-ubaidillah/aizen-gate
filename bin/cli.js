#!/usr/bin/env node

/**
 * Aizen-Gate CLI - Entry Point (v2.1)
 *
 * Refactored for maintainability. Core logic moved to src/ and bin/commands/.
 */

const { Command } = require("commander");
const chalk = require("chalk");
const path = require("node:path");
const fs = require("fs-extra");

const program = new Command();

// Lifecycle Hook: Auto-start/resume on any interaction
(async () => {
	const projectRoot = process.cwd();
	const configPath = path.join(projectRoot, "aizen-gate/shared/config.json");
	if (fs.existsSync(configPath)) {
		try {
			const { LifecycleManager } = require("../src/session/lifecycle-manager");
			const lm = new LifecycleManager(projectRoot);
			await lm.wake();
		} catch (_e) {
			// Fail silently during wake if modules missing or system error
		}
	}
})();

program
	.name("aizen-gate")
	.description("The Ultimate AI-Orchestration & Specification Shield")
	.version("2.1.3");

// --- Command Groups ---

const { registerCore } = require("./commands/core");
const { registerDocs } = require("./commands/docs");
const { registerTasks } = require("./commands/tasks");
const { registerOrchestration } = require("./commands/orchestration");
const { registerQuality } = require("./commands/quality");
const { registerKnowledge } = require("./commands/knowledge");
const { registerMemory } = require("./commands/memory");
const { registerSession } = require("./commands/session");
const { registerServer } = require("./commands/server");
const { registerSkills } = require("./commands/skills");

registerCore(program);
registerDocs(program);
registerTasks(program);
registerOrchestration(program);
registerQuality(program);
registerKnowledge(program);
registerMemory(program);
registerSession(program);
registerServer(program);
registerSkills(program);

// --- Catch-all: Playbook Routing ---

program.arguments("[unrecognized]").action(async (cmd) => {
	if (!cmd) {
		program.help();
		return;
	}

	const builtIn = [
		"install",
		"start",
		"status",
		"doctor",
		"map",
		"docs",
		"auto",
		"dashboard",
		"specify",
		"research",
		"plan",
		"tasks",
		"implement",
		"review",
		"verify",
		"merge",
		"ingest",
		"compress",
		"export",
		"benchmark",
		"pause",
		"resume",
		"tokens",
		"kg",
		"constitution",
		"config",
		"checklist",
		"todos",
		"analyze",
		"clean",
		"mcp",
		"api",
		"skill",
	];

	if (builtIn.includes(cmd)) return;

	const { runPlaybook } = require("../src/utils/playbook-runner");
	const playbookPath = path.join(process.cwd(), `commands/az-${cmd}.md`);
	const installedPath = path.join(process.cwd(), `aizen-gate/commands/az-${cmd}.md`);

	if (fs.existsSync(playbookPath) || fs.existsSync(installedPath)) {
		runPlaybook(cmd, process.cwd());
	} else {
		console.log(chalk.red(`Error: Unknown command "${cmd}".`));
		console.log(chalk.yellow(`Try "npx aizen-gate --help" for available commands.`));
		program.help();
	}
});

program.parse(process.argv);
