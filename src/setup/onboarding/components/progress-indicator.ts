/**
 * Progress Indicator Component for Aizen-Gate Onboarding
 * Provides visual feedback during installation and startup steps
 */

import { spinner as clackSpinner } from "@clack/prompts";
import chalk from "chalk";

/**
 * Progress step configuration
 */
export interface ProgressStep {
	/** Step identifier */
	id: string;
	/** Display name for the step */
	name: string;
	/** Optional description */
	description?: string;
	/** Whether this step is optional */
	optional?: boolean;
}

/**
 * Progress state for a single step
 */
export interface StepState {
	step: ProgressStep;
	status: "pending" | "running" | "completed" | "failed" | "skipped";
	message?: string;
	duration?: number;
}

/**
 * Multi-step progress tracker
 */
export class ProgressTracker {
	private steps: StepState[] = [];
	private currentStepIndex: number = -1;
	private startTime: number = 0;
	private stepStartTime: number = 0;

	constructor(steps: ProgressStep[]) {
		this.steps = steps.map((step) => ({
			step,
			status: "pending" as const,
		}));
	}

	/**
	 * Start the progress tracker
	 */
	start(title?: string): void {
		this.startTime = Date.now();
		if (title) {
			console.log();
			console.log(chalk.bold.cyan(`▸ ${title}`));
			console.log(chalk.dim("─".repeat(50)));
		}
		this.render();
	}

	/**
	 * Start a specific step
	 */
	startStep(stepId: string, message?: string): void {
		const index = this.steps.findIndex((s) => s.step.id === stepId);
		if (index === -1) return;

		this.currentStepIndex = index;
		this.stepStartTime = Date.now();
		this.steps[index].status = "running";
		this.steps[index].message = message || this.steps[index].step.name;
		this.render();
	}

	/**
	 * Complete the current step
	 */
	completeStep(stepId: string, message?: string): void {
		const index = this.steps.findIndex((s) => s.step.id === stepId);
		if (index === -1) return;

		this.steps[index].status = "completed";
		this.steps[index].message = message || this.steps[index].step.name;
		this.steps[index].duration = Date.now() - this.stepStartTime;
		this.render();
	}

	/**
	 * Fail the current step
	 */
	failStep(stepId: string, error?: string): void {
		const index = this.steps.findIndex((s) => s.step.id === stepId);
		if (index === -1) return;

		this.steps[index].status = "failed";
		this.steps[index].message = error || this.steps[index].step.name;
		this.render();
	}

	/**
	 * Skip a step
	 */
	skipStep(stepId: string, reason?: string): void {
		const index = this.steps.findIndex((s) => s.step.id === stepId);
		if (index === -1) return;

		this.steps[index].status = "skipped";
		this.steps[index].message = reason || this.steps[index].step.name;
		this.render();
	}

	/**
	 * Complete all tracking and show summary
	 */
	finish(title?: string): void {
		const totalDuration = Date.now() - this.startTime;
		const completed = this.steps.filter((s) => s.status === "completed").length;
		const failed = this.steps.filter((s) => s.status === "failed").length;
		const skipped = this.steps.filter((s) => s.status === "skipped").length;

		console.log();
		console.log(chalk.dim("─".repeat(50)));

		if (title) {
			console.log(chalk.bold(title));
		}

		// Summary stats
		const stats: string[] = [];
		stats.push(chalk.green(`✓ ${completed} completed`));
		if (skipped > 0) stats.push(chalk.yellow(`○ ${skipped} skipped`));
		if (failed > 0) stats.push(chalk.red(`✗ ${failed} failed`));

		console.log(`  ${stats.join(chalk.dim(" | "))}`);
		console.log(chalk.dim(`  Total time: ${this.formatDuration(totalDuration)}`));
		console.log();
	}

	/**
	 * Render current progress state
	 */
	private render(): void {
		// Move cursor up to redraw
		const linesToClear = this.steps.length + 2;
		process.stdout.write(`\x1b[${linesToClear}A\x1b[0J`);

		// Draw each step
		for (let i = 0; i < this.steps.length; i++) {
			const state = this.steps[i];
			const prefix = i === this.steps.length - 1 ? "└─" : "├─";
			this.renderStep(state, prefix);
		}

		// Draw progress bar
		this.renderProgressBar();
	}

