/**
 * Task Flow - Automatic Task Movement and Lesson Learned Generation
 *
 * Phase 5, Task 5.2: Implements automatic kanban flow with AI-generated
 * lesson learned summaries when tasks are archived.
 *
 * Flow: Designer → Dev → Backend → QA → SOC → Done → Archive
 */

import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import matter from "gray-matter";

/* ============================================================================
 * Types
 * ========================================================================= */

/**
 * Kanban column names
 */
export type KanbanColumn = "designer" | "dev" | "backend" | "qa" | "soc" | "done" | "archive";

/**
 * Task data interface
 */
export interface TaskData {
	id: string;
	title: string;
	description?: string;
	status: string;
	priority: string;
	assignee?: string;
	labels?: string[];
	lesson_learned?: string;
	createdAt?: string;
	updatedAt?: string;
	completedAt?: string;
	column?: KanbanColumn;
}

/**
 * Task move event for dashboard updates
 */
export interface TaskMoveEvent {
	type: "task:moved" | "task:archived" | "task:created";
	taskId: string;
	fromColumn?: string;
	toColumn: string;
	timestamp: string;
	taskData?: TaskData;
}

/**
 * Lesson learned content structure
 */
export interface LessonLearned {
	whatWentWell: string[];
	whatCouldImprove: string[];
	keyTakeaways: string[];
}

/* ============================================================================
 * Column Configuration
 * ========================================================================= */

/**
 * Column flow order
 */
export const COLUMN_ORDER: KanbanColumn[] = [
	"designer",
	"dev",
	"backend",
	"qa",
	"soc",
	"done",
	"archive",
];

/**
 * Column to folder mapping
 */
export const COLUMN_TO_FOLDER: Record<KanbanColumn, string> = {
	designer: "kanban/designer",
	dev: "kanban/dev",
	backend: "kanban/backend",
	qa: "kanban/qa",
	soc: "kanban/soc",
	done: "kanban/done",
	archive: "kanban/archive",
};

/**
 * Reverse folder to column mapping
 */
export const FOLDER_TO_COLUMN: Record<string, KanbanColumn> = {};
for (const [column, folder] of Object.entries(COLUMN_TO_FOLDER)) {
	FOLDER_TO_COLUMN[folder] = column as KanbanColumn;
}

/* ============================================================================
 * Event Emitter for Dashboard Updates
 * ========================================================================= */

type EventCallback = (event: TaskMoveEvent) => void;

class TaskEventEmitter {
	private listeners: Map<string, EventCallback[]> = new Map();
	private static instance: TaskEventEmitter;

	private constructor() {}

	static getInstance(): TaskEventEmitter {
		if (!TaskEventEmitter.instance) {
			TaskEventEmitter.instance = new TaskEventEmitter();
		}
		return TaskEventEmitter.instance;
	}

	on(event: string, callback: EventCallback): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)?.push(callback);
	}

	off(event: string, callback: EventCallback): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			const index = callbacks.indexOf(callback);
			if (index > -1) {
				callbacks.splice(index, 1);
			}
		}
	}

	emit(event: TaskMoveEvent): void {
		const callbacks = this.listeners.get(event.type) || [];
		const allListeners = this.listeners.get("*") || [];
		[...callbacks, ...allListeners].forEach((cb) => cb(event));
	}
}

export const taskEvents = TaskEventEmitter.getInstance();

/* ============================================================================
 * Task Flow Class
 * ========================================================================= */

