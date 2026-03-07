const fs = require("fs-extra");
const path = require("node:path");
const { intro, outro, spinner, note, confirm, isCancel, cancel } = require("@clack/prompts");
const chalk = require("chalk");
const { detectPlatform } = require("./detect-platform");
const { detectStack } = require("../../skill-creator/src/tech-detector");

/**
 * Aizen-Gate Core Installer (formerly az-install)
 * Handles file copying, environment setup, and Shield initialization.
 */
async function installAizenGate(targetDir, selectedPlatform = null) {
	intro(chalk.cyan.bold("⛩️  Aizen-Gate | Shield Installation"));

	const s = spinner();
	try {
		const platform = selectedPlatform || detectPlatform();
		const stack = detectStack(targetDir);

		note(
			`Detected Platform: ${chalk.yellow(platform)}\n` +
				`Detected Tech Stack: ${chalk.yellow(stack.languages.join(", "))}`,
			"Environment Discovery",
		);

		const aizenDir = path.join(targetDir, "aizen-gate");

		// 1. Ensure target directory exists
		if (!fs.existsSync(aizenDir)) {
			s.start("Initializing Aizen-Gate structure...");
			fs.mkdirSync(aizenDir, { recursive: true });
			s.stop("Aizen-Gate structure initialized.");
		}

		// 2. Copy framework files
		const sourceDir = path.resolve(__dirname, "../../");

		// Skip installer and skill-creator files in the source-to-target copy
		const options = {
			filter: (src) => {
				const basename = path.basename(src);
				const skipList = [
					"installer",
					"skill-creator",
					"node_modules",
					".git",
					"aizen-gate",
					".worktrees",
				];
				if (src === sourceDir) return true;
				if (skipList.includes(basename)) return false;

				// Extra safety: don't copy the target directory into itself
				if (src === aizenDir) return false;

				return true;
			},
		};

		if (
			path.resolve(targetDir) !== path.resolve(sourceDir) ||
			sourceDir.endsWith("node_modules/aizen-gate")
		) {
			s.start("Copying Shield files...");
			await fs.copy(sourceDir, aizenDir, options);
			s.stop(`Shield files copied to: ${chalk.dim(aizenDir)}`);
		} else {
			note("Running inside Aizen-Gate source. Updating structures only.", "Path Insight");
		}

		// 3. Initialize Shared State if not exists
		const sharedDir = path.join(aizenDir, "shared");
		if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });

		const initFiles = [
			{ path: "board.md", template: "board-template.md" },
			{ path: "state.md", template: "state.md" },
			{ path: "project.md", template: "project.md" },
			{ path: "research.md", template: "research.md" },
		];

		s.start("Initializing state files...");
		for (const file of initFiles) {
			const fullPath = path.join(sharedDir, file.path);
			if (!fs.existsSync(fullPath)) {
				const templatePath = path.join(sourceDir, "templates", file.template);
				if (fs.existsSync(templatePath)) {
					let content = fs.readFileSync(templatePath, "utf8");
					// Remove template frontmatter/headers if present
					content = content.replace(/^---[\s\S]*?---\n/g, "");
					content = content.replace(/^# .* Template\n/g, "");
					fs.writeFileSync(fullPath, `${content.trim()}\n`);
				}
			}
		}
		s.stop("Shared state files ready.");

		const memoryPath = path.join(sharedDir, "memory.md");
		if (fs.existsSync(memoryPath)) {
			s.start("Customizing project memory...");
			let memoryContent = fs.readFileSync(memoryPath, "utf8");
			const stackStr = stack.languages.concat(stack.frameworks).join(", ");
			memoryContent = memoryContent.replace("{Detected/Selected Tech Stack}", stackStr);
			fs.writeFileSync(memoryPath, memoryContent);
			s.stop("Project memory customized.");
		}

		// 4. Platform-Specific Injection
		s.start(`Injecting Shield configurations for ${platform}...`);

		let slashCommandsText = "";
		try {
			const cmdsPath = path.join(aizenDir, "templates/slash-commands/commands.json");
			if (fs.existsSync(cmdsPath)) {
				const cmds = JSON.parse(fs.readFileSync(cmdsPath, "utf8"));
				for (const [key, val] of Object.entries(cmds)) {
					slashCommandsText += `- \`/${key}\` -> ${val.description}\n  Prompt: ${val.prompt}\n`;
				}
			}
		} catch (e) {
			// Silent fail for slash commands
		}

		const instructionPrefix = `\n\n### ⛩️ [Aizen] Aizen-Gate Integration
Use \`npx aizen-gate <command>\` to interact with the scrum team. 
Read the full manual at: \`${aizenDir}/AIZEN_GATE.md\`

**Slash Commands (IDE Native):**
${slashCommandsText}
`;

		const updatedFiles = [];

		// 1. Claude Code -> CLAUDE.md
		if (platform === "claude-code" || platform === "generic") {
			const claudePath = path.join(targetDir, "CLAUDE.md");
			const content = fs.existsSync(claudePath)
				? fs.readFileSync(claudePath, "utf8")
				: "# Project Instructions\n";
			if (!content.includes("Aizen-Gate Integration")) {
				fs.writeFileSync(claudePath, content + instructionPrefix);
				updatedFiles.push("CLAUDE.md");
			}
		}

		// 2. Cursor -> .cursorrules
		if (platform === "cursor") {
			const cursorPath = path.join(targetDir, ".cursorrules");
			fs.appendFileSync(cursorPath, instructionPrefix);
			updatedFiles.push(".cursorrules");
		}

		// 3. Gemini CLI / Antigravity -> GEMINI.md
		if (platform === "antigravity" || platform === "gemini") {
			const geminiPath = path.join(targetDir, "GEMINI.md");
			fs.appendFileSync(geminiPath, instructionPrefix);
			updatedFiles.push("GEMINI.md");
		}

		// 4. GitHub Copilot -> .github/copilot-instructions.md
		if (platform === "copilot") {
			const copilotDir = path.join(targetDir, ".github");
			if (!fs.existsSync(copilotDir)) fs.mkdirSync(copilotDir);
			const copilotPath = path.join(copilotDir, "copilot-instructions.md");
			fs.appendFileSync(copilotPath, instructionPrefix);
			updatedFiles.push(".github/copilot-instructions.md");
		}

		// 5. Windsurf / Codex -> .windsurf/rules/
		if (platform === "windsurf") {
			const windsurfDir = path.join(targetDir, ".windsurf", "rules");
			if (!fs.existsSync(windsurfDir)) fs.mkdirSync(windsurfDir, { recursive: true });
			const windsurfPath = path.join(windsurfDir, "rules.md");
			fs.appendFileSync(windsurfPath, instructionPrefix);
			updatedFiles.push(".windsurf/rules/rules.md");
		}

		// 6. Kiro / Kilo / OpenCode -> .kiro/ / .agents/
		if (platform === "kiro" || platform === "kilo") {
			const kiroDir = path.join(targetDir, `.${platform}`);
			if (!fs.existsSync(kiroDir)) fs.mkdirSync(kiroDir);
			const kiroPath = path.join(kiroDir, "config.md");
			fs.appendFileSync(kiroPath, instructionPrefix);
			updatedFiles.push(`.${platform}/config.md`);
		}

		// Always update AGENTS.md for universal visibility
		const agentsPath = path.join(targetDir, "AGENTS.md");
		if (
			!fs.existsSync(agentsPath) ||
			!fs.readFileSync(agentsPath, "utf8").includes("Shield Integration")
		) {
			fs.appendFileSync(agentsPath, instructionPrefix);
			updatedFiles.push("AGENTS.md");
		}

		s.stop(`Injected instructions into ${updatedFiles.length} files.`);

		// 5. Hardening (Security Hooks & Biome)
		s.start("Hardening workspace...");

		// Copy biome.json to root if not exists
		const sourceBiome = path.join(sourceDir, "biome.json");
		const targetBiome = path.join(targetDir, "biome.json");
		if (fs.existsSync(sourceBiome) && !fs.existsSync(targetBiome)) {
			fs.copySync(sourceBiome, targetBiome);
		}

		// Initialize Git Hooks if in a git repo
		const gitDir = path.join(targetDir, ".git");
		if (fs.existsSync(gitDir)) {
			const hookDir = path.join(gitDir, "hooks");
			if (!fs.existsSync(hookDir)) fs.mkdirSync(hookDir, { recursive: true });

			const preCommitPath = path.join(hookDir, "pre-commit");
			const hookContent = `#!/bin/bash
# Aizen-Gate Pre-Commit Hook
# 1. Security Check
npm run security-check
if [ $? -ne 0 ]; then
  echo "❌ [AZ] Security check failed. Commit aborted."
  exit 1
fi

# 2. Biome Check
npm run check
if [ $? -ne 0 ]; then
  echo "❌ [AZ] Biome check failed. Commit aborted."
  exit 1
fi

echo "✔ [AZ] Pre-commit quality gates passed."
exit 0
`;
			fs.writeFileSync(preCommitPath, hookContent);
			fs.chmodSync(preCommitPath, "755");
		}
		s.stop("Workspace hardening complete.");

		outro(chalk.green("✔ Shield installation complete!"));

		const runConst = await confirm({
			message: "Would you like to define your Project Constitution (Principles/DNA) now?",
			initialValue: true,
		});

		if (isCancel(runConst)) {
			cancel("Onboarding cancelled.");
			return { success: true };
		}

		if (runConst) {
			const { runConstitution } = require("../../src/setup/constitution");
			await runConstitution(targetDir);
		}

		note(
			`1. Run ${chalk.cyan("npx aizen-gate onboarding")} to learn the workflow.\n` +
				`2. Run ${chalk.cyan("npx aizen-gate start")} to begin your first session.`,
			"Next Steps",
		);

		return { success: true, platform, stack };
	} catch (error) {
		s.stop("Installation failed.");
		cancel(`Shield failed to deploy: ${error.message}`);
		return { success: false, error: error.message };
	}
}

module.exports = { installAizenGate };