	/**
	 * Render a single step
	 */
	private renderStep(state: StepState, prefix: string): void {
		const { step, status, message, duration } = state;
		let icon: string;
		let color: (text: string) => string;

		switch (status) {
			case "pending":
				icon = "○";
				color = chalk.dim;
				break;
			case "running":
				icon = "◐";
				color = chalk.cyan;
				break;
			case "completed":
				icon = "✓";
				color = chalk.green;
				break;
			case "failed":
				icon = "✗";
				color = chalk.red;
				break;
			case "skipped":
				icon = "○";
				color = chalk.yellow;
				break;
			default:
				icon = "○";
				color = chalk.dim;
		}

		const durationStr = duration ? chalk.dim(` (${this.formatDuration(duration)})`) : "";
		const optionalStr = step.optional ? chalk.dim(" [optional]") : "";

		console.log(
			`  ${chalk.dim(prefix)} ${color(icon)} ${color(message || step.name)}${optionalStr}${durationStr}`,
		);
	}

	/**
	 * Render progress bar
	 */
	private renderProgressBar(): void {
		const total = this.steps.length;
		const completed = this.steps.filter(
			(s) => s.status === "completed" || s.status === "skipped",
		).length;
		const percentage = Math.round((completed / total) * 100);
		const barWidth = 30;
		const filled = Math.round((completed / total) * barWidth);
		const empty = barWidth - filled;

		const bar = chalk.cyan("█".repeat(filled)) + chalk.dim("░".repeat(empty));
		const percentStr = `${percentage}%`.padStart(4);

		console.log();
		console.log(`  ${bar} ${chalk.bold(percentStr)}`);
	}

	/**
	 * Format duration in human-readable format
	 */
	private formatDuration(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
	}

	/**
	 * Get current progress percentage
	 */
	getProgress(): number {
		const completed = this.steps.filter(
			(s) => s.status === "completed" || s.status === "skipped",
		).length;
		return Math.round((completed / this.steps.length) * 100);
	}

	/**
	 * Check if all steps completed successfully
	 */
	isComplete(): boolean {
		return this.steps.every(
			(s) => s.status === "completed" || (s.status === "skipped" && s.step.optional),
		);
	}

	/**
	 * Check if any step failed
	 */
	hasFailures(): boolean {
		return this.steps.some((s) => s.status === "failed");
	}
}

/**
 * Simple progress bar for single operations
 */
export class ProgressBar {
	private current: number = 0;
	private width: number;
	private startTime: number = 0;

	constructor(
		private total: number,
		options: { width?: number } = {},
	) {
		this.width = options.width || 30;
	}

	/**
	 * Start the progress bar
	 */
	start(message?: string): void {
		this.startTime = Date.now();
		if (message) {
			console.log(chalk.dim(message));
		}
		this.render();
	}

	/**
	 * Update progress
	 */
	update(current: number, message?: string): void {
		this.current = Math.min(current, this.total);
		this.render(message);
	}

	/**
	 * Increment progress
	 */
	increment(message?: string): void {
		this.update(this.current + 1, message);
	}

	/**
	 * Complete the progress bar
	 */
	complete(message?: string): void {
		this.current = this.total;
		this.render(message);

		const duration = Date.now() - this.startTime;
		console.log();
		if (message) {
			console.log(chalk.green(`  ✓ ${message}`) + chalk.dim(` (${this.formatDuration(duration)})`));
		}
	}

	/**
	 * Render the progress bar
	 */
	private render(message?: string): void {
		const percentage = Math.round((this.current / this.total) * 100);
		const filled = Math.round((this.current / this.total) * this.width);
		const empty = this.width - filled;

		const bar = chalk.cyan("█".repeat(filled)) + chalk.dim("░".repeat(empty));
		const currentStr = String(this.current).padStart(String(this.total).length);
		const percentStr = `${percentage}%`.padStart(4);

		const line = `  ${bar} ${percentStr} ${chalk.dim(`[${currentStr}/${this.total}]`)}`;

		// Clear line and render
		process.stdout.write(`\r${line}`);

		if (message) {
			process.stdout.write(` ${chalk.dim(message)}`);
		}
	}

	/**
	 * Format duration
	 */
	private formatDuration(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	}
}

