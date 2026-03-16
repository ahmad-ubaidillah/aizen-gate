/**
 * First-Run Tutorial and Example Project Creator
 * Provides guided onboarding experience with interactive examples
 */

import path from "node:path";
import { confirm, intro, isCancel, multiselect, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import {
	displayCelebration,
	displayFeatureBox,
	displayInfo,
	displayNextSteps,
	displaySectionHeader,
	displaySuccess,
	displayTip,
	displayWarning,
} from "./components/branded-welcome.js";
import { createLoadingIndicator } from "./components/progress-indicator.js";

/**
 * Tutorial step configuration
 */
interface TutorialStep {
	id: string;
	title: string;
	description: string;
	action?: () => Promise<void>;
	demo?: boolean;
}

/**
 * Example project templates
 */
const EXAMPLE_PROJECTS = {
	"hello-world": {
		name: "Hello World",
		description: "A simple example to learn the basics of Aizen-Gate",
		features: ["Basic task management", "Simple workflow", "Getting started guide"],
		tasks: [
			{
				id: "task-001",
				title: "Set up project structure",
				description: "Create the basic folder structure for your project",
				status: "Todo",
			},
			{
				id: "task-002",
				title: "Implement hello world function",
				description: "Create a simple function that returns 'Hello, World!'",
				status: "Todo",
			},
			{
				id: "task-003",
				title: "Add basic tests",
				description: "Write unit tests for the hello world function",
				status: "Todo",
			},
		],
	},
	"todo-app": {
		name: "Todo Application",
		description: "Build a complete todo app with AI assistance",
		features: ["CRUD operations", "State management", "User interface", "Testing"],
		tasks: [
			{
				id: "task-001",
				title: "Design data model",
				description: "Define the todo item structure and state",
				status: "Todo",
			},
			{
				id: "task-002",
				title: "Implement add todo",
				description: "Create functionality to add new todos",
				status: "Todo",
			},
			{
				id: "task-003",
				title: "Implement delete todo",
				description: "Create functionality to remove todos",
				status: "Todo",
			},
			{
				id: "task-004",
				title: "Build UI components",
				description: "Create the user interface for the todo app",
				status: "Todo",
			},
			{
				id: "task-005",
				title: "Add tests",
				description: "Write comprehensive tests for all features",
				status: "Todo",
			},
		],
	},
	"api-service": {
		name: "REST API Service",
		description: "Create a production-ready API with authentication",
		features: ["REST endpoints", "Authentication", "Database integration", "API documentation"],
		tasks: [
			{
				id: "task-001",
				title: "Design API architecture",
				description: "Plan the API structure and endpoints",
				status: "Todo",
			},
			{
				id: "task-002",
				title: "Implement authentication",
				description: "Add JWT-based authentication system",
				status: "Todo",
			},
			{
				id: "task-003",
				title: "Create CRUD endpoints",
				description: "Implement create, read, update, delete operations",
				status: "Todo",
			},
			{
				id: "task-004",
				title: "Add database layer",
				description: "Set up database connection and models",
				status: "Todo",
			},
			{
				id: "task-005",
				title: "Write API tests",
				description: "Create comprehensive API test suite",
				status: "Todo",
			},
			{
				id: "task-006",
				title: "Generate documentation",
				description: "Create OpenAPI/Swagger documentation",
				status: "Todo",
			},
		],
	},
};

/**
 * Run the first-run tutorial
 */
export async function runFirstRunTutorial(projectRoot: string): Promise<void> {
	console.clear();

	intro(chalk.cyan.bold("⛩️  Welcome to Aizen-Gate!"));

	console.log();
	console.log(chalk.white("This quick tutorial will help you get started with Aizen-Gate"));
	console.log(chalk.dim("You'll learn the basics in just a few minutes"));
	console.log();

	const startTutorial = await confirm({
		message: "Would you like to take the quick tutorial?",
		initialValue: true,
	});

	if (isCancel(startTutorial) || !startTutorial) {
		console.log();
		displayInfo("Tutorial skipped. You can run it anytime with: npx aizen-gate tutorial");
		console.log();
		return;
	}

	// Tutorial steps
	const steps: TutorialStep[] = [
		{
			id: "overview",
			title: "What is Aizen-Gate?",
			description:
				"Aizen-Gate is your AI-powered development team that helps you plan, build, and ship software faster.",
		},
		{
			id: "workflow",
			title: "The Aizen Workflow",
			description: "Learn the basic workflow: Specify → Plan → Tasks → Auto",
		},
		{
			id: "commands",
			title: "Essential Commands",
			description: "Discover the most important commands you'll use daily",
		},
		{
			id: "example",
			title: "Try an Example",
			description: "Create a sample project to see Aizen-Gate in action",
			demo: true,
		},
	];

	// Run through tutorial steps
	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		await runTutorialStep(step, i + 1, steps.length, projectRoot);
	}

	// Tutorial complete
	console.log();
	await displayCelebration("Tutorial Complete!", { animated: true });

	displayFeatureBox(
		"What's Next?",
		[
			`${chalk.cyan("npx aizen-gate specify")} - Define your first real feature`,
			`${chalk.cyan("npx aizen-gate example")} - Create another example project`,
			`${chalk.cyan("npx aizen-gate --help")} - See all available commands`,
			`${chalk.cyan("cat AIZEN.md")} - Read the full documentation`,
		],
		{ icon: "🚀", color: "green" },
	);

	console.log();
	displayTip(
		"Start small! Try the 'specify' command with a simple feature to see how Aizen-Gate breaks down your requirements into actionable tasks.",
	);
	console.log();

	outro(chalk.cyan("Happy coding! ⛩️"));
}

