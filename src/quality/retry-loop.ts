import chalk from "chalk";

/**
 * Review State Enum
 * Represents the lifecycle of a review in the retry loop
 */
export enum ReviewState {
	PENDING = "pending",
	IN_REVIEW = "in_review",
	FAILED = "failed",
	SUCCESS = "success",
	ABORTED = "aborted",
}

/**
 * Task Review Record
 * Stores all information about a single task's review attempts
 */
export interface TaskReviewRecord {
	taskId: string;
	state: ReviewState;
	currentAttempt: number;
	maxRetries: number;
	failures: FailureRecord[];
	successAt?: number;
	startedAt: number;
	previousState?: string;
	currentState?: string;
}

/**
 * Failure Record
 * Stores information about each failure attempt
 */
export interface FailureRecord {
	attempt: number;
	reason: string;
	timestamp: number;
	fixedIssues: string[];
}

/**
 * Diff Report
 * Shows changes between attempts
 */
export interface DiffReport {
	taskId: string;
	attemptFrom: number;
	attemptTo: number;
	changes: string[];
	summary: string;
}

/**
 * Rejection Summary
 * Aggregates all rejection reasons for a task
 */
export interface RejectionSummary {
	taskId: string;
	totalAttempts: number;
	totalFailures: number;
	reasonsByCategory: Record<string, number>;
	allReasons: string[];
	recommendation: string;
}

/**
 * RetryLoop Class
 * Manages the review-retry-fix-merge workflow with max 3 attempts
 */
export class RetryLoop {
	private maxRetries: number;
	private reviews: Map<string, TaskReviewRecord>;

	constructor(maxRetries: number = 3) {
		this.maxRetries = maxRetries;
		this.reviews = new Map();
	}

	/**
	 * Start a new review for a task
	 * @param taskId - The task to review
	 * @returns The initial ReviewState
	 */
	startReview(taskId: string): ReviewState {
		const existing = this.reviews.get(taskId);

		if (existing) {
			// Resume existing review
			if (existing.state === ReviewState.SUCCESS) {
				console.log(chalk.green(`[RetryLoop] Task ${taskId} already completed successfully`));
				return existing.state;
			}

			if (existing.state === ReviewState.ABORTED) {
				console.log(
					chalk.yellow(`[RetryLoop] Task ${taskId} was previously aborted. Starting fresh.`),
				);
			}

			// Store previous state for diff tracking
			existing.previousState = existing.currentState;
			existing.currentState = ReviewState.IN_REVIEW;
			existing.state = ReviewState.IN_REVIEW;

			console.log(
				chalk.blue(
					`[RetryLoop] Resuming review for task ${taskId} (attempt ${existing.currentAttempt}/${this.maxRetries})`,
				),
			);
			return existing.state;
		}

		// New review
		const record: TaskReviewRecord = {
			taskId,
			state: ReviewState.IN_REVIEW,
			currentAttempt: 1,
			maxRetries: this.maxRetries,
			failures: [],
			startedAt: Date.now(),
			currentState: ReviewState.IN_REVIEW,
		};

		this.reviews.set(taskId, record);

		console.log(
			chalk.blue(
				`[RetryLoop] Starting new review for task ${taskId} (attempt 1/${this.maxRetries})`,
			),
		);

		return ReviewState.IN_REVIEW;
	}

	/**
	 * Record a failure for a task
	 * @param taskId - The task that failed
	 * @param reason - The reason for failure
	 */
	recordFailure(taskId: string, reason: string): void {
		const record = this.reviews.get(taskId);

		if (!record) {
			console.log(chalk.red(`[RetryLoop] Error: No review record found for task ${taskId}`));
			return;
		}

		// Extract fixed issues from reason if mentioned
		const fixedIssues = this.extractFixedIssues(reason);

		const failure: FailureRecord = {
			attempt: record.currentAttempt,
			reason,
			timestamp: Date.now(),
			fixedIssues,
		};

		record.failures.push(failure);
		record.state = ReviewState.FAILED;
		record.previousState = record.currentState;
		record.currentState = ReviewState.FAILED;

		console.log(
			chalk.red(
				`[RetryLoop] Task ${taskId} FAILED on attempt ${record.currentAttempt}/${this.maxRetries}`,
			),
		);
		console.log(chalk.yellow(`  Reason: ${reason}`));

		// Check if we should abort
		if (this.shouldAbort(taskId)) {
			record.state = ReviewState.ABORTED;
			console.log(
				chalk.red.bold(
					`[RetryLoop] Task ${taskId} ABORTED after ${record.currentAttempt} failed attempts`,
				),
			);
		}
	}

