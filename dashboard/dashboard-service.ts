import { WebSocketServer, WebSocket } from "ws";
import { EventEmitter } from "node:events";

export interface SwarmEvent {
	type: "thought" | "vote" | "task_update" | "consensus" | "error" | "logic_graph" | "pulse_update" | "persona_update";
	agentId: string;
	message: string;
	payload?: any;
	timestamp: string;
}

/**
 * DashboardService
 * Acts as a singleton event bus to relay swarm activities to the connected Web UI.
 */
export class DashboardService extends EventEmitter {
	private static instance: DashboardService;
	private wss: WebSocketServer | null = null;

	private constructor() {
		super();
	}

	public static getInstance(): DashboardService {
		if (!DashboardService.instance) {
			DashboardService.instance = new DashboardService();
		}
		return DashboardService.instance;
	}

	public attachServer(wss: WebSocketServer): void {
		this.wss = wss;
		console.log("[DashboardService] Unified Swarm Feed attached.");
	}

	/**
	 * Emit a thought from an agent.
	 */
	public emitThought(agentId: string, message: string, payload?: any): void {
		this.broadcast({
			type: "thought",
			agentId,
			message,
			payload,
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Emit the visual logic graph.
	 */
	public emitLogicGraph(agentId: string, message: string, payload: { mermaid: string; json?: any }): void {
		this.broadcast({
			type: "logic_graph",
			agentId,
			message,
			payload,
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Emit a voting event.
	 */
	public emitVote(agentId: string, proposal: string, vote: "approve" | "reject", reason?: string): void {
		this.broadcast({
			type: "vote",
			agentId,
			message: `Voted ${vote.toUpperCase()} on: ${proposal}`,
			payload: { proposal, vote, reason },
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Emit a task status update.
	 */
	public emitTaskUpdate(taskId: string, status: string, message: string): void {
		this.broadcast({
			type: "task_update",
			agentId: "SYSTEM",
			message,
			payload: { taskId, status },
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Emit a general pulse event.
	 */
	public emitEvent(type: any, payload: any): void {
		this.broadcast({
			type: "pulse_update",
			agentId: "SYSTEM",
			message: payload.message || `Pulse Event: ${type}`,
			payload,
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Phase 30: Emit personality maturation updates.
	 */
	public emitPersonaUpdate(agentId: string, maturityScore: number, level: string): void {
		this.broadcast({
			type: "persona_update",
			agentId,
			message: `Persona Maturation: ${level} (Score: ${maturityScore})`,
			payload: { maturityScore, level },
			timestamp: new Date().toISOString(),
		});
	}

	private broadcast(event: SwarmEvent): void {
		this.emit("event", event);
		if (this.wss) {
			const data = JSON.stringify({ type: "swarm_event", data: event });
			this.wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		}
	}
}
