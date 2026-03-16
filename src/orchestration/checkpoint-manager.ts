import crypto from "node:crypto";
import { DashboardService } from "../../dashboard/dashboard-service.js";

export interface CheckpointChoice {
	id: string;
	label: string;
	value: string;
}

export interface CheckpointRequest {
	id: string;
	taskId: string;
	message: string;
	choices: CheckpointChoice[];
}

/**
 * [Phase 29] CheckpointManager
 * Manages human-in-the-loop validation and pending decisions.
 */
export class CheckpointManager {
	private feed = DashboardService.getInstance();
	private pendingResolutions: Map<string, (choice: string) => void> = new Map();

	/**
	 * Pauses execution and waits for user feedback from the dashboard.
	 * SECURITY: Uses crypto.randomBytes() for secure checkpoint ID generation.
	 * Math.random() is predictable and should never be used for security-sensitive IDs.
	 */
	public async requestValidation(
		taskId: string,
		message: string,
		choices: CheckpointChoice[],
	): Promise<string> {
		// SECURITY: Use crypto.randomBytes instead of Math.random for secure ID generation
		const randomSuffix = crypto.randomBytes(4).toString("base64url").slice(0, 8);
		const id = `checkpoint_${Date.now()}_${randomSuffix}`;

		const request: CheckpointRequest = { id, taskId, message, choices };

		return new Promise((resolve) => {
			this.pendingResolutions.set(id, (choice: string) => {
				resolve(choice);
				this.pendingResolutions.delete(id);
			});

			this.feed.emitThought("CHECKPOINT", `[AWAITING SENSEI] ${message}`, {
				taskId,
				checkpointId: id,
			});
			this.feed.emitEvent("checkpoint_request", request);
		});
	}

	/**
	 * Called by the API when a user makes a choice on the dashboard.
	 */
	public resolveCheckpoint(id: string, choice: string) {
		const resolver = this.pendingResolutions.get(id);
		if (resolver) {
			resolver(choice);
		}
	}
}

let instance: CheckpointManager | null = null;
export const getCheckpointManager = () => {
	if (!instance) instance = new CheckpointManager();
	return instance;
};
