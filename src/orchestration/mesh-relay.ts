import { EventEmitter } from "node:events";
import chalk from "chalk";
import { DashboardService } from "../../dashboard/dashboard-service.js";

export interface MeshNode {
	id: string;
	url: string;
	status: "online" | "offline";
	lastSeen: string;
}

/**
 * [Phase 26] MeshRelay
 * Manages distributed connections between Aizen instances.
 */
export class MeshRelay extends EventEmitter {
	private nodes: Map<string, MeshNode> = new Map();
	private feed = DashboardService.getInstance();
	private myId: string;

	constructor(myId: string = `node-${Math.random().toString(36).substr(2, 5)}`) {
		super();
		this.myId = myId;
		console.log(chalk.blue(`[MeshRelay] Initialized as Node: ${this.myId}`));
	}

	/**
	 * Registers a new node in the mesh network.
	 */
	public registerNode(node: MeshNode) {
		this.nodes.set(node.id, { ...node, lastSeen: new Date().toISOString() });
		this.feed.emitThought("MESH_RELAY", `Discovered new neural node: ${node.id} at ${node.url}`, {
			nodeId: node.id,
		});
		this.emit("node_discovered", node);
		this.broadcastMeshState();
	}

	/**
	 * Lists all active nodes in the mesh.
	 */
	public getNodes(): MeshNode[] {
		return Array.from(this.nodes.values());
	}

	/**
	 * Broadcasts the current mesh state to the dashboard.
	 */
	private broadcastMeshState() {
		this.feed.emitEvent("mesh_update", {
			myId: this.myId,
			nodes: this.getNodes(),
		});
	}

	/**
	 * Synchronizes wisdom seeds across the mesh.
	 */
	public async broadcastWisdom(seeds: any[]) {
		console.log(chalk.cyan(`[MeshRelay] Broadcasting ${seeds.length} wisdom seeds to mesh...`));
		this.feed.emitThought(
			"MESH_RELAY",
			`Broadcasting ${seeds.length} knowledge seeds to the collective neural mesh.`,
			{ seedCount: seeds.length },
		);

		// In a real implementation, this would iterate over nodes and POST to their /api/wisdom/import
		for (const node of this.nodes.values()) {
			if (node.status === "online") {
				console.log(chalk.gray(`   -> Syncing with ${node.id} (${node.url})...`));
			}
		}
	}
}

let instance: MeshRelay | null = null;
export const getMeshRelay = (id?: string) => {
	if (!instance) instance = new MeshRelay(id);
	return instance;
};
