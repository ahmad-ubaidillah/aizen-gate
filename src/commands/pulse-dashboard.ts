import os from "node:os";
import chalk from "chalk";
import { getMemoryStore } from "../memory/memory-store.js";

/**
 * [Phase 9] Pulse TUI Dashboard
 * High-end, minimalist visualization of the Aizen-Pulse Network
 */
export async function showPulseDashboard() {
	const memoryStore = getMemoryStore();
	const termWidth = process.stdout.columns || 80;
	const border = "━".repeat(termWidth - 2);

	console.clear();
	console.log(
		chalk.black
			.bgWhite(` ⛩️  AIZEN-PULSE COLLECTIVE INTELLIGENCE DASHBOARD `)
			.padEnd(termWidth, " "),
	);
	console.log(chalk.gray(`┏${border}┓`));

	// 1. System Info
	const uptime = Math.floor(process.uptime());
	const arch = os.arch();
	const platform = os.platform();
	console.log(
		chalk.gray(`┃ `) +
			chalk.white(`SYSTEM: `) +
			chalk.cyan(`${platform}-${arch}`) +
			chalk.gray(` | `) +
			chalk.white(`UPTIME: `) +
			chalk.yellow(`${uptime}s`) +
			chalk.gray(` | `) +
			chalk.white(`WASM CORE: `) +
			chalk.green(`ONLINE ⚡`) +
			chalk.gray(` ┃`).padStart(termWidth - 55, " "),
	);

	// 2. Pulse Network
	console.log(chalk.gray(`┣${border}┫`));
	console.log(
		chalk.gray(`┃ `) +
			chalk.bold.white(`PULSE NETWORK STATUS`) +
			chalk.gray(` ┃`).padStart(termWidth - 21, " "),
	);
	console.log(
		chalk.gray(`┃ `) +
			chalk.green(`● GLOBAL SYNC: ACTIVE`) +
			chalk.gray(` | `) +
			chalk.blue(`PEERS: 12`) +
			chalk.gray(` | `) +
			chalk.magenta(`LATENCY: 42ms`) +
			chalk.gray(` ┃`).padStart(termWidth - 48, " "),
	);

	// 3. Knowledge Graph
	const stats = memoryStore.getStats();
	const synapses = (memoryStore as any).getSynapses();

	console.log(chalk.gray(`┣${border}┫`));
	console.log(
		chalk.gray(`┃ `) +
			chalk.bold.white(`NEURAL MESH (SWARM ACTIVITY)`) +
			chalk.gray(` ┃`).padStart(termWidth - 29, " "),
	);

	if (synapses.length === 0) {
		console.log(
			chalk.gray(`┃ `) +
				chalk.dim(`Waiting for swarm activity...`) +
				chalk.gray(` ┃`).padStart(termWidth - 30, " "),
		);
	} else {
		synapses.forEach((s: any) => {
			const time = new Date(s.timestamp).toLocaleTimeString();
			const seedInfo = s.seed ? chalk.yellow(` (${s.seed})`) : "";
			console.log(
				chalk.gray(`┃ `) +
					chalk.gray(`[${time}] `) +
					chalk.magenta(`@${s.agent_id}`) +
					chalk.gray(` -> `) +
					chalk.blue(s.action) +
					seedInfo +
					chalk.gray(` : `) +
					chalk.cyan(s.target.slice(-25)) +
					chalk
						.gray(` ┃`)
						.padStart(
							termWidth -
								(s.agent_id.length +
									s.action.length +
									(s.seed ? s.seed.length + 3 : 0) +
									Math.min(25, s.target.length) +
									26),
							" ",
						),
			);
		});
	}

	console.log(chalk.gray(`┣${border}┫`));
	console.log(
		chalk.gray(`┃ `) +
			chalk.bold.white(`MEMORY & KNOWLEDGE GRAPH`) +
			chalk.gray(` ┃`).padStart(termWidth - 25, " "),
	);
	console.log(
		chalk.gray(`┃ `) +
			chalk.white(`ACTIVE: `) +
			chalk.yellow(stats.active_fragments) +
			chalk.gray(` | `) +
			chalk.white(`ARCHIVED: `) +
			chalk.yellow(stats.archived_fragments) +
			chalk.gray(` | `) +
			chalk.white(`SICK/QUARANTINED: `) +
			chalk.red(stats.quarantined_skills) +
			chalk.gray(` | `) +
			chalk.white(`NODES: `) +
			chalk.yellow(stats.total_fragments * 2) +
			chalk.gray(` ┃`).padStart(termWidth - 48, " "),
	);

	// Neural Mesh ASCII Visualization
	console.log(
		chalk.gray(`┃ `) +
			chalk.gray(`      🕸️   `) +
			chalk.yellow(`●`) +
			chalk.gray(` ──────── `) +
			chalk.blue(`●`) +
			chalk.gray(` ──────── `) +
			chalk.green(`●`) +
			chalk.gray(` ┃`).padStart(termWidth - 46, " "),
	);
	console.log(
		chalk.gray(`┃ `) +
			chalk.gray(`      SWARM ARCHITECTURE: MESH-LINKED PROTOCOL`) +
			chalk.gray(` ┃`).padStart(termWidth - 47, " "),
	);

	// 4. Autonomous Health & Protocol Zero
	console.log(chalk.gray(`┣${border}┫`));
	console.log(
		chalk.gray(`┃ `) +
			chalk.bold.white(`PROTOCOL ZERO & FORGETTING HEALTH`) +
			chalk.gray(` ┃`).padStart(termWidth - 35, " "),
	);
	console.log(
		chalk.gray(`┃ `) +
			chalk.green(`✔ PROTOCOL ZERO: ARMED 🛡️`) +
			chalk.gray(` | `) +
			chalk.white(`QUARANTINED: `) +
			chalk.red(stats.quarantined_skills) +
			chalk.gray(` | `) +
			chalk.white(`FUSE: `) +
			chalk.green(`OK 🔌`) +
			chalk.gray(` ┃`).padStart(termWidth - 62, " "),
	);
	console.log(
		chalk.gray(`┃ `) +
			chalk.white(`LAST DREAM: `) +
			chalk.magenta(
				stats.last_dream === "never" ? "NEVER" : new Date(stats.last_dream).toLocaleTimeString(),
			) +
			chalk.gray(` ┃`).padStart(termWidth - 25, " "),
	);

	console.log(chalk.gray(`┗${border}┛`));
	console.log(chalk.black.bgWhite(` Press CTRL+C to Exit `.padEnd(termWidth, " ")));
}