/**
 * Run a single tutorial step
 */
async function runTutorialStep(
	step: TutorialStep,
	current: number,
	total: number,
	projectRoot: string,
): Promise<void> {
	console.log();
	displaySectionHeader(`Step ${current}/${total}: ${step.title}`, "📚");

	console.log(chalk.white(step.description));
	console.log();

	// Step-specific content
	switch (step.id) {
		case "overview":
			await showOverviewContent();
			break;
		case "workflow":
			await showWorkflowContent();
			break;
		case "commands":
			await showCommandsContent();
			break;
		case "example":
			await showExampleContent(projectRoot);
			break;
	}

	// Pause for user to read
	if (step.id !== "example") {
		const continueToNext = await confirm({
			message: "Ready to continue?",
			initialValue: true,
		});

		if (isCancel(continueToNext)) {
			console.log();
			displayInfo("Tutorial paused. Run 'npx aizen-gate tutorial' to continue anytime.");
			process.exit(0);
		}
	}
}

/**
 * Show overview content
 */
async function showOverviewContent(): Promise<void> {
	console.log(chalk.cyan("  Key Features:"));
	console.log(chalk.dim("    • AI-powered task breakdown and planning"));
	console.log(chalk.dim("    • Intelligent code generation and review"));
	console.log(chalk.dim("    • Automated testing and quality assurance"));
	console.log(chalk.dim("    • Multi-agent orchestration for complex projects"));
	console.log();

	console.log(chalk.cyan("  How It Works:"));
	console.log(chalk.dim("    1. Describe what you want to build"));
	console.log(chalk.dim("    2. AI agents analyze and create a plan"));
	console.log(chalk.dim("    3. Work packages are generated automatically"));
	console.log(chalk.dim("    4. Agents implement the code with your guidance"));
	console.log();
}

/**
 * Show workflow content
 */
async function showWorkflowContent(): Promise<void> {
	console.log(chalk.cyan("  The 4-Step Workflow:"));
	console.log();

	console.log(
		chalk.bold.yellow("  1. SPECIFY") + chalk.dim(" - Define your feature or requirement"),
	);
	console.log(chalk.dim("     Command: npx aizen-gate specify"));
	console.log(chalk.dim("     What it does: Interactive interview to gather requirements"));
	console.log();

	console.log(chalk.bold.yellow("  2. PLAN") + chalk.dim(" - Generate architecture plan"));
	console.log(chalk.dim("     Command: npx aizen-gate plan"));
	console.log(chalk.dim("     What it does: Creates detailed technical design"));
	console.log();

	console.log(chalk.bold.yellow("  3. TASKS") + chalk.dim(" - Break down into work packages"));
	console.log(chalk.dim("     Command: npx aizen-gate tasks"));
	console.log(chalk.dim("     What it does: Generates actionable work items"));
	console.log();

	console.log(chalk.bold.yellow("  4. AUTO") + chalk.dim(" - Run autonomous development loop"));
	console.log(chalk.dim("     Command: npx aizen-gate auto"));
	console.log(chalk.dim("     What it does: AI agents implement tasks automatically"));
	console.log();

	displayTip(
		"You don't have to follow this exact order! Aizen-Gate is flexible and adapts to your workflow.",
	);
}

