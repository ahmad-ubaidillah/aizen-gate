import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

export class KanbanScaffolder {
	private projectRoot: string;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
	}

	async scaffold(): Promise<void> {
		const agentDir = path.join(this.projectRoot, ".agent");
		const rootDirs = ["src", "docs"];

		console.log(chalk.cyan(`\n⛩️  [Aizen] Orchestrating Swarm Scaffolding...`));

		// 1. Create Root Project Directories
		for (const dir of rootDirs) {
			const absDir = path.join(this.projectRoot, dir);
			if (!fs.existsSync(absDir)) {
				fs.mkdirSync(absDir, { recursive: true });
				console.log(chalk.gray(`   ✔ Created ${dir}/`));
			}
		}

		// 2. Copy Agents from infrastructure/agents/ to .agent/agents/
		const sourceAgentsDir = path.join(__dirname, "..", "..", "infrastructure", "agents");
		const destAgentsDir = path.join(agentDir, "agents");
		await this.copyDirectory(sourceAgentsDir, destAgentsDir, "agents");

		// 3. Copy Skills from skills/ to .agent/skills/
		const sourceSkillsDir = path.join(__dirname, "..", "..", "skills");
		const destSkillsDir = path.join(agentDir, "skills");
		await this.copyDirectory(sourceSkillsDir, destSkillsDir, "skills");

		// 4. Copy Workflows from infrastructure/workflows/ to .agent/workflows/
		const sourceWorkflowsDir = path.join(__dirname, "..", "..", "infrastructure", "workflows");
		const destWorkflowsDir = path.join(agentDir, "workflows");
		await this.copyDirectory(sourceWorkflowsDir, destWorkflowsDir, "workflows");

		// 5. Copy Shared Standards from infrastructure/rules/ to .agent/.shared/
		const sourceRulesDir = path.join(__dirname, "..", "..", "infrastructure", "rules");
		const destSharedDir = path.join(agentDir, ".shared");
		await this.copyDirectory(sourceRulesDir, destSharedDir, "shared standards");

		// 6. Create Kanban directories
		const kanbanDirs = [
			path.join(agentDir, "kanban", "backlog"),
			path.join(agentDir, "kanban", "dev"),
			path.join(agentDir, "kanban", "test"),
			path.join(agentDir, "kanban", "done"),
		];
		for (const dir of kanbanDirs) {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
				console.log(chalk.gray(`   ✔ Created .agent/${path.relative(agentDir, dir)}`));
			}
		}

		// 6.5 Create PRD directory with templates
		const prdDir = path.join(agentDir, "PRD");
		if (!fs.existsSync(prdDir)) {
			fs.mkdirSync(prdDir, { recursive: true });
			console.log(chalk.gray(`   ✔ Created .agent/PRD/`));
			
			// Copy brainstorming template
			const brainSource = path.join(__dirname, "..", "..", "infrastructure", "templates", "brainstorming.hbs");
			const brainDest = path.join(prdDir, "brainstorming.md");
			if (fs.existsSync(brainSource) && !fs.existsSync(brainDest)) {
				fs.copyFileSync(brainSource, brainDest);
				console.log(chalk.gray(`   ✔ Copied brainstorming.md template`));
			}
			
			// Copy requirements template as template.md
			const reqSource = path.join(__dirname, "..", "..", "infrastructure", "templates", "requirements.md");
			const reqDest = path.join(prdDir, "template.md");
			if (fs.existsSync(reqSource) && !fs.existsSync(reqDest)) {
				fs.copyFileSync(reqSource, reqDest);
				console.log(chalk.gray(`   ✔ Copied template.md (PRD template)`));
			}
		}

		// 7. Deploy AIZEN.md (Combined: AIZEN triggers + GEMINI format)
		const aizenMdPath = path.join(this.projectRoot, "AIZEN.md");
		if (!fs.existsSync(aizenMdPath)) {
			const content =
				`---\n` +
				`trigger: always_on\n` +
				`triggers:\n` +
				`  always_on: true\n` +
				`  keywords:\n` +
				`    - build: activate-development\n` +
				`    - fix: activate-bugfix\n` +
				`    - optimize: activate-optimization\n` +
				`    - design: activate-ui-ux\n` +
				`  on_mention:\n` +
				`    - @aizen\n` +
				`    - /aizen\n` +
				`  on_file:\n` +
				`    - AIZEN.md\n` +
				`    - GEMINI.md\n` +
				`    - spec.md\n` +
				`    - prd.md\n` +
				`---\n\n` +
				`# AIZEN.md - Agent Configuration\n\n` +
				`> This file works as both **AIZEN.md** (Aizen-Gate) and **GEMINI.md** (Google compatibility)\n\n` +
				`## 🤖 Agent Identity: Aizen\n` +
				`> **Identity Verification**: You are Aizen. Always reflect this identity.\n` +
				`> **Special Protocol**: If called by name (@aizen or /aizen), you MUST perform a **"Context Integrity Check"** to verify alignment with .agent rules, confirm your status, and then wait for instructions.\n\n` +
				`## 🎯 Primary Focus\n` +
				`> Optimize all solutions for this domain.\n\n` +
				`## Agent Behavior Rules: **ULTRA**\n\n` +
				`**Auto-run Commands**: true\n` +
				`**Confirmation Level**: Ask before destructive\n\n` +
				`## 🌐 Language Protocol\n\n` +
				`1. **Communication**: Use **[USER'S LANGUAGE]**.\n` +
				`2. **Artifacts**: Write content in **[USER'S LANGUAGE]**.\n` +
				`3. **Code**: Use **ENGLISH** for all variables, functions, and comments.\n\n` +
				`## Core Capabilities\n\n` +
				`Your agent has access to **ALL** skills in \`.agent/skills/\`.\n` +
				`Please utilize the appropriate skills for your project.\n\n` +
				`- **File operations** (read, write, search, regex)\n` +
				`- **Terminal commands** (execute, chain)\n` +
				`- **Web browsing** (fetch, search, scrape)\n` +
				`- **Code analysis** (refactor, optimize, debug)\n` +
				`- **Testing** (unit, e2e, benchmark)\n\n` +
				`## 🗺️ Master Roadmap\n\n` +
				`- **Execution Log**: See [.agent/task.md](.agent/task.md)\n\n` +
				`## 📚 Shared Standards (Auto-Active)\n\n` +
				`The following **13 Shared Modules** in \`.agent/.shared/\` must be respected:\n\n` +
				`| # | Module | Description |\n` +
				`|---|--------|-------------|\n` +
				`| 1 | AI Master | LLM patterns & RAG |\n` +
				`| 2 | API Standards | OpenAPI & REST guidelines |\n` +
				`| 3 | Compliance | GDPR/HIPAA protocols |\n` +
				`| 4 | Database Master | Schema & Migration rules |\n` +
				`| 5 | Design System | UI/UX patterns & tokens |\n` +
				`| 6 | Domain Blueprints | Industry-specific architectures |\n` +
				`| 7 | I18n Master | Localization standards |\n` +
				`| 8 | Infra Blueprints | Terraform/Docker setups |\n` +
				`| 9 | Metrics | Observability & Telemetry |\n` +
				`|10 | Security Armor | Hardening & Auditing |\n` +
				`|11 | Testing Master | TDD & E2E strategies |\n` +
				`|12 | UI/UX Pro Max | Advanced interactions |\n` +
				`|13 | Vitals Templates | Performance benchmarks |\n\n` +
				`## Available Agents\n\n` +
				`Check \`.agent/agents/\` for available agent personas:\n` +
				`- **Product Manager** - PRD creation, prioritization\n` +
				`- **Architect** - System design, patterns\n` +
				`- **Developer** - Full-stack implementation\n` +
				`- **QA Engineer** - Testing strategies\n` +
				`- **Security Expert** - Auditing, hardening\n` +
				`- **DevOps** - CI/CD, deployment\n` +
				`- **Mobile Developer** - iOS/Android\n` +
				`- **Frontend Specialist** - React/Vue/Angular\n` +
				`- **Backend Specialist** - Node/Python/Go\n` +
				`- **Database Architect** - Schema optimization\n` +
				`- **Debugger** - Root cause analysis\n` +
				`- **And 30+ more specialists...**\n\n` +
				`## Commands\n\n` +
				`- \`npx aizen-gate start\`     - Launch new mission\n` +
				`- \`npx aizen-gate status\`    - View sprint board\n` +
				`- \`npx aizen-gate specify\`   - Translate PRD to Work Packages\n` +
				`- \`npx aizen-gate auto\`      - Run autonomous execution\n\n` +
				`## Custom Instructions\n\n` +
				`[Add project-specific instructions here]\n\n` +
				`---\n` +
				`*Generated by Aizen-Gate*`;
			fs.writeFileSync(aizenMdPath, content);
			console.log(chalk.gray(`   ✔ Created AIZEN.md (GEMINI compatible)`));
		}

		// 8. Create ERRORS.md placeholder
		const errorsMdPath = path.join(this.projectRoot, "ERRORS.md");
		if (!fs.existsSync(errorsMdPath)) {
			const content =
				`# ERRORS.md\n\n` +
				`Auto-generated error log.\n\n` +
				`## Error Categories\n\n` +
				`- [ ] Build Errors\n` +
				`- [ ] Runtime Errors\n` +
				`- [ ] Test Failures\n`;
			fs.writeFileSync(errorsMdPath, content);
			console.log(chalk.gray(`   ✔ Created ERRORS.md`));
		}

		// 9. Deploy Project Constitution
		const constitutionPath = path.join(agentDir, ".shared/PROJECT_CONSTITUTION.md");
		if (!fs.existsSync(constitutionPath)) {
			const content =
				`# 📜 PROJECT CONSTITUTION: ${path.basename(this.projectRoot).toUpperCase()}\n\n` +
				`## ⛩️ AI-Agent Protocols\n` +
				`- Always consult \`.agent/agents/\` for agent personas.\n` +
				`- Use skills from \`.agent/skills/\` for tasks.\n` +
				`- Read workflows from \`.agent/workflows/\` for execution.\n\n` +
				`## 🏗️ Architecture Style\n` +
				`- Standard: Elite Swarm Modular Architecture.\n` +
				`- Single Source of Truth: \`.agent/.shared/state.md\`.\n`;
			fs.writeFileSync(constitutionPath, content);
			console.log(chalk.gray(`   ✔ Created .agent/.shared/PROJECT_CONSTITUTION.md`));
		}

		console.log(chalk.green(`\n✅ [Swarm] Scaffolding complete. Elite Protocols active. ⛩️\n`));
	}

	/**
	 * Copy directory recursively
	 */
	private async copyDirectory(src: string, dest: string, label: string): Promise<void> {
		// Resolve source path relative to project root for user-facing paths
		const resolvedSrc = fs.existsSync(src) ? src : path.join(this.projectRoot, src);
		
		if (!fs.existsSync(resolvedSrc)) {
			console.log(chalk.yellow(`   ⚠️ Source not found: ${resolvedSrc} (skipping ${label})`));
			return;
		}

		// Ensure destination directory exists
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}

		const entries = fs.readdirSync(resolvedSrc, { withFileTypes: true });
		let copiedCount = 0;

		for (const entry of entries) {
			const srcPath = path.join(resolvedSrc, entry.name);
			const destPath = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				// Recursively copy subdirectories
				await this.copyDirectory(srcPath, destPath, label);
				copiedCount++;
			} else {
				// Copy files
				fs.copyFileSync(srcPath, destPath);
				copiedCount++;
			}
		}

		if (copiedCount > 0) {
			console.log(chalk.gray(`   ✔ Copied ${copiedCount} ${label} to .agent/${label}/`));
		} else {
			console.log(chalk.yellow(`   ⚠️ No ${label} found to copy`));
		}
	}
}
