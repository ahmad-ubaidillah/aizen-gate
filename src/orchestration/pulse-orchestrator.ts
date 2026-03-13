import chalk from "chalk";
import { DashboardService } from "../../dashboard/dashboard-service.js";
import { getCheckpointManager } from "./checkpoint-manager.js";
import { getConsensusEngine } from "./consensus-engine.js";
import { getEntropyAnalyzer } from "./entropy-analyzer.js";
import { getGhostSimulator } from "./ghost-simulator.js";

export enum PulseStage {
	PLAN = "PLAN",
	SIMULATE = "SIMULATE",
	FIX = "FIX",
	COMMIT = "COMMIT",
	IDLE = "IDLE",
}

/**
 * [Phase 25] PulseOrchestrator
 * Manages multi-stage autonomous loops with auto-correction.
 */
export class PulseOrchestrator {
	private feed = DashboardService.getInstance();
	private projectDir: string;
	private currentStage: PulseStage = PulseStage.IDLE;

	constructor(projectDir: string) {
		this.projectDir = projectDir;
	}

	private emitPulseUpdate(stage: PulseStage, message: string, payload: any = {}) {
		this.currentStage = stage;
		this.feed.emitThought("PULSE_v2", `[${stage}] ${message}`, { stage, ...payload });
		// This will be used for the Live Pulse Map in Dashboard
		this.feed.emitEvent("pulse_update", { stage, message, payload });
	}

	/**
	 * Executes a multi-stage autonomous cycle for a given proposal/task.
	 */
	async executeCycle(taskId: string, action: string, payload: any): Promise<boolean> {
		console.log(chalk.magenta(`\n--- ⛩️ [Pulse v2] Starting Cycle for ${taskId} ---`));

		// 1. STAGE: PLAN
		this.emitPulseUpdate(PulseStage.PLAN, `Assembling context for ${taskId}...`, { taskId });
		// (In a real implementation, this would call ContextEngine)
		await new Promise((r) => setTimeout(r, 800)); // Simulate work

		// 2. STAGE: SIMULATE
		this.emitPulseUpdate(PulseStage.SIMULATE, `Running Ghost-Simulation for ${taskId}...`, {
			taskId,
		});
		const ghost = getGhostSimulator(this.projectDir);

		if (action === "WRITE") {
			await ghost.simulateWrite(payload.path || "ghost_file.ts", payload.content);
		}

		const ghostReport = await ghost.verifySimulatedState();

		// 3. STAGE: FIX (Conditional)
		if (!ghostReport.success) {
			this.emitPulseUpdate(PulseStage.FIX, `Simulation failed. Triggering Auto-Correction...`, {
				errors: ghostReport.errors,
			});
			// (Future step: Implement Llama-driven auto-fix)
			console.log(chalk.red(`[Pulse v2] Auto-correction triggered for ${taskId}`));
			await new Promise((r) => setTimeout(r, 1500));
			// For now, we still fail or mock a fix
			return false;
		}

		// Phase 29: Sensei Checkpoint before commit
		const checkpoints = getCheckpointManager();
		const senseiChoice = await checkpoints.requestValidation(
			taskId,
			`Agent Swarm proposing commit for ${taskId}. Proceed with write?`,
			[
				{ id: "approve", label: "✅ Approve & Commit", value: "APPROVE" },
				{ id: "reject", label: "❌ Reject & Abort", value: "REJECT" },
				{ id: "analyze", label: "🔍 Request More Analysis", value: "ANALYZE" },
			],
		);

		if (senseiChoice === "REJECT") {
			this.feed.emitThought(
				"PULSE_v2",
				`Sensei REJECTED the proposal for ${taskId}. Aborting cycle.`,
				{ success: false },
			);
			this.emitPulseUpdate(PulseStage.IDLE, `User rejected commit. Cycle aborted.`, { taskId });
			return false;
		}

		if (senseiChoice === "ANALYZE") {
			this.feed.emitThought(
				"PULSE_v2",
				`Sensei requested more analysis for ${taskId}. Re-triggering SIMULATE stage.`,
				{ success: true },
			);
			// In a real impl, we would loop back to SIMULATE. For now, simple log.
			this.emitPulseUpdate(
				PulseStage.IDLE,
				`User requested more analysis. Cycle aborted for now.`,
				{ taskId },
			);
			return false; // For now, treat as abort
		}

		// 4. STAGE: COMMIT (via Consensus)
		this.emitPulseUpdate(PulseStage.COMMIT, `Verification passed. Seeking Swarm Consensus...`, {
			taskId,
		});
		const consensus = getConsensusEngine();
		const result = await consensus.evaluateProposal({
			id: taskId,
			proposer: "@Aizen-Orchestrator",
			action,
			payload,
			timestamp: new Date().toISOString(),
			metadata: {
				version: "2.3.0",
				engine: "aizen-gate",
			},
		});

		if (result.approved) {
			this.emitPulseUpdate(PulseStage.COMMIT, `Consensus reached. Persisting changes to reality.`, {
				taskId,
			});
			if (action === "WRITE") {
				await ghost.commitToDisk();
			}

			// Run Entropy Analysis after commit
			const entropyAnalyzer = getEntropyAnalyzer(this.projectDir);
			const entropyReport = await entropyAnalyzer.analyzeEntropy(payload.path || "."); // Analyze the relevant path or project root
			this.feed.emitEvent("entropy_update", { taskId, ...entropyReport });
			this.emitPulseUpdate(PulseStage.COMMIT, `Entropy analysis complete.`, {
				taskId,
				entropyReport,
			});

			console.log(chalk.green(`[Pulse v2] Cycle COMPLETE for ${taskId} ⛩️`));
			return true;
		} else {
			this.emitPulseUpdate(PulseStage.IDLE, `Consensus REJECTED. Cycle aborted.`, { taskId });
			return false;
		}
	}
}

let instance: PulseOrchestrator | null = null;
export const getPulseOrchestrator = (dir: string) => {
	if (!instance) instance = new PulseOrchestrator(dir);
	return instance;
};
