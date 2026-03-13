#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cancel } from "@clack/prompts";
import chalk from "chalk";
/**
 * Aizen-Gate CLI - Entry Point (v2.2)
 *
 * Refactored for modern UX with branded aesthetics.
 */
import { Command } from "commander";

const program = new Command();

// Lifecycle Hook: Auto-start/resume on any interaction
// Properly handle async lifecycle with error logging
const projectRoot = process.cwd();
const configPath = path.join(projectRoot, "shared/config.json");

interface LifecycleModule {
	initLifecycle: () => Promise<void>;
}

let lifecycleExporter: LifecycleModule | null = null;

if (fs.existsSync(configPath)) {
	// Use synchronous detection to avoid orphaned async operations
	// The lifecycle will be resumed on first command execution
	process.env.AIZEN_RESUME_ON_START = "true";

	// Set up lazy initialization - resume only when needed
	let lifecycleInitialized = false;
	const initLifecycle = async (): Promise<void> => {
		if (lifecycleInitialized) return;
		lifecycleInitialized = true;

		try {
			const { LifecycleManager } = await import("../src/session/lifecycle-manager.js");
			const lm = new LifecycleManager(projectRoot);
			await lm.wake();
		} catch (err) {
			console.error("[Aizen] Lifecycle initialization warning:", (err as Error).message);
		}
	};

	// Export lifecycle init for commands that need it
	lifecycleExporter = { initLifecycle };
}

// --- Skill System: Auto-load skills from reference/skills & dependency watcher ---

let skillExporter: { initSkills: () => Promise<void> } | null = null;

const initSkills = async (): Promise<void> => {
	try {
		const { skillRegistry } = await import("../src/skills/index.js");
		await skillRegistry.initialize(projectRoot);
		console.log(chalk.cyan("[Skills] Loaded skills from root skills folder"));
	} catch (err) {
		console.error("[Skills] Initialization warning:", (err as Error).message);
	}

	// Start SkillWatcher to monitor dependency changes
	try {
		const { SkillWatcher } = await import("../src/utils/skill-watcher.js");
		const watcher = new SkillWatcher(projectRoot);
		watcher.start();
		console.log(chalk.cyan("[SkillWatcher] Monitoring dependencies for auto-skill generation"));
	} catch (err) {
		console.error("[SkillWatcher] Warning:", (err as Error).message);
	}
};

// Auto-init skills on startup (fire and forget)
initSkills();

skillExporter = { initSkills };

export { lifecycleExporter, skillExporter };

program
	.name("aizen-gate")
	.description(chalk.dim("The Ultimate AI-Orchestration & Specification Shield"))
	.version("2.2.4")
	.addHelpText("before", `\n${chalk.cyan.bold("⛩️  AIZEN-GATE")} ${chalk.dim("v2.2.4")}\n`);

// --- Command Groups ---

import { registerCore } from "./commands/core.js";
import { registerDocs } from "./commands/docs.js";
import { registerKanban } from "./commands/kanban.js";
import { registerKnowledge } from "./commands/knowledge.js";
import { registerMemory } from "./commands/memory.js";
import { registerOrchestration } from "./commands/orchestration.js";
import { registerQuality } from "./commands/quality.js";
import { registerServer } from "./commands/server.js";
import { registerSession } from "./commands/session.js";
import { registerSkills } from "./commands/skills.js";
import { registerTasks } from "./commands/tasks.js";

registerCore(program);
registerDocs(program);
registerTasks(program);
registerKanban(program);
registerOrchestration(program);
registerQuality(program);
registerKnowledge(program);
registerMemory(program);
registerSession(program);
registerServer(program);
registerSkills(program);

// --- Catch-all: Playbook Routing ---

program.arguments("[unrecognized]").action(async (cmd: string | undefined) => {
	if (!cmd) {
		program.help();
		return;
	}

	const builtIn = program.commands.map((cmd: Command) => cmd.name());

	if (builtIn.includes(cmd)) return;

	const { runPlaybook } = await import("../src/utils/playbook-runner.js");
	const playbookPath = path.join(process.cwd(), `commands/az-${cmd}.md`);

	if (fs.existsSync(playbookPath)) {
		runPlaybook(cmd, process.cwd());
	} else {
		cancel(`Unknown command "${chalk.yellow(cmd)}".`);
		console.log(chalk.dim(`Try "npx aizen-gate --help" for available commands.\n`));
	}
});

program.parse(process.argv);