/**
 * Animated spinner with message
 */
export class ProgressSpinner {
	private spinner: ReturnType<typeof clackSpinner>;
	private message: string;

	constructor(message: string) {
		this.message = message;
		this.spinner = clackSpinner();
	}

	/**
	 * Start the spinner
	 */
	start(message?: string): void {
		this.spinner.start(message || this.message);
	}

	/**
	 * Update the spinner message
	 */
	update(message: string): void {
		this.message = message;
	}

	/**
	 * Stop with success
	 */
	success(message?: string): void {
		this.spinner.stop(message || this.message);
	}

	/**
	 * Stop with error
	 */
	error(message?: string): void {
		this.spinner.stop(message || this.message);
	}

	/**
	 * Stop with warning
	 */
	warn(message?: string): void {
		this.spinner.stop(message || this.message);
	}

	/**
	 * Stop the spinner
	 */
	stop(_code: number = 0): void {
		this.spinner.stop(this.message);
	}
}

/**
 * Quick progress display for simple operations
 */
export function showProgress(
	steps: Array<{ name: string; action: () => Promise<void> | void }>,
): Promise<{ success: boolean; errors: Error[] }> {
	return new Promise(async (resolve) => {
		const errors: Error[] = [];
		const tracker = new ProgressTracker(steps.map((s, i) => ({ id: String(i), name: s.name })));

		tracker.start("Processing...");

		for (let i = 0; i < steps.length; i++) {
			const stepId = String(i);
			tracker.startStep(stepId);

			try {
				await steps[i].action();
				tracker.completeStep(stepId);
			} catch (error) {
				tracker.failStep(stepId, (error as Error).message);
				errors.push(error as Error);
			}
		}

		tracker.finish();
		resolve({ success: errors.length === 0, errors });
	});
}

/**
 * Create a simple loading indicator
 */
export function createLoadingIndicator(message: string): {
	start: () => void;
	success: (msg?: string) => void;
	error: (msg?: string) => void;
} {
	const s = clackSpinner();

	return {
		start: () => s.start(message),
		success: (msg) => s.stop(msg || message),
		error: (msg) => s.stop(msg || message),
	};
}

/**
 * Standard installation steps for Aizen-Gate
 */
export const INSTALL_STEPS: ProgressStep[] = [
	{
		id: "check-prerequisites",
		name: "Checking prerequisites",
		description: "Verifying system requirements",
	},
	{
		id: "validate-env",
		name: "Validating environment",
		description: "Checking Node.js and npm versions",
	},
	{
		id: "load-config",
		name: "Loading configuration",
		description: "Reading existing settings",
	},
	{
		id: "setup-directories",
		name: "Creating project structure",
		description: "Setting up directories",
	},
	{
		id: "install-deps",
		name: "Installing dependencies",
		description: "Downloading required packages",
		optional: true,
	},
	{
		id: "configure-ide",
		name: "Configuring IDE integration",
		description: "Setting up IDE rules",
	},
	{
		id: "create-config",
		name: "Creating configuration files",
		description: "Writing config files",
	},
	{
		id: "finalize",
		name: "Finalizing setup",
		description: "Completing installation",
	},
];

/**
 * Standard startup steps for Aizen-Gate
 */
export const START_STEPS: ProgressStep[] = [
	{
		id: "load-config",
		name: "Loading configuration",
		description: "Reading project settings",
	},
	{
		id: "init-session",
		name: "Initializing session",
		description: "Setting up workspace",
	},
	{
		id: "load-agents",
		name: "Loading AI agents",
		description: "Preparing agent system",
	},
	{
		id: "init-kanban",
		name: "Setting up Kanban board",
		description: "Creating task board",
	},
	{
		id: "check-prd",
		name: "Checking for PRD",
		description: "Looking for existing PRD",
	},
	{
		id: "start-services",
		name: "Starting services",
		description: "Launching background services",
	},
	{ id: "ready", name: "Ready", description: "System ready" },
];

/**
 * Create an installation progress tracker
 */
export function createInstallTracker(): ProgressTracker {
	return new ProgressTracker(INSTALL_STEPS);
}

/**
 * Create a startup progress tracker
 */
export function createStartTracker(): ProgressTracker {
	return new ProgressTracker(START_STEPS);
}
