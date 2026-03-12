/**
 * Core CLI Commands for Aizen-Gate
 */

import path from "node:path";
import { cancel, note } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";
import fs from "fs-extra";
import yaml from "js-yaml";

/**
 * Register core commands
 * @param program - Commander program instance
 */
export function registerCore(program: Command): void {
	// 1.5. Onboarding
	program
		.command("onboarding")
		.description("Launch the enhanced user guidance wizard")
		.option("--classic", "Use the classic onboarding instead")
		.option("--comprehensive", "Use the new comprehensive setup with all 8 steps")
		.action(async (options: { classic?: boolean; comprehensive?: boolean }) => {
			const projectRoot = process.cwd(); // Declare projectRoot here
			if (options.comprehensive) {
				const { runOnboarding } = await import("../../src/setup/onboarding.js");
				await runOnboarding({ comprehensive: true, projectRoot });
			} else if (options.classic) {
				const { runOnboarding } = await import("../../src/setup/onboarding.js");
				await runOnboarding(projectRoot);
			} else {
				const { runEnhancedOnboarding } = await import("../../src/setup/onboarding.js");
				await runEnhancedOnboarding(projectRoot);
			}
		});

	// 2. Start (Session Init)
	program
		.command("start")
		.description("Initialize a new Aizen session and grooming phase")
		.action(async () => {
			const { runPlaybook } = (await import("../../src/utils/playbook-runner.js")) as any;
			await runPlaybook("start", process.cwd());
		});

	// 3. Status
	program
		.command("status")
		.description("Check the current status of the scrum board")
		.action(async () => {
			const projectDir = process.cwd(); // Declare projectDir here
			const boardPath = path.join(projectDir, "aizen-gate/shared/board.md");
			if (fs.existsSync(boardPath)) {
				const board = await fs.readFile(boardPath, "utf8");
				note(board, chalk.cyan("⛩️  Sprint Board Status"));
			} else {
				cancel("No active board found.");
				console.log(chalk.dim("Run 'npx aizen-gate start' first.\n"));
			}
		});

	// 4. Constitution
	program
		.command("constitution")
		.description("Define project principles and code standards via interactive interview")
		.action(async () => {
			const { runConstitution } = await import("../../src/setup/constitution.js");
			await runConstitution(process.cwd());
		});

	// 5. Config
	program
		.command("config")
		.description("View or update Aizen-Gate configuration")
		.argument("[action]", "get, set, list", "list")
		.argument("[key]", "Configuration key (e.g., model_family)")
		.argument("[value]", "New value for the key")
		.action(
			async (action: string | undefined, key: string | undefined, value: string | undefined) => {
				const configPath = path.join(process.cwd(), "aizen-gate/shared/config.json");
				if (!fs.existsSync(configPath)) {
					cancel("Config file not found.");
					return;
				}

				const config = await fs.readJson(configPath);

				if (action === "list") {
					note(yaml.dump(config), chalk.cyan("⛩️  Project Configuration"));
				} else if (action === "get") {
					if (!key) return cancel("Key required for 'get' action.");
					console.log(`\n  ${chalk.cyan(key)}: ${config[key] || chalk.dim("not set")}\n`);
				} else if (action === "set") {
					if (!key || !value) return cancel("Key and value required for 'set' action.");
					const normalizedKey = key.replace(".", "_");
					config[normalizedKey] = value;
					await fs.writeJson(configPath, config, { spaces: 2 });
					console.log(
						chalk.green(
							`\n  ✔ Configuration updated: ${chalk.cyan(normalizedKey)} = ${chalk.yellow(value)}\n`,
						),
					);
				}
			},
		);

	// 6. Clean
	program
		.command("clean")
		.description("Archive finished tasks/WPs and optimize workspace storage")
		.action(async () => {
			const { archiveTasks } = await import("../../src/tasks/archive-tasks.js");
			await archiveTasks(process.cwd());
		});
}
