/**
 * Tasks CLI Commands
 */
import type { Command } from "commander";

interface TaskOptions {
	priority?: string;
	status?: string;
	feature?: string;
}

/**
 * Register tasks commands
 */
export function registerTasks(program: Command): void {
	const taskCmd = program
		.command("tasks")
		.description("Manage the agile backlog and Work Packages (WPs).");

	taskCmd
		.command("create")
		.description("Create a new task in the backlog")
		.argument("<title>", "Task title")
		.option("-p, --priority <level>", "Task priority (low, medium, high)", "medium")
		.action(async (title: string, options: TaskOptions) => {
			const { TaskCLI } = await import("../../src/tasks/task-cli.js");
			const cli = new TaskCLI(process.cwd()) as any;
			if (options.priority) cli.priority = options.priority;
			await cli.create(title, options);
		});

	taskCmd
		.command("list")
		.description("List all tasks")
		.action(async () => {
			const { TaskCLI } = await import("../../src/tasks/task-cli.js");
			const cli = new TaskCLI(process.cwd()) as any;
			await cli.list();
		});

	taskCmd
		.command("edit")
		.description("Edit an existing task")
		.argument("<id>", "Task ID to edit")
		.option("-p, --priority <level>", "Update priority")
		.option("-s, --status <status>", "Update status")
		.action(async (id: string, options: TaskOptions) => {
			const { TaskCLI } = await import("../../src/tasks/task-cli.js");
			const cli = new TaskCLI(process.cwd()) as any;
			await cli.edit(id, options);
		});

	taskCmd
		.command("search")
		.description("Search the project backlog and memory")
		.argument("<query>", "Keywords to search for")
		.action(async (query: string) => {
			const { TaskSearch } = await import("../../src/tasks/task-search.js");
			const search = new TaskSearch(process.cwd()) as any;
			await search.execute(query);
		});

	// Decompose
	program
		.command("decompose")
		.description("Analyze spec complexity and suggest sub-feature splits")
		.option("-f, --feature <slug>", "Feature to analyze")
		.action(async (options: TaskOptions) => {
			const { analyzeAndDecompose } = await import("../../src/utils/spec-decomposer.js");
			await analyzeAndDecompose(process.cwd(), options.feature);
		});
}
