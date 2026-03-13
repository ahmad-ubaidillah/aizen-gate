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
	 */
	public async requestValidation(
		taskId: string,
		message: string,
		choices: CheckpointChoice[],
	): Promise<string> {
		const id = `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

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
