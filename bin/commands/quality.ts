/**
 * Quality CLI Commands
 */

import { execSync } from "node:child_process";
import path from "node:path";
import chalk from "chalk";
import type { Command } from "commander";

interface CommandOptions {
	fix?: boolean;
	file?: string;
}

// In CommonJS, __dirname is available globally
// But TypeScript needs it declared for ESM compatibility
declare const __dirname: string;

/**
 * Register quality commands
 */
export function registerQuality(program: Command): void {
	// Doctor
	program
		.command("doctor")
		.description("Audit the workspace for protocol compliance and state health")
		.option("-f, --fix", "Attempt to auto-repair detected issues")
		.action(async (options: CommandOptions) => {
			const { runDoctor } = await import("../../src/quality/doctor.js");
			await runDoctor(process.cwd(), options);
		});

	// Benchmark
	program
		.command("benchmark")
		.description("Run performance benchmarks on agents and tasks")
		.action(async () => {
			const { runBenchmark } = await import("../../src/quality/benchmark.js");
			await runBenchmark(process.cwd());
		});

	// Security Check
	program
		.command("security-check")
		.description("Run security audit to scan for potential secret leaks")
		.action(() => {
			// Use absolute path to security script
			const scriptPath = path.resolve(__dirname, "../../src/utils/security-check.sh");
			try {
				execSync(scriptPath, { stdio: "inherit" });
			} catch {
				console.error(chalk.red("\n✖ Security check failed. Secrets detected."));
			}
		});

	// Checklist
	program
		.command("checklist")
		.description("Generate quality assurance checklist for the current task")
		.action(async () => {
			const { generateChecklist } = await import("../../src/quality/checklist-gen.js");
			await generateChecklist(process.cwd());
		});

	// Todos
	program
		.command("todos")
		.description("Scan for TODOs in the codebase and map them to tasks")
		.action(async () => {
			const { scanTodos } = await import("../../src/quality/todo-scanner.js");
			await scanTodos(process.cwd());
		});

	// Analyze
	program
		.command("analyze [feature]")
		.description("Analyze technical debt and suggest refactoring priorities")
		.option("-f, --file <path>", "File to analyze")
		.action(async (feature: string | undefined, options: CommandOptions) => {
			const { runAnalyzer } = await import("../../src/quality/analyzer.js");
			// If feature is provided, use it. If not, maybe use options.file if that's what was intended
			await runAnalyzer(process.cwd(), feature || options.file);
		});
}
