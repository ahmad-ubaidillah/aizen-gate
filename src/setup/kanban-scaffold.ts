import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

export class KanbanScaffolder {
	private projectRoot: string;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
	}

	async scaffold(): Promise<void> {
		const swarmDirs = [
			".agents",
			"skills",
			"shared",
			"docs",
			"workflows",
			"templates",
			"commands",
			"rules",
			"PRD",
			"output",
		];
		const kanbanDirs = ["backlog", "dev", "test", "done"];

		console.log(chalk.cyan(`\n⛩️  [Aizen] Orchestrating Swarm Scaffolding...`));

		// 1. Create Core Swarm Infrastructure
		for (const dir of [...swarmDirs, ...kanbanDirs]) {
			const absDir = path.join(this.projectRoot, dir);
			if (!fs.existsSync(absDir)) {
				fs.mkdirSync(absDir, { recursive: true });
				console.log(chalk.gray(`   ✔ Created ${dir}`));
			}
		}

		// 2. Deploy Strategic Protocols
		const constitutionPath = path.join(this.projectRoot, "rules/PROJECT_CONSTITUTION.md");
		if (!fs.existsSync(constitutionPath)) {
			const content =
				`# 📜 PROJECT CONSTITUTION: ${path.basename(this.projectRoot).toUpperCase()}\n\n` +
				`## ⛩️ AI-Agent Protocols\n` +
				`- Always consult \`backlog/\` for unassigned work packages.\n` +
				`- Use \`npx aizen-gate status\` to align with the board.\n` +
				`- Maintain atomic, mission-mapped commits.\n\n` +
				`## 🏗️ Architecture Style\n` +
				`- Standard: Elite Swarm Modular Architecture.\n` +
				`- Single Source of Truth: \`shared/state.md\`.\n`;
			fs.writeFileSync(constitutionPath, content);
			console.log(chalk.gray(`   ✔ Created rules/PROJECT_CONSTITUTION.md`));
		}

		// 3. Deploy Command Nexus (AGENTS.md)
		const agentsMdPath = path.join(this.projectRoot, "AGENTS.md");
		if (!fs.existsSync(agentsMdPath)) {
			const content =
				`# ⛩️ AIZEN SWARM CONTROL CENTER\n\n` +
				`## 🚀 Slash Commands (Terminal Mode)\n\n` +
				`- \`npx aizen-gate start\`     - Launch new mission briefing\n` +
				`- \`npx aizen-gate status\`    - View current sprint board\n` +
				`- \`npx aizen-gate specify\`   - Translate PRD to Work Packages\n` +
				`- \`npx aizen-gate clean\`     - Archive completed missions\n\n` +
				`## 🧠 Autonomous Agents Ready\n\n` +
				`- **Architect Pro**: Infrastructure & Backend\n` +
				`- **UI/UX Vanguard**: Frontend & Aesthetics\n` +
				`- **QA Shield**: Testing & Validation\n`;
			fs.writeFileSync(agentsMdPath, content);
			console.log(chalk.gray(`   ✔ Created AGENTS.md`));
		}

		console.log(
			chalk.green(`\n✅ [Swarm] Scaffolding complete. Elite Protocols active. ⛩️\n`),
		);
	}
}
