import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

export interface Mission {
	id: string;
	name: string;
	description: string;
	phases: string[];
	agents: string[];
	artifacts: Record<string, string>;
}

export class MissionEngine {
	private missionsDir: string;
	private configFile: string;

	constructor(projectDir: string) {
		this.projectDir = projectDir;
		this.missionsDir = path.join(projectDir, "aizen-gate/missions");
		this.configFile = path.join(projectDir, "aizen-gate/shared/config.json");
	}

	init(): void {
		if (!fs.existsSync(this.missionsDir)) {
			fs.mkdirSync(this.missionsDir, { recursive: true });
		}

		// Define the baseline framework missions
		const devMission: Mission = {
			id: "software-dev",
			name: "Software Development",
			description: "Standard Spec-Driven Development Pipeline",
			phases: ["specify", "research", "plan", "tasks", "auto", "review", "merge"],
			agents: ["[PM]", "[ARCH]", "[DEV]", "[QA]"],
			artifacts: {
				spec: "spec.md",
				plan: "plan.md",
				task: "WP*.md",
			},
		};

		const docsMission: Mission = {
			id: "documentation",
			name: "Documentation & Technical Writing",
			description: "Pipeline optimized for creating and updating project documentation.",
			phases: ["audit", "outline", "draft", "peer-review", "publish"],
			agents: ["[PM]", "[DOCS]"],
			artifacts: {
				spec: "outline.md",
				plan: "style-guide.md",
				task: "DOC*.md",
			},
		};

		const researchMission: Mission = {
			id: "research",
			name: "R&D Prototype Exploration",
			description: "Fast-feedback loops for proving out new libraries or architectures.",
			phases: ["hypothesis", "sandbox", "benchmark", "report"],
			agents: ["[ANALYST]", "[ARCH]"],
			artifacts: {
				spec: "hypothesis.md",
				plan: "architecture-spike.md",
				task: "EXP*.md",
			},
		};

		fs.writeFileSync(
			path.join(this.missionsDir, "software-dev.json"),
			JSON.stringify(devMission, null, 2),
		);
		fs.writeFileSync(
			path.join(this.missionsDir, "documentation.json"),
			JSON.stringify(docsMission, null, 2),
		);
		fs.writeFileSync(
			path.join(this.missionsDir, "research.json"),
			JSON.stringify(researchMission, null, 2),
		);
	}

	getCurrentMission(): string {
		if (fs.existsSync(this.configFile)) {
			try {
				const config = JSON.parse(fs.readFileSync(this.configFile, "utf-8"));
				return config.mission || "software-dev";
			} catch (_e) {
				console.log(`[Mission] Could not read config: ${(_e as Error).message}`);
			}
		}
		return "software-dev";
	}

	async getActiveMission(): Promise<Mission> {
		const missionId = this.getCurrentMission();
		const missionPath = path.join(this.missionsDir, `${missionId}.json`);
		if (fs.existsSync(missionPath)) {
			return JSON.parse(fs.readFileSync(missionPath, "utf-8"));
		}
		// Fallback
		return {
			id: "fallback",
			name: "Fallback Pipeline",
			description: "Default pipeline features",
			phases: ["specify", "research", "plan", "tasks", "auto", "review", "merge"],
			agents: ["[PM]", "[DEV]"],
			artifacts: {},
		};
	}

	async setActiveMission(missionId: string): Promise<Mission> {
		return this.switchMission(missionId);
	}

	switchMission(missionId: string): Mission {
		this.init(); // Ensure files exist

		const missionFile = path.join(this.missionsDir, `${missionId}.json`);
		if (!fs.existsSync(missionFile)) {
			throw new Error(`Mission schema '${missionId}' not found.`);
		}

		let config: any = {};
		if (fs.existsSync(this.configFile)) {
			try {
				config = JSON.parse(fs.readFileSync(this.configFile, "utf-8"));
			} catch (_e) {
				console.log(`[Mission] Could not parse config: ${(_e as Error).message}`);
			}
		}

		config.mission = missionId;

		const sharedDir = path.dirname(this.configFile);
		if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });
		fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));

		const missionData = JSON.parse(fs.readFileSync(missionFile, "utf-8")) as Mission;
		console.log(chalk.green.bold(`\n🚀 Mission Identity Switched: ${missionData.name}`));
		console.log(chalk.italic(`"${missionData.description}"`));
		console.log(chalk.gray(`Active Pipeline: ${missionData.phases.join(" → ")}`));

		return missionData;
	}
}

export const MissionManager = MissionEngine;
