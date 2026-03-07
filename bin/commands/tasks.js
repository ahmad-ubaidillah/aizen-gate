const chalk = require("chalk");

function registerTasks(program) {
	const taskCmd = program
		.command("tasks")
		.description("Manage the agile backlog and Work Packages (WPs).");

	taskCmd
		.command("create")
		.description("Create a new task in the backlog")
		.argument("<title>", "Task title")
		.option("-p, --priority <level>", "Task priority (low, medium, high)", "medium")
		.action(async (title, options) => {
			const { TaskCLI } = require("../../src/tasks/task-cli");
			const cli = new TaskCLI(process.cwd());
			if (options.priority) cli.priority = options.priority;
			await cli.create(title, options);
		});

	taskCmd
		.command("list")
		.description("List all tasks")
		.action(async () => {
			const { TaskCLI } = require("../../src/tasks/task-cli");
			const cli = new TaskCLI(process.cwd());
			await cli.list();
		});

	taskCmd
		.command("edit")
		.description("Edit an existing task")
		.argument("<id>", "Task ID to edit")
		.option("-p, --priority <level>", "Update priority")
		.option("-s, --status <status>", "Update status")
		.action(async (id, options) => {
			const { TaskCLI } = require("../../src/tasks/task-cli");
			const cli = new TaskCLI(process.cwd());
			await cli.edit(id, options);
		});

	taskCmd
		.command("search")
		.description("Search the project backlog and memory")
		.argument("<query>", "Keywords to search for")
		.action(async (query) => {
			const { TaskSearch } = require("../../src/tasks/task-search");
			const search = new TaskSearch(process.cwd());
			await search.execute(query);
		});

	// Decompose
	program
		.command("decompose")
		.description("Analyze spec complexity and suggest sub-feature splits")
		.option("-f, --feature <slug>", "Feature to analyze")
		.action(async (options) => {
			const { analyzeAndDecompose } = require("../../src/utils/spec-decomposer");
			await analyzeAndDecompose(process.cwd(), options);
		});

	// Specify & Plan (Redirected to Playbooks)
	program
		.command("specify")
		.description("Conduct discovery interview to formalize a feature request")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching az-specify Playbook ---\n"));
			console.log(
				chalk.gray(`Invoke agent: "Read aizen-gate/commands/az-specify.md and conduct discovery."`),
			);
		});

	program
		.command("plan")
		.description("Generate architecture plan and TDD strategy")
		.action(async () => {
			console.log(chalk.red("\n--- ⛩️ [Aizen] Launching az-plan Playbook ---\n"));
			console.log(
				chalk.gray(
					`Invoke agent: "Read aizen-gate/commands/az-plan.md and generate architecture."`,
				),
			);
		});
}

module.exports = { registerTasks };