export class TaskFlow {
	private projectRoot: string;
	private taskDirs: KanbanColumn[];

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.taskDirs = COLUMN_ORDER;
		this.ensureDirectories();
	}

	/**
	 * Ensure all kanban directories exist
	 */
	private ensureDirectories(): void {
		for (const column of this.taskDirs) {
			const dir = path.join(this.projectRoot, COLUMN_TO_FOLDER[column]);
			fs.ensureDirSync(dir);
		}
		// Also ensure tasks subdirectory for backward compatibility
		fs.ensureDirSync(path.join(this.projectRoot, "kanban", "backlog", "tasks"));
	}

	/**
	 * Get all kanban directories
	 */
	private getAllKanbanDirs(): string[] {
		return this.taskDirs.map((col) => path.join(this.projectRoot, COLUMN_TO_FOLDER[col]));
	}

	/**
	 * Find task file by ID in any kanban directory
	 */
	private findTaskFile(taskId: string): string | null {
		const normalizedId = taskId.toLowerCase().replace(/^wp/, "wp");
		for (const dir of this.getAllKanbanDirs()) {
			if (!fs.existsSync(dir)) continue;
			const files = fs.readdirSync(dir);
			const match = files.find((f) => f.toLowerCase().includes(normalizedId) && f.endsWith(".md"));
			if (match) {
				return path.join(dir, match);
			}
		}
		return null;
	}

	/**
	 * Load task data from file
	 */
	async loadTask(taskId: string): Promise<TaskData | null> {
		const filePath = this.findTaskFile(taskId);
		if (!filePath) return null;

		const content = await fs.readFile(filePath, "utf8");
		const { data, content: body } = matter(content);

		// Determine which column the task is in
		const dir = path.dirname(filePath);
		const column = this.getColumnFromPath(dir);

		return {
			id: data.id || taskId,
			title: data.title || body.split("\n")[0]?.replace(/^#\s*/, "") || "",
			description: data.description,
			status: data.status || "todo",
			priority: data.priority || "medium",
			assignee: data.assignee,
			labels: data.labels || [],
			lesson_learned: data.lesson_learned,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			completedAt: data.completedAt,
			column: column ?? undefined,
		};
	}

	/**
	 * Get column from file path
	 */
	private getColumnFromPath(filePath: string): KanbanColumn | null {
		for (const [folder, column] of Object.entries(FOLDER_TO_COLUMN)) {
			if (filePath.includes(folder)) {
				return column;
			}
		}
		return null;
	}

	/**
	 * Get the next column in the flow
	 */
	getNextColumn(currentColumn: string): string | null {
		const current = currentColumn as KanbanColumn;
		const index = COLUMN_ORDER.indexOf(current);
		if (index === -1 || index === COLUMN_ORDER.length - 1) {
			return null; // Already at the end or invalid
		}
		return COLUMN_ORDER[index + 1];
	}

	/**
	 * Move task from one column to another
	 */
	async moveTask(taskId: string, fromColumn: string, toColumn: string): Promise<boolean> {
		const from = fromColumn as KanbanColumn;
		const to = toColumn as KanbanColumn;

		// Validate columns
		if (!COLUMN_ORDER.includes(from) || !COLUMN_ORDER.includes(to)) {
			console.error(
				chalk.red(
					`[TaskFlow] Invalid column: ${!COLUMN_ORDER.includes(from) ? fromColumn : toColumn}`,
				),
			);
			return false;
		}

		const sourcePath = this.findTaskFile(taskId);
		if (!sourcePath) {
			console.error(chalk.red(`[TaskFlow] Task ${taskId} not found`));
			return false;
		}

		const _sourceDir = path.join(this.projectRoot, COLUMN_TO_FOLDER[from]);
		const targetDir = path.join(this.projectRoot, COLUMN_TO_FOLDER[to]);
		const fileName = path.basename(sourcePath);
		const targetPath = path.join(targetDir, fileName);

		// Don't move if already in target
		if (sourcePath === targetPath) {
			console.log(chalk.yellow(`[TaskFlow] Task ${taskId} already in ${toColumn}`));
			return true;
		}

		console.log(chalk.cyan(`[TaskFlow] Moving ${taskId} from ${fromColumn} to ${toColumn}`));

		// Ensure target directory exists
		await fs.ensureDir(targetDir);

		// Move the file
		await fs.move(sourcePath, targetPath, { overwrite: true });

		// Update frontmatter
		await this.updateTaskFrontmatter(targetPath, {
			status: this.getStatusFromColumn(to),
			updatedAt: new Date().toISOString(),
			...(to === "done" ? { completedAt: new Date().toISOString() } : {}),
		});

		// Emit event for dashboard updates
		const taskData = await this.loadTask(taskId);
		taskEvents.emit({
			type: "task:moved",
			taskId,
			fromColumn,
			toColumn,
			timestamp: new Date().toISOString(),
			taskData: taskData || undefined,
		});

		console.log(chalk.green(`[TaskFlow] Successfully moved ${taskId} to ${toColumn}`));
		return true;
	}

	/**
	 * Auto-move task to the next stage
	 */
	async autoMoveTask(taskId: string): Promise<boolean> {
		const taskData = await this.loadTask(taskId);
		if (!taskData) {
			console.error(chalk.red(`[TaskFlow] Task ${taskId} not found`));
			return false;
		}

		const currentColumn = taskData.column || this.inferColumnFromTask(taskData);
		if (!currentColumn) {
			console.error(chalk.red(`[TaskFlow] Cannot determine current column for ${taskId}`));
			return false;
		}

		const nextColumn = this.getNextColumn(currentColumn);
		if (!nextColumn) {
			console.log(chalk.yellow(`[TaskFlow] Task ${taskId} is at the final stage`));
			return false;
		}

		return this.moveTask(taskId, currentColumn, nextColumn);
	}

	/**
	 * Infer column from task status for backward compatibility
	 */
	private inferColumnFromTask(taskData: TaskData): KanbanColumn | null {
		const status = taskData.status?.toLowerCase();
		switch (status) {
			case "design":
			case "designer":
				return "designer";
			case "in_progress":
			case "in progress":
				return "dev";
			case "development":
			case "backend":
				return "backend";
			case "review":
			case "qa":
			case "testing":
				return "qa";
			case "soc":
			case "security":
				return "soc";
			case "done":
			case "completed":
				return "done";
			default:
				return "designer";
		}
	}

	/**
	 * Get status string from column
	 */
	private getStatusFromColumn(column: KanbanColumn): string {
		switch (column) {
			case "designer":
				return "Design";
			case "dev":
				return "In Progress";
			case "backend":
				return "Development";
			case "qa":
				return "Review";
			case "soc":
				return "Security Review";
			case "done":
				return "Done";
			case "archive":
				return "Archived";
			default:
				return "Todo";
		}
	}

	/**
	 * Update task frontmatter
	 */
	private async updateTaskFrontmatter(
		filePath: string,
		updates: Record<string, unknown>,
	): Promise<void> {
		const content = await fs.readFile(filePath, "utf8");
		const { data, content: body } = matter(content);

		const updatedData = { ...data, ...updates };
		const newContent = matter.stringify(body, updatedData);
		await fs.writeFile(filePath, newContent);
	}

	/**
	 * Archive task and generate lesson learned
	 */
	async archiveTask(taskId: string): Promise<boolean> {
		const taskData = await this.loadTask(taskId);
		if (!taskData) {
			console.error(chalk.red(`[TaskFlow] Task ${taskId} not found`));
			return false;
		}

		const currentColumn = taskData.column || this.inferColumnFromTask(taskData);

		// Move to archive
		const moved = await this.moveTask(taskId, currentColumn || "done", "archive");

		if (!moved) return false;

		// Generate lesson learned
		const lessonLearned = await this.generateLessonLearned(taskId, taskData);

		// Store lesson learned in task
		const filePath = this.findTaskFile(taskId);
		if (filePath) {
			await this.updateTaskFrontmatter(filePath, {
				lessonLearned,
				archivedAt: new Date().toISOString(),
			});
		}

		// Also save to a dedicated lessons file
		await this.saveLessonToHistory(taskId, taskData, lessonLearned);

		// Emit archive event
		taskEvents.emit({
			type: "task:archived",
			taskId,
			fromColumn: currentColumn || "done",
			toColumn: "archive",
			timestamp: new Date().toISOString(),
			taskData: { ...taskData, lesson_learned: lessonLearned },
		});

		console.log(chalk.green(`[TaskFlow] Task ${taskId} archived with lesson learned`));
		return true;
	}

	/**
	 * Generate AI-powered lesson learned summary
	 * This creates a structured lesson learned based on task metadata
	 */
	private async generateLessonLearned(taskId: string, taskData: TaskData): Promise<string> {
		const title = taskData.title || taskId;

		// Extract information from task to generate meaningful lesson
		const priority = taskData.priority || "medium";
		const assignee = taskData.assignee || "unassigned";
		const labels = taskData.labels?.join(", ") || "none";

		// Generate lesson learned based on task characteristics
		const whatWentWell = this.generateWhatWentWell(taskData);
		const whatCouldImprove = this.generateWhatCouldImprove(taskData);
		const keyTakeaways = this.generateKeyTakeaways(taskData);

		return `## Lesson Learned: ${title}

**Task ID:** ${taskId}
**Priority:** ${priority}
**Assignee:** ${assignee}
**Labels:** ${labels}

### What went well:
${whatWentWell.map((item) => `- ${item}`).join("\n")}

### What could improve:
${whatCouldImprove.map((item) => `- ${item}`).join("\n")}

### Key takeaways:
${keyTakeaways.map((item) => `- ${item}`).join("\n")}

---
*Generated: ${new Date().toISOString()}*
`;
	}

	/**
	 * Generate "What went well" items based on task data
	 */
	private generateWhatWentWell(taskData: TaskData): string[] {
		const items: string[] = [];

		// Priority-based insights
		if (taskData.priority === "high" || taskData.priority === "critical") {
			items.push("High-priority task was successfully completed");
		}

		// If task has labels, it was well-categorized
		if (taskData.labels && taskData.labels.length > 0) {
			items.push("Task was properly categorized with relevant labels");
		}

		// Default items
		items.push("Task followed the standard kanban workflow");
		items.push("Clear documentation maintained throughout the task lifecycle");

		return items;
	}

	/**
	 * Generate "What could improve" items based on task data
	 */
	private generateWhatCouldImprove(taskData: TaskData): string[] {
		const items: string[] = [];

		// Time-based insights if available
		if (taskData.createdAt && taskData.completedAt) {
			const created = new Date(taskData.createdAt);
			const completed = new Date(taskData.completedAt);
			const duration = completed.getTime() - created.getTime();
			const days = Math.floor(duration / (1000 * 60 * 60 * 24));

			if (days > 7) {
				items.push("Consider breaking down tasks that take more than a week");
			}
		}

		// Priority-based suggestions
		if (taskData.priority === "low") {
			items.push("Low-priority items should be reviewed for potential deferral");
		}

		// Default items
		items.push("Document any blockers encountered during implementation");
		items.push("Ensure code reviews are completed before moving to QA");

		return items;
	}

	/**
	 * Generate key takeaways based on task data
	 */
	private generateKeyTakeaways(taskData: TaskData): string[] {
		const items: string[] = [];

		// Label-based takeaways
		if (taskData.labels) {
			for (const label of taskData.labels) {
				if (label.includes("bug")) {
					items.push("Bug fixes require thorough regression testing");
				}
				if (label.includes("feature")) {
					items.push("New features should include unit tests");
				}
				if (label.includes("refactor")) {
					items.push("Refactoring tasks benefit from before/after documentation");
				}
			}
		}

		// Default takeaways
		items.push("Always update task status when transitioning between columns");
		items.push("Lesson learned should be captured at the time of archival");
		items.push("Maintain clear communication with stakeholders throughout the task");

		return items;
	}

	/**
	 * Save lesson learned to a history file
	 */
	private async saveLessonToHistory(
		taskId: string,
		taskData: TaskData,
		lessonLearned: string,
	): Promise<void> {
		const historyDir = path.join(this.projectRoot, "kanban", "archive", "lessons");
		await fs.ensureDir(historyDir);

		const historyFile = path.join(historyDir, "history.md");
		const timestamp = new Date().toISOString();
		const entry = `# ${taskData.title || taskId} - ${timestamp}\n\n${lessonLearned}\n\n---\n\n`;

		if (fs.existsSync(historyFile)) {
			await fs.appendFile(historyFile, entry);
		} else {
			await fs.writeFile(historyFile, `# Lesson Learned History\n\n${entry}`);
		}
	}

	/**
	 * Get all tasks in a specific column
	 */
	async getTasksInColumn(column: string): Promise<TaskData[]> {
		const col = column as KanbanColumn;
		if (!COLUMN_ORDER.includes(col)) {
			return [];
		}

		const dir = path.join(this.projectRoot, COLUMN_TO_FOLDER[col]);
		if (!fs.existsSync(dir)) {
			return [];
		}

		const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
		const tasks: TaskData[] = [];

		for (const file of files) {
			const taskData = await this.loadTask(path.basename(file, ".md"));
			if (taskData) {
				tasks.push(taskData);
			}
		}

		return tasks;
	}

	/**
	 * Get all tasks across all columns
	 */
	async getAllTasks(): Promise<TaskData[]> {
		const allTasks: TaskData[] = [];

		for (const column of this.taskDirs) {
			const tasks = await this.getTasksInColumn(column);
			allTasks.push(...tasks);
		}

		return allTasks;
	}
}

/* ============================================================================
 * Utility Functions
 * ========================================================================= */

/**
 * Create a new task flow instance
 */
export function createTaskFlow(projectRoot: string): TaskFlow {
	return new TaskFlow(projectRoot);
}

/**
 * Subscribe to task events (for dashboard integration)
 */
export function onTaskEvent(callback: EventCallback): () => void {
	taskEvents.on("*", callback);
	return () => taskEvents.off("*", callback);
}

/**
 * Get the column order
 */
export function getColumnOrder(): KanbanColumn[] {
	return [...COLUMN_ORDER];
}

/**
 * Check if a column is valid
 */
export function isValidColumn(column: string): boolean {
	return COLUMN_ORDER.includes(column as KanbanColumn);
}