/**
 * Show commands content
 */
async function showCommandsContent(): Promise<void> {
	console.log(chalk.cyan("  Essential Commands:"));
	console.log();

	const commands = [
		{ cmd: "npx aizen-gate status", desc: "Check current project status" },
		{ cmd: "npx aizen-gate specify", desc: "Start feature specification" },
		{ cmd: "npx aizen-gate plan", desc: "Generate architecture plan" },
		{ cmd: "npx aizen-gate tasks", desc: "Manage work packages" },
		{ cmd: "npx aizen-gate auto", desc: "Run autonomous loop" },
		{ cmd: "npx aizen-gate memory", desc: "View AI memory and context" },
		{ cmd: "npx aizen-gate dashboard", desc: "Open web dashboard" },
	];

	for (const { cmd, desc } of commands) {
		console.log(`  ${chalk.cyan(cmd.padEnd(30))} ${chalk.dim(desc)}`);
	}

	console.log();
	displayTip(
		"Use --help with any command to see more options. Example: npx aizen-gate tasks --help",
	);
}

/**
 * Show example content and create example project
 */
async function showExampleContent(projectRoot: string): Promise<void> {
	console.log(chalk.cyan("  Would you like to create an example project?"));
	console.log(chalk.dim("  This will help you see Aizen-Gate in action!"));
	console.log();

	const createExample = await confirm({
		message: "Create an example project?",
		initialValue: true,
	});

	if (isCancel(createExample) || !createExample) {
		displayInfo("You can create an example later with: npx aizen-gate example");
		return;
	}

	// Select example type
	const exampleType = await select({
		message: "Choose an example project:",
		options: [
			{
				value: "hello-world",
				label: "Hello World",
				hint: "Simple example to learn basics",
			},
			{
				value: "todo-app",
				label: "Todo App",
				hint: "Complete app with multiple features",
			},
			{
				value: "api-service",
				label: "REST API",
				hint: "Production-ready API service",
			},
		],
	});

	if (isCancel(exampleType)) {
		displayInfo("Example creation cancelled");
		return;
	}

	// Create the example
	await createExampleProject(exampleType as string, projectRoot);
}

/**
 * Create an example project
 */
export async function createExampleProject(type: string, projectRoot: string): Promise<void> {
	const example = EXAMPLE_PROJECTS[type as keyof typeof EXAMPLE_PROJECTS];

	if (!example) {
		displayWarning(`Unknown example type: ${type}`);
		return;
	}

	console.log();
	displaySectionHeader(`Creating ${example.name}`, "🏗️");
	console.log(chalk.dim("  Setting up example project structure..."));
	console.log();

	const loader = createLoadingIndicator("Creating example project...");
	loader.start();

	try {
		// Create example directory
		const exampleDir = path.join(projectRoot, "examples", type);
		await fs.ensureDir(exampleDir);

		// Create README
		const readme = `# ${example.name}

${example.description}

## Features
${example.features.map((f) => `- ${f}`).join("\n")}

## Getting Started
1. Review the tasks in the Kanban board
2. Run \`npx aizen-gate status\` to see current progress
3. Use \`npx aizen-gate auto\` to start the autonomous loop

## Tasks
This example includes ${example.tasks.length} pre-defined tasks to help you learn Aizen-Gate.
`;

		await fs.writeFile(path.join(exampleDir, "README.md"), readme);

		// Create tasks
		const tasksDir = path.join(projectRoot, "kanban", "backlog", "tasks");
		await fs.ensureDir(tasksDir);

		for (const task of example.tasks) {
			const taskFile = path.join(
				tasksDir,
				`${task.id} - ${task.title.toLowerCase().replace(/\s+/g, "-")}.md`,
			);
			const taskContent = `---
id: ${task.id}
title: "${task.title}"
status: ${task.status}
priority: medium
assignee: @none
labels: [example, ${type}]
created: ${new Date().toISOString()}
---

# [${task.id.toUpperCase()}] - ${task.title}

## Description
${task.description}

## Acceptance Criteria
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Code reviewed

## Notes
This is an example task created by the first-run tutorial.
`;

			await fs.writeFile(taskFile, taskContent);
		}

		loader.success(`Example project created: ${example.name}`);

		console.log();
		displaySuccess(`Created ${example.tasks.length} example tasks`);
		displaySuccess(`Example files in: examples/${type}/`);
		console.log();

		displayFeatureBox(
			"Next Steps",
			[
				`Review tasks: ${chalk.cyan("npx aizen-gate tasks list")}`,
				`Check status: ${chalk.cyan("npx aizen-gate status")}`,
				`Start working: ${chalk.cyan("npx aizen-gate auto")}`,
			],
			{ icon: "🎯", color: "cyan" },
		);

		console.log();
		displayTip(
			"These example tasks are ready to be worked on. Try running 'npx aizen-gate auto' to see the AI agents in action!",
		);
	} catch (error) {
		loader.error("Failed to create example project");
		displayWarning("Could not create example project, but you can continue without it.");
		console.log(chalk.dim(`  Error: ${(error as Error).message}`));
	}
}

