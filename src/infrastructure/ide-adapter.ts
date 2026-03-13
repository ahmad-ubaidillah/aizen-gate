/**
 * [Phase 21] Unified IDE Adapter Layer
 * Standardizes communication between Aizen-Gate and different AI-native IDEs.
 */
export interface IDEContext {
	platform: "cursor" | "windsurf" | "vscode" | "cli";
	capabilities: {
		readFiles: boolean;
		editFiles: boolean;
		runTerminal: boolean;
		mcpSupport: boolean;
	};
}

export abstract class IDEAdapter {
	abstract getContext(): IDEContext;
	abstract notifyUser(message: string): Promise<void>;
	abstract triggerTask(taskId: string): Promise<void>;
}

/**
 * Generic CLI Adapter
 */
export class CLIAdapter extends IDEAdapter {
	getContext(): IDEContext {
		return {
			platform: "cli",
			capabilities: {
				readFiles: true,
				editFiles: true,
				runTerminal: true,
				mcpSupport: false,
			},
		};
	}

	async notifyUser(message: string): Promise<void> {
		console.log(`\n⛩️ [AIZEN] ${message}\n`);
	}

	async triggerTask(taskId: string): Promise<void> {
		console.log(`[Adapter] Manually triggering task: ${taskId}`);
	}
}
