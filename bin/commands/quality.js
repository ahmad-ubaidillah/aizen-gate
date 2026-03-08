const chalk = require("chalk");

function registerQuality(program) {
	// Doctor
	program
		.command("doctor")
		.description("Audit the workspace for protocol compliance and state health")
		.option("-f, --fix", "Attempt to auto-repair detected issues")
		.action(async (options) => {
			const { runDoctor } = require("../../src/quality/doctor");
			await runDoctor(process.cwd(), options);
		});

	// Benchmark
	program
		.command("benchmark")
		.description("Run performance benchmarks on agents and tasks")
		.action(async () => {
			const { runBenchmark } = require("../../src/quality/benchmark");
			await runBenchmark(process.cwd());
		});

	// Security Check
	program
		.command("security-check")
		.description("Run security audit to scan for potential secret leaks")
		.action(() => {
			const { execSync } = require("node:child_process");
			const path = require("node:path");
			// Use absolute path to security script
			const scriptPath = path.resolve(__dirname, "../../src/utils/security-check.sh");
			try {
				const output = execSync(scriptPath, { stdio: "inherit" });
				console.log(output);
			} catch (_e) {
				console.error(chalk.red("\n✖ Security check failed. Secrets detected."));
			}
		});

	// Checklist
	program
		.command("checklist")
		.description("Generate quality assurance checklist for the current task")
		.action(async () => {
			const { generateChecklist } = require("../../src/quality/checklist-gen");
			await generateChecklist(process.cwd());
		});

	// Todos
	program
		.command("todos")
		.description("Scan for TODOs in the codebase and map them to tasks")
		.action(async () => {
			const { scanTodos } = require("../../src/quality/todo-scanner");
			await scanTodos(process.cwd());
		});

	// Analyze
	program
		.command("analyze")
		.description("Analyze technical debt and suggest refactoring priorities")
		.option("-f, --file <path>", "File to analyze")
		.action(async (options) => {
			const { runAnalyzer } = require("../../src/quality/analyzer");
			await runAnalyzer(process.cwd(), options);
		});
}

module.exports = { registerQuality };
