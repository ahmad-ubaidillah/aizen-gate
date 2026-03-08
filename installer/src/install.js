const fs = require("fs-extra");
const path = require("node:path");
const { intro, outro, spinner, note, confirm, isCancel, cancel } = require("@clack/prompts");
const chalk = require("chalk");
const { detectPlatform, getSupportedPlatforms, getPlatformConfig } = require("./detect-platform");
const { detectStack } = require("../../skill-creator/src/tech-detector");

/**
 * Aizen-Gate Core Installer (formerly az-install)
 * Handles file copying, environment setup, and Shield initialization.
 *
 * Supports 20+ AI IDEs/CLIs:
 * - Claude Code, Cursor, Windsurf, Kiro, Kilo, OpenCode, Zed
 * - Gemini CLI, GitHub Copilot, Cline
 * - Bolt.new, Lovable, Devin, OpenDevin
 * - Continue, Augment, Codeium, Tabnine
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
			// Normalize paths for Windows compatibility (handle symlinks/junctions)
			const normalizedSource = path.normalize(sourceDir);
			const normalizedTarget = path.normalize(targetDir);

			// Ensure we're not copying target into itself
			if (
				normalizedTarget.startsWith(normalizedSource) ||
				normalizedSource.startsWith(normalizedTarget)
			) {
				note(
					"Source and target paths overlap. Skipping copy to prevent recursion.",
					"Path Warning",
				);
			} else {
				s.start("Copying Shield files...");
				await fs.copy(sourceDir, aizenDir, options);
				s.stop(`Shield files copied to: ${chalk.dim(aizenDir)}`);
			}
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

		// 4. Platform-Specific Injection - Supports 20+ AI IDEs/CLIs
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

		// Platform injection mapping - handles all supported IDEs/CLIs
		const platformInjections = [
			// CLI Tools
			{ platform: "claude-code", file: "CLAUDE.md", create: true },
			{ platform: "antigravity", file: "GEMINI.md", create: true },

			// IDEs
			{ platform: "cursor", file: ".cursorrules", create: true },
			{
				platform: "windsurf",
				file: ".windsurf/rules/rules.md",
				create: true,
				mkdir: ".windsurf/rules",
			},
			{ platform: "kiro", file: ".kiro/config.md", create: true, mkdir: ".kiro" },
			{ platform: "kilo", file: ".kilo/config.md", create: true, mkdir: ".kilo" },
			{ platform: "opencode", file: ".agents/config.md", create: true, mkdir: ".agents" },
			{ platform: "zed", file: ".zed/settings.json", create: true, mkdir: ".zed" },

			// VSCode Extensions
			{
				platform: "copilot",
				file: ".github/copilot-instructions.md",
				create: true,
				mkdir: ".github",
			},
			{ platform: "cline", file: ".claude/settings.json", create: true, mkdir: ".claude" },
			{ platform: "continue", file: "continue_config.json", create: true },

			// Web-based AI Builders
			{ platform: "bolt", file: ".bolt/config", create: true, mkdir: ".bolt" },
			{ platform: "lovable", file: "lovable.config", create: true },

			// AI Agents
			{ platform: "devin", file: ".devin/config.md", create: true, mkdir: ".devin" },
			{ platform: "opendevin", file: "opendevin.conf", create: true },

			// Extensions
			{ platform: "augment", file: ".augmentrc", create: true },
			{ platform: "codeium", file: ".codeium/config.json", create: true, mkdir: ".codeium" },
			{ platform: "tabnine", file: ".tabnine/config.json", create: true, mkdir: ".tabnine" },
		];

		// Inject into detected platform
		for (const injection of platformInjections) {
			if (
				platform === injection.platform ||
				(platform === "generic" && injection.platform === "claude-code")
			) {
				try {
					const filePath = path.join(targetDir, injection.file);

					// Create directory if needed
					if (injection.mkdir) {
						const dirPath = path.join(targetDir, injection.mkdir);
						if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
					}

					// Create file with instructions or append
					if (injection.create && !fs.existsSync(filePath)) {
						fs.writeFileSync(filePath, `# Aizen-Gate Integration\n${instructionPrefix}`);
					} else if (fs.existsSync(filePath)) {
						const existing = fs.readFileSync(filePath, "utf8");
						if (!existing.includes("Aizen-Gate Integration")) {
							fs.appendFileSync(filePath, instructionPrefix);
						}
					}
					updatedFiles.push(injection.file);
				} catch (err) {
					console.log(
						chalk.yellow(`Warning: Could not inject into ${injection.file}: ${err.message}`),
					);
				}
			}
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
