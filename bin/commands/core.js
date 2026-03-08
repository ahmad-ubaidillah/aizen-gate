const chalk = require("chalk");
const path = require("node:path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const { note, cancel } = require("@clack/prompts");

function registerCore(program) {
	// 1. Install
	program
		.command("install")
		.description("Install Aizen-Gate into the current project workspace")
		.option("-y, --yes", "Skip interactive prompts and use defaults")
		.action(async (options) => {
			const { installAizenGate } = require("../../installer/src/install");
			const { runOnboarding } = require("../../src/setup/onboarding");
			await installAizenGate(process.cwd());
			if (!options.yes) {
				await runOnboarding(process.cwd());
			}
		});

	// 1.5. Onboarding
	program
		.command("onboarding")
		.description("Launch the enhanced user guidance wizard")
		.option("--classic", "Use the classic onboarding instead")
		.action(async (options) => {
			if (options.classic) {
				const { runOnboarding } = require("../../src/setup/onboarding");
				await runOnboarding(process.cwd());
			} else {
				const { runEnhancedOnboarding } = require("../../src/setup/onboarding");
				await runEnhancedOnboarding(process.cwd());
			}
		});

	// 2. Start (Session Init)
	program
		.command("start")
		.description("Initialize a new Aizen session and grooming phase")
		.action(async () => {
			const { runPlaybook } = require("../../src/utils/playbook-runner");
			runPlaybook("start", process.cwd());
		});

	// 3. Status
	program
		.command("status")
		.description("Check the current status of the scrum board")
		.action(async () => {
			const boardPath = path.join(process.cwd(), "aizen-gate/shared/board.md");
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
			const { runConstitution } = require("../../src/setup/constitution");
			await runConstitution(process.cwd());
		});

	// 5. Config
	program
		.command("config")
		.description("View or update Aizen-Gate configuration")
		.argument("[action]", "get, set, list", "list")
		.argument("[key]", "Configuration key (e.g., model_family)")
		.argument("[value]", "New value for the key")
		.action(async (action, key, value) => {
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
		});

	// 6. Clean
	program
		.command("clean")
		.description("Archive finished tasks/WPs and optimize workspace storage")
		.action(async () => {
			const { archiveTasks } = require("../../src/tasks/archive-tasks");
			await archiveTasks(process.cwd());
		});
}

module.exports = { registerCore };