	/**
	 * Record a success for a task
	 * @param taskId - The task that passed
	 */
	recordSuccess(taskId: string): void {
		const record = this.reviews.get(taskId);

		if (!record) {
			console.log(chalk.red(`[RetryLoop] Error: No review record found for task ${taskId}`));
			return;
		}

		record.state = ReviewState.SUCCESS;
		record.successAt = Date.now();
		record.previousState = record.currentState;
		record.currentState = ReviewState.SUCCESS;

		console.log(
			chalk.green.bold(
				`[RetryLoop] Task ${taskId} PASSED on attempt ${record.currentAttempt}/${this.maxRetries}! Ready for merge.`,
			),
		);
	}

	/**
	 * Check if a task can be retried
	 * @param taskId - The task to check
	 * @returns true if retries remaining
	 */
	canRetry(taskId: string): boolean {
		const record = this.reviews.get(taskId);

		if (!record) {
			return true; // No record means not started yet
		}

		if (record.state === ReviewState.SUCCESS) {
			return false;
		}

		if (record.state === ReviewState.ABORTED) {
			return false;
		}

		return record.currentAttempt < this.maxRetries;
	}

	/**
	 * Check if a task should be aborted (max retries exceeded)
	 * @param taskId - The task to check
	 * @returns true if should abort
	 */
	shouldAbort(taskId: string): boolean {
		const record = this.reviews.get(taskId);

		if (!record) {
			return false;
		}

		return record.currentAttempt >= this.maxRetries;
	}

	/**
	 * Increment attempt counter for a task
	 * @param taskId - The task to advance
	 */
	incrementAttempt(taskId: string): void {
		const record = this.reviews.get(taskId);

		if (!record) {
			console.log(chalk.red(`[RetryLoop] Error: No review record found for task ${taskId}`));
			return;
		}

		if (record.currentAttempt < this.maxRetries) {
			record.currentAttempt++;
			record.state = ReviewState.IN_REVIEW;
			console.log(
				chalk.blue(
					`[RetryLoop] Advancing task ${taskId} to attempt ${record.currentAttempt}/${this.maxRetries}`,
				),
			);
		}
	}

	/**
	 * Generate a diff report for a task
	 * Shows what changed between attempts
	 * @param taskId - The task to generate diff for
	 * @param fromAttempt - Starting attempt (default: last failure)
	 * @param toAttempt - Ending attempt (default: current)
	 * @returns DiffReport object
	 */
	getDiffReport(taskId: string, fromAttempt?: number, toAttempt?: number): DiffReport | null {
		const record = this.reviews.get(taskId);

		if (!record) {
			console.log(chalk.red(`[RetryLoop] Error: No review record found for task ${taskId}`));
			return null;
		}

		const failures = record.failures;
		if (failures.length === 0) {
			console.log(chalk.yellow(`[RetryLoop] No failures recorded for task ${taskId}`));
			return null;
		}

		const from = fromAttempt ?? failures.length - 1;
		const to = toAttempt ?? record.currentAttempt;

		if (from < 0 || from >= failures.length || to > failures.length) {
			console.log(chalk.red(`[RetryLoop] Invalid attempt range for diff report`));
			return null;
		}

		const changes: string[] = [];
		const fromFailure = failures[from];
		const toFailure = failures[to - 1] || fromFailure;

		// Compare reasons
		if (fromFailure.reason !== toFailure.reason) {
			changes.push(`Reason changed: "${fromFailure.reason}" → "${toFailure.reason}"`);
		}

		// Compare fixed issues
		const newIssues = toFailure.fixedIssues.filter(
			(issue) => !fromFailure.fixedIssues.includes(issue),
		);
		if (newIssues.length > 0) {
			changes.push(`New fixes applied: ${newIssues.join(", ")}`);
		}

		const summary = `Attempt ${from + 1} → Attempt ${to}: ${
			changes.length > 0 ? changes.join("; ") : "No changes detected"
		}`;

		console.log(chalk.cyan(`\n[RetryLoop] Diff Report for ${taskId}:`));
		console.log(chalk.cyan("─".repeat(50)));
		changes.forEach((change) => console.log(`  ${change}`));
		console.log(chalk.cyan("─".repeat(50)));

		return {
			taskId,
			attemptFrom: from + 1,
			attemptTo: to,
			changes,
			summary,
		};
	}

