import { afterAll, beforeEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TaskCLI } from "../src/tasks/task-cli.js";
import { TaskSearch } from "../src/tasks/task-search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("TaskCLI & TaskSearch - Suite", () => {
	const testRoot = path.join(__dirname, "test-env-tasks");
	let cli: TaskCLI, search: TaskSearch;

	beforeEach(() => {
		// Setup temp env
		fs.emptyDirSync(testRoot);
		fs.ensureDirSync(path.join(testRoot, "kanban", "backlog", "tasks"));
		fs.ensureDirSync(path.join(testRoot, "kanban", "dev"));
		fs.ensureDirSync(path.join(testRoot, "kanban", "test"));
		fs.ensureDirSync(path.join(testRoot, "kanban", "done"));
		fs.ensureDirSync(path.join(testRoot, "aizen-gate", "shared"));
		fs.writeFileSync(path.join(testRoot, "aizen-gate", "shared", "board.md"), "# Board\n\n");
		fs.writeFileSync(
			path.join(testRoot, "kanban", "backlog", "config.yml"),
			"statuses: [Todo, In Progress, Done]\ndefinition_of_done:\n  - AC met\n  - Tests pass\n",
		);

		cli = new TaskCLI(testRoot);
		search = new TaskSearch(testRoot);
	});

	afterAll(() => {
		fs.removeSync(testRoot);
	});

	it("Rich Templates & Unified Path: Create task", async () => {
		await cli.create("Setup Database", { priority: "high", assignee: "@codex", description: "Database setup" });

		const backlogDir = path.join(testRoot, "kanban", "backlog");
		const files = fs.readdirSync(backlogDir).filter(f => f.endsWith(".md"));
		expect(files.length).toBe(1);
		expect(files[0]).toContain("task-001 - setup-database.md");

		const content = fs.readFileSync(path.join(backlogDir, files[0]), "utf8");
		expect(content).toContain("status: Todo");
		expect(content).toContain("Metadata");
		expect(content).toContain("HIGH");
		expect(content).toContain("Database setup");
	});

	it("Unified Search: Search across directories", async () => {
		await cli.create("Login API", { priority: "high" });
		
		// Move one to dev manually for search test
		const source = path.join(testRoot, "kanban", "backlog", "task-001 - login-api.md");
		const target = path.join(testRoot, "kanban", "dev", "task-001 - login-api.md");
		await fs.move(source, target);

		const results = await search.search("login", {});
		expect(results.length).toBe(1);
		expect(results[0].id).toBe("task-001");
	});

	it("Kanban Movement: Edit status moves file", async () => {
		await cli.create("Deploy to Prod", {});
		await cli.edit("task-001", { status: "Done" });

		const doneDir = path.join(testRoot, "kanban", "done");
		const files = fs.readdirSync(doneDir);
		expect(files[0]).toContain("task-001");
		
		const backlogDir = path.join(testRoot, "kanban", "backlog");
		const backlogFiles = fs.readdirSync(backlogDir).filter(f => f.endsWith(".md"));
		expect(backlogFiles.length).toBe(0);
	});
});
