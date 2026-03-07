const chalk = require("chalk");
const path = require("node:path");
const fs = require("fs-extra");
const yaml = require("js-yaml");

function registerCore(program) {
	// 1. Install
	program
		.command("install")
		.description("Install Aizen-Gate into the current project workspace")
		.option("-y, --yes", "Skip interactive prompts and use defaults")
		.action(async (options) => {
			const { installAizenGate } = require("../../installer/src/install");
			await installAizenGate(process.cwd());
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
				console.log(chalk.cyan("\n--- ⛩️ [Aizen] Sprint Board Status ---"));
				console.log(board);
			} else {
				console.log(chalk.red("\n❌ No active board found. Run 'npx aizen-gate start' first."));
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
				console.log(chalk.red("\n❌ Config file not found."));
				return;
			}

			const config = await fs.readJson(configPath);

			if (action === "list") {
				console.log(chalk.cyan("\n--- ⛩️ [Aizen] Project Configuration ---"));
				console.log(yaml.dump(config));
			} else if (action === "get") {
				if (!key) return console.log(chalk.red("Error: Key required."));
				console.log(`${key}: ${config[key] || "not set"}`);
			} else if (action === "set") {
				if (!key || !value) return console.log(chalk.red("Error: Key and value required."));
				const normalizedKey = key.replace(".", "_");
				config[normalizedKey] = value;
				await fs.writeJson(configPath, config, { spaces: 2 });
				console.log(chalk.green(`\n✔ Configuration updated: ${normalizedKey} = ${value}`));
			}
			console.log("");
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