	/**
	 * Generate rejection summary for a task
	 * Aggregates all rejection reasons
	 * @param taskId - The task to summarize
	 * @returns RejectionSummary object
	 */
	getRejectionSummary(taskId: string): RejectionSummary | null {
		const record = this.reviews.get(taskId);

		if (!record) {
			console.log(chalk.red(`[RetryLoop] Error: No review record found for task ${taskId}`));
			return null;
		}

		const reasonsByCategory: Record<string, number> = {};
		const allReasons: string[] = [];

		record.failures.forEach((failure) => {
			allReasons.push(failure.reason);

			// Categorize reason
			const category = this.categorizeReason(failure.reason);
			reasonsByCategory[category] = (reasonsByCategory[category] || 0) + 1;
		});

		// Generate recommendation
		let recommendation = "";
		if (record.state === ReviewState.SUCCESS) {
			recommendation = "Task completed successfully. Ready for merge.";
		} else if (record.state === ReviewState.ABORTED) {
			recommendation = `Task aborted after ${record.currentAttempt} attempts. Manual intervention required.`;
		} else {
			recommendation = `Task has ${record.failures.length} failure(s). ${
				this.canRetry(taskId) ? "Retry available." : "No retries remaining - consider aborting."
			}`;
		}

		const summary: RejectionSummary = {
			taskId,
			totalAttempts: record.currentAttempt,
			totalFailures: record.failures.length,
			reasonsByCategory,
			allReasons,
			recommendation,
		};

		console.log(chalk.cyan(`\n[RetryLoop] Rejection Summary for ${taskId}:`));
		console.log(chalk.cyan("─".repeat(50)));
		console.log(`  Total Attempts: ${summary.totalAttempts}`);
		console.log(`  Total Failures: ${summary.totalFailures}`);
		console.log(`  Reasons by Category:`);
		Object.entries(summary.reasonsByCategory).forEach(([category, count]) => {
			console.log(`    - ${category}: ${count}`);
		});
		console.log(`  Recommendation: ${summary.recommendation}`);
		console.log(chalk.cyan("─".repeat(50)));

		return summary;
	}

	/**
	 * Get all review records
	 * @returns Map of all reviews
	 */
	getAllReviews(): Map<string, TaskReviewRecord> {
		return this.reviews;
	}

	/**
	 * Get a specific review record
	 * @param taskId - The task ID
	 * @returns TaskReviewRecord or undefined
	 */
	getReview(taskId: string): TaskReviewRecord | undefined {
		return this.reviews.get(taskId);
	}

	/**
	 * Reset/clear a review record
	 * @param taskId - The task to reset
	 */
	resetReview(taskId: string): void {
		this.reviews.delete(taskId);
		console.log(chalk.yellow(`[RetryLoop] Review record cleared for task ${taskId}`));
	}

	/**
	 * Extract fixed issues from a failure reason
	 * Looks for patterns like "fixed: X, Y, Z" or "fixed: X; Y; Z" in the reason
	 */
	private extractFixedIssues(reason: string): string[] {
		// Match various formats: "fixed: X, Y, Z" or "fixed: X; Y; Z" or "fixed - X, Y"
		const fixedMatch = reason.match(/(?:fixed|fixes|resolved)[:-]?\s*(.+)/i);
		if (fixedMatch?.[1]) {
			// Split by comma, semicolon, or " and " while preserving complex items
			const items = fixedMatch[1]
				.split(/[,;]|\s+and\s+/i)
				.map((s) => s.trim())
				.filter(Boolean)
				// Clean up any leading dashes, bullets, or numbers
				.map((s) => s.replace(/^[-\d.)\u2022\u2023\u25E6\u2043\u2219]+\s*/, ""));
			return items;
		}
		return [];
	}

	/**
	 * Categorize a rejection reason
	 * Groups reasons into categories for summary
	 */
	private categorizeReason(reason: string): string {
		const lower = reason.toLowerCase();

		if (lower.includes("test") || lower.includes("failing")) {
			return "Test Failure";
		}
		if (lower.includes("lint") || lower.includes("format")) {
			return "Code Quality";
		}
		if (lower.includes("security") || lower.includes("vuln")) {
			return "Security";
		}
		if (lower.includes("type") || lower.includes("typescript")) {
			return "Type Error";
		}
		if (lower.includes("import") || lower.includes("module")) {
			return "Module Error";
		}
		if (lower.includes("logic") || lower.includes("bug")) {
			return "Logic Bug";
		}
		if (lower.includes("performance") || lower.includes("slow")) {
			return "Performance";
		}
		if (lower.includes("missing") || lower.includes("undefined")) {
			return "Missing Definition";
		}

		return "Other";
	}
}

/**
 * Factory function to create a new RetryLoop instance
 */
export function createRetryLoop(maxRetries: number = 3): RetryLoop {
	return new RetryLoop(maxRetries);
}

export default RetryLoop;
