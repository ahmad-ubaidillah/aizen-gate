const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * MissionManager: Customizes the Aizen-Gate pipeline for different use cases.
 */
class MissionManager {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.missionsDir = path.join(projectRoot, "aizen-gate", "missions");
		this.activeMission = "software-dev";
	}

	async ensureMissions() {
		await fs.ensureDir(this.missionsDir);

		// Default Software Dev Mission
		const softDev = {
			id: "software-dev",
			name: "Standard Software Development",
			phases: ["specify", "research", "plan", "tasks", "auto", "review", "merge"],
			agents: ["[PM]", "[ARCH]", "[DEV]", "[QA]"],
		};

		// Research Mission
		const research = {
			id: "research",
			name: "Architectural Research & Analysis",
			phases: ["specify", "research", "analyze", "synthesize"],
			agents: ["[ANALYST]", "[ARCH]"],
		};

		await fs.writeJson(path.join(this.missionsDir, "software-dev.json"), softDev, { spaces: 2 });
		await fs.writeJson(path.join(this.missionsDir, "research.json"), research, { spaces: 2 });
	}

	async setActiveMission(missionId) {
		this.activeMission = missionId;
		// In a real system, we'd persist this to module.yaml or .aizen-state
		console.log(chalk.green(`[Aizen] Active Mission set to: ${missionId}`));
	}

	async getActiveMission() {
		const missionPath = path.join(this.missionsDir, `${this.activeMission}.json`);
		if (fs.existsSync(missionPath)) {
			return await fs.readJson(missionPath);
		}
		return { phases: ["specify", "research", "plan", "tasks", "auto", "review", "merge"] };
	}
}

module.exports = { MissionManager };
