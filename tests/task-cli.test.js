import { afterAll, beforeEach, describe, expect, it } from "vitest";

const fs = require("fs-extra");
const path = require("node:path");
const { TaskCLI } = require("../src/tasks/task-cli");
const { TaskSearch } = require("../src/tasks/task-search");

describe("TaskCLI & TaskSearch - Suite", () => {
	const testRoot = path.join(__dirname, "test-env-tasks");
	let cli, search;

	beforeEach(() => {
		// Setup temp env
		fs.emptyDirSync(testRoot);
		fs.ensureDirSync(path.join(testRoot, "backlog", "tasks"));
		fs.ensureDirSync(path.join(testRoot, "aizen-gate", "shared"));
		fs.writeFileSync(path.join(testRoot, "aizen-gate", "shared", "board.md"), "# Board\n\n");
		fs.writeFileSync(
			path.join(testRoot, "backlog", "config.yml"),
			"statuses: [Todo, In Progress, Done]\ndefinition_of_done:\n  - AC met\n  - Tests pass\n",
		);

		cli = new TaskCLI(testRoot);
		search = new TaskSearch(testRoot);
	});

	afterAll(() => {
		fs.removeSync(testRoot);
	});

	it("Task 6 & 8: Create task with DoD defaults", async () => {
		await cli.create("Setup Database", { priority: "high", assignee: "@codex" });

		const files = fs.readdirSync(cli.tasksDir);
		expect(files.length).toBe(1);
		expect(files[0]).toContain("aizen-001 - setup-database.md");

		const content = fs.readFileSync(path.join(cli.tasksDir, files[0]), "utf8");
		expect(content).toContain("status: Todo");
		expect(content).toContain("priority: high");
		expect(content).toContain("assignee: '@codex'"); // yaml formats it nicely
		expect(content).toContain("## Definition of Done");
		expect(content).toContain("- [ ] AC met");
	});

	it("Task 8: Create task skipping DoD defaults", async () => {
		await cli.create("Quick Fix", { noDodDefaults: true });

		const files = fs.readdirSync(cli.tasksDir);
		// Since env is rebuilt each time, this is 1st task
		const content = fs.readFileSync(path.join(cli.tasksDir, files[0]), "utf8");
		expect(content).not.toContain("## Definition of Done");
	});

	it("Task 7: Fuzzy Search", async () => {
		await cli.create("Build Login API", {
			description: "Use JWT for authentication",
			priority: "high",
		});
		await cli.create("Design Login UI", {
			description: "Use React components",
			priority: "medium",
			assignee: "@ui-agent",
		});

		const results = await search.search("login authentication", {});
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].title).toBe("build-login-api"); // Highest score

		const filteredResults = await search.search("login", { priority: "medium" });
		expect(filteredResults.length).toBe(1);
		expect(filteredResults[0].title).toBe("design-login-ui");
	});

	it("Task 6: Edit task status and update board", async () => {
		await cli.create("Deploy to Prod", {});
		await cli.edit("aizen-001", { status: "Done", assignee: "@devops" });

		const files = fs.readdirSync(cli.tasksDir);
		const content = fs.readFileSync(path.join(cli.tasksDir, files[0]), "utf8");
		expect(content).toContain("status: Done");
		expect(content).toContain("assignee: '@devops'");

		const board = fs.readFileSync(cli.boardPath, "utf8");
		expect(board).toContain("| Deploy to Prod | @devops | Done |");
	});
});