/**
 * Quick reference guide
 */
export function displayQuickReference(): void {
	console.log();
	console.log(chalk.bold.cyan("⛩️  Aizen-Gate Quick Reference"));
	console.log(chalk.dim("═".repeat(50)));
	console.log();

	console.log(chalk.bold("Getting Started:"));
	console.log(chalk.dim("  npx aizen-gate install     Initialize project"));
	console.log(chalk.dim("  npx aizen-gate start       Start a session"));
	console.log(chalk.dim("  npx aizen-gate tutorial    Run the tutorial"));
	console.log();

	console.log(chalk.bold("Daily Workflow:"));
	console.log(chalk.dim("  npx aizen-gate specify     Define a feature"));
	console.log(chalk.dim("  npx aizen-gate plan        Create architecture"));
	console.log(chalk.dim("  npx aizen-gate tasks       Manage work items"));
	console.log(chalk.dim("  npx aizen-gate auto        Run autonomous loop"));
	console.log();

	console.log(chalk.bold("Monitoring:"));
	console.log(chalk.dim("  npx aizen-gate status      Check progress"));
	console.log(chalk.dim("  npx aizen-gate dashboard   Open web UI"));
	console.log(chalk.dim("  npx aizen-gate memory      View AI context"));
	console.log();

	console.log(chalk.bold("Help:"));
	console.log(chalk.dim("  npx aizen-gate --help      Show all commands"));
	console.log(chalk.dim("  npx aizen-gate <cmd> --help Command details"));
	console.log();

	console.log(chalk.dim("═".repeat(50)));
	console.log();
}

/**
 * Best practices guide
 */
export function displayBestPractices(): void {
	console.log();
	displaySectionHeader("Best Practices", "💡");

	const practices = [
		{
			title: "Start with clear specifications",
			description:
				"The more detail you provide in the 'specify' phase, the better the AI can help you.",
		},
		{
			title: "Review generated plans",
			description: "Always review and approve the architecture plan before implementation.",
		},
		{
			title: "Use small, focused tasks",
			description: "Break down large features into smaller, manageable work packages.",
		},
		{
			title: "Monitor the autonomous loop",
			description: "Check in regularly when running 'auto' to provide guidance and feedback.",
		},
		{
			title: "Leverage the memory system",
			description:
				"The AI learns from your decisions. View and manage memories with 'memory' command.",
		},
		{
			title: "Use the dashboard",
			description: "The web dashboard provides a visual overview of your project's progress.",
		},
	];

	for (const practice of practices) {
		console.log();
		console.log(chalk.cyan(`  • ${practice.title}`));
		console.log(chalk.dim(`    ${practice.description}`));
	}

	console.log();
}

/**
 * Common workflows guide
 */
export function displayCommonWorkflows(): void {
	console.log();
	displaySectionHeader("Common Workflows", "🔄");

	console.log();
	console.log(chalk.bold("1. Starting a New Feature"));
	console.log(chalk.dim("   specify → plan → tasks → auto"));
	console.log();

	console.log(chalk.bold("2. Fixing a Bug"));
	console.log(chalk.dim("   specify (describe bug) → plan → auto"));
	console.log();

	console.log(chalk.bold("3. Code Review"));
	console.log(chalk.dim("   Use the dashboard to review AI-generated code"));
	console.log();

	console.log(chalk.bold("4. Refactoring"));
	console.log(chalk.dim("   specify (describe refactor) → plan → tasks → auto"));
	console.log();

	console.log(chalk.bold("5. Adding Tests"));
	console.log(chalk.dim("   specify (describe test needs) → auto"));
	console.log();

	displayTip(
		"You can interrupt the autonomous loop at any time with Ctrl+C. Aizen-Gate will save your progress.",
	);
	console.log();
}
