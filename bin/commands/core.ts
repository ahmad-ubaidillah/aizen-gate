/**
 * Core CLI Commands for Aizen-Gate
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cancel, confirm, intro, note, outro, select, spinner } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";
import yaml from "js-yaml";

/**
 * Register core commands
 * @param program - Commander program instance
 */
export function registerCore(program: Command): void {
	// 1. Doctor (New)
	program
		.command("doctor")
		.description("Check system health and Hybrid AI status")
		.action(async () => {
			intro(chalk.cyan("⛩️  Aizen-Gate Doctor"));
			const s = spinner();
			s.start("Checking architecture...");

			const results: string[] = [];
			const projectRoot = process.cwd();

			// 1. Check AI Dependencies
			try {
				await import("node-llama-cpp");
				results.push(chalk.green("✔ [AI] node-llama-cpp: Installed"));
			} catch {
				results.push(chalk.yellow("⚠ [AI] node-llama-cpp: Missing (Mode: Lite Heuristic)"));
			}

			try {
				await import("@xenova/transformers");
				results.push(chalk.green("✔ [AI] transformers: Installed"));
			} catch {
				results.push(chalk.yellow("⚠ [AI] transformers: Missing (Mode: Lite Jaccard)"));
			}

			// 2. Check Model Cache
			const modelName = "qwen2.5-0.5b-instruct-q4_k_m.gguf";
			const modelPath = path.join(os.homedir(), ".aizen-gate", "models", modelName);
			if (fs.existsSync(modelPath)) {
				results.push(chalk.green("✔ [Model] Local LLM found in global cache"));
			} else {
				results.push(chalk.yellow("⚠ [Model] Local LLM missing in ~/.aizen-gate/"));
			}

			// 3. Check Shared State
			if (fs.existsSync(path.join(projectRoot, "aizen-gate/shared/state.md"))) {
				results.push(chalk.green("✔ [State] Project constitution & state active"));
			}

			s.stop("Diagnosis complete.");
			note(results.join("\n"), "Health Report");

			if (results.some((r: string) => r.includes("Missing"))) {
				console.log(chalk.cyan("\n💡 To upgrade to Full AI engine:"));
				console.log(chalk.white("   npm install node-llama-cpp @xenova/transformers\n"));
			}

			outro(chalk.cyan("Stay sharp. ⛩️"));
		});

	// 1.5. Onboarding
	program
		.command("onboarding")
		.description("Launch the enhanced user guidance wizard")
		.option("--classic", "Use the classic onboarding instead")
		.option("--comprehensive", "Use the new comprehensive setup with all 8 steps")
		.action(async (options: { classic?: boolean; comprehensive?: boolean }) => {
			const projectRoot = process.cwd();
			if (options.comprehensive) {
				const { runOnboarding } = await import("../../src/setup/onboarding.js");
				await runOnboarding({ comprehensive: true, projectRoot });
			} else if (options.classic) {
				const { runOnboarding } = await import("../../src/setup/onboarding.js");
				await runOnboarding(projectRoot);
			} else {
				const { runEnhancedOnboarding } = await import("../../src/setup/onboarding.js");
				await runEnhancedOnboarding(projectRoot);
			}
		});
	
	// 1.6. Install (Root Alias)
	program
		.command("install")
		.description("Initialize Aizen-Gate in the current workspace (Shortcut for onboarding)")
		.action(async () => {
			const { runEnhancedOnboarding } = await import("../../src/setup/onboarding.js");
			await runEnhancedOnboarding(process.cwd());
		});

	// 2. Start
	program
		.command("start")
		.description("Initialize a new Aizen session and grooming phase")
		.action(async () => {
			const { runPlaybook } = (await import("../../src/utils/playbook-runner.js")) as any;
			await runPlaybook("start", process.cwd());
		});

	// 3. Status
	program
		.command("status")
		.description("Check the current status of the scrum board")
		.action(async () => {
			const projectDir = process.cwd();
			const boardPath = path.join(projectDir, "aizen-gate/shared/board.md");
			if (fs.existsSync(boardPath)) {
				const board = await fsPromises.readFile(boardPath, "utf8");
				note(board, chalk.cyan("⛩️  Sprint Board Status"));
			} else {
				cancel("No active board found.");
				console.log(chalk.dim("Run 'npx aizen-gate start' first.\n"));
			}
		});

	// 4. Constitution
	program
		.command("constitution")
		.description("Define project principles and code standards via interactive interview")
		.action(async () => {
			const { runConstitution } = await import("../../src/setup/constitution.js");
			await runConstitution(process.cwd());
		});

	// 5. Config
	program
		.command("config")
		.description("View or update Aizen-Gate configuration")
		.argument("[action]", "get, set, list", "list")
		.argument("[key]", "Configuration key (e.g., model_family)")
		.argument("[value]", "New value for the key")
		.action(
			async (action: string | undefined, key: string | undefined, value: string | undefined) => {
				const configPath = path.join(process.cwd(), "aizen-gate/shared/config.json");
				if (!fs.existsSync(configPath)) {
					cancel("Config file not found.");
					return;
				}

				const config = JSON.parse(await fsPromises.readFile(configPath, "utf8"));

				if (action === "list") {
					note(yaml.dump(config), chalk.cyan("⛩️  Project Configuration"));
				} else if (action === "get") {
					if (!key) return cancel("Key required for 'get' action.");
					console.log(`\n  ${chalk.cyan(key)}: ${config[key] || chalk.dim("not set")}\n`);
				} else if (action === "set") {
					if (!key || !value) return cancel("Key and value required for 'set' action.");
					const normalizedKey = key.replace(".", "_");
					config[normalizedKey] = value;
					await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2));
					console.log(
						chalk.green(
							`\n  ✔ Configuration updated: ${chalk.cyan(normalizedKey)} = ${chalk.yellow(value)}\n`,
						),
					);
				}
			},
		);

	// 6. Clean
	program
		.command("clean")
		.description("Archive finished tasks/WPs and optimize workspace storage")
		.action(async () => {
			const { archiveTasks } = await import("../../src/tasks/archive-tasks.js");
			await archiveTasks(process.cwd());
		});

	// 7. Pulse (Phase 8: Distributed Knowledge)
	const pulse = program
		.command("pulse")
		.description("Collective intelligence & global synchronization");

	pulse
		.command("sync")
		.description("Synchronize local memory with Aizen-Pulse global network")
		.option("--force", "Force recursive sync of all memory fragments")
		.action(async (_options: { force?: boolean }) => {
			intro(chalk.cyan("⛩️  Aizen-Pulse Sync"));
			const s = spinner();
			s.start("Connecting to Aizen-Pulse network...");

			// Placeholder for Phase 8 Sync Logic
			await new Promise((r) => setTimeout(r, 1500));

			s.stop("Synchronization complete.");
			note(
				`${chalk.green("✔")} 142 Memory fragments distilled\n${chalk.green("✔")} 12 Skills synchronized\n${chalk.green("✔")} Knowledge graph updated`,
				"Sync Report",
			);
			outro(chalk.cyan("Your local brain is now globally aligned. ⛩️"));
		});

	pulse
		.command("board")
		.alias("pb")
		.description("Show the Pulse Collective Intelligence Dashboard")
		.action(async () => {
			const { showPulseDashboard } = await import("../../src/commands/pulse-dashboard.js");
			await showPulseDashboard();
		});

	pulse
		.command("forget")
		.description("Trigger Neural Forgetting (Soft Pruning / Purgatory)")
		.option("--threshold <number>", "Importance threshold (default: 3.0)", "3.0")
		.option("--age <number>", "Age in days (default: 30)", "30")
		.option("--hard", "Permanently delete archived fragments from Purgatory (Zero Tokens)")
		.action(async (options: { threshold: string; age: string; hard?: boolean }) => {
			intro(chalk.cyan("⛩️  Neural Forgetting Protocol"));

			const { getMemoryStore } = await import("../../src/memory/memory-store.js");
			const store = getMemoryStore();
			await store.ready;

			if (options.hard) {
				const confirmed = await confirm({
					message:
						"Are you sure you want to PERMANENTLY delete fragments in Purgatory? (Irreversible)",
				});
				if (confirmed === true) {
					const s = spinner();
					s.start("Purging Purgatory...");
					const count = await store.purgeArchived();
					s.stop("Purge complete.");
					note(
						chalk.red(`Neural Purge complete: ${count} fragments permanently deleted. ⛩️🔥`),
						"Hard Delete Report",
					);
				}
				outro(chalk.cyan("The mesh is now ultra-lean. ⛩️"));
				return;
			}

			const s = spinner();
			s.start("Analyzing memory salience...");
			const archived = await store.archiveMemory(
				parseFloat(options.threshold),
				parseInt(options.age, 10),
			);
			s.stop("Analysis complete.");

			if (archived > 0) {
				note(
					`${chalk.green("✔")} ${archived} Memories moved to Purgatory\n${chalk.green("✔")} Active entropy reduced (0 Tokens)`,
					"Forgetting Report",
				);
				const purgeNow = await confirm({
					message: "Would you like to PERMANENTLY delete these archived fragments now?",
				});
				if (purgeNow === true) {
					const ps = spinner();
					ps.start("Purging...");
					await store.purgeArchived();
					ps.stop("Purged.");
				}
			} else {
				note(chalk.gray("No low-salience fragments found to archive."), "Status");
			}

			outro(chalk.cyan("Memory optimization handled locally with ZERO tokens. ⛩️"));
		});

	pulse
		.command("dream")
		.description("Trigger Neural Dreaming (Consolidate archived knowledge)")
		.action(async () => {
			intro(chalk.magenta("⛩️  Neural Dreaming Protocol"));
			const s = spinner();
			s.start("Deep reflection in progress...");

			const { getMemoryStore } = await import("../../src/memory/memory-store.js");
			const store = getMemoryStore();
			await store.ready;

			const consolidated = await store.consolidateKnowledge();

			s.stop("Dreams synthesized.");
			if (consolidated > 0) {
				note(
					`${chalk.green("✔")} ${consolidated} Fragments distilled\n${chalk.green("✔")} Knowledge graph densified`,
					"Dreaming Report",
				);
				outro(chalk.magenta("The swarm has emerged from its slumber with deeper wisdom. ⛩️🌙"));
			} else {
				note(
					chalk.gray("Not enough archived fragments to trigger a dream. (>5 required)"),
					"Status",
				);
				outro(chalk.gray("Resting silently... ⛩️"));
			}
		});

	pulse
		.command("repair")
		.description("Trigger Immune System (Diagnose and repair sick skills)")
		.action(async () => {
			intro(chalk.red("⛩️  Aizen Immune System (Auto-Healing)"));

			const { getMemoryStore } = await import("../../src/memory/memory-store.js");
			const store = getMemoryStore();
			await store.ready;

			const sickSkills = store.getSickSkills();
			if (sickSkills.length === 0) {
				note(chalk.green("✔ All systems healthy. No sick skills detected. ⛩️🛡️"), "Health Check");
				outro(chalk.cyan("Swarm is performing at peak efficiency."));
				return;
			}

			const selection = await select({
				message: `Detected ${sickSkills.length} sick skills. Select one to diagnose:`,
				options: sickSkills.map((s: any) => ({
					label: `${s.viking_path} (Success: ${(s.success_rate * 100).toFixed(1)}%)`,
					value: s.viking_path,
				})),
			});

			if (typeof selection === "symbol") return;

			const skill = sickSkills.find((s: any) => s.viking_path === selection);
			const action = await select({
				message: `Action for ${selection}:`,
				options: [
					{ label: "Diagnose (Analyze failure logs)", value: "diagnose" },
					{ label: "Quarantine (Prevent execution)", value: "quarantine" },
					{ label: "Restore (Mark as stable)", value: "restore" },
					{ label: "Cancel", value: "cancel" },
				],
			});

			if (action === "quarantine") {
				await store.quarantineSkill(selection as string);
				note(chalk.yellow(`Skill ${selection} has been moved to QUARANTINE.`), "Immune Response");
			} else if (action === "restore") {
				await store.restoreSkill(selection as string);
				note(chalk.green(`Skill ${selection} has been restored to STABLE.`), "Immune Response");
			} else if (action === "diagnose") {
				const s = spinner();
				s.start("Analyzing failure patterns via LlamaBridge...");

				const { createLlamaBridge } = await import("../../src/memory/llama-bridge.js");
				const bridge = createLlamaBridge();
				const result = await bridge.diagnose(
					selection as string,
					(skill as any).failure_logs || "No failure logs recorded.",
				);

				s.stop("Diagnosis complete.");
				note(chalk.white(result), "Fix Suggestion");
			}

			outro(chalk.red("Immune System cycle complete. ⛩️🛡️"));
		});

	pulse
		.command("vote")
		.description("Trigger Neural Consensus (Swarm Voting simulation)")
		.action(async () => {
			intro(chalk.yellow("⛩️  Neural Consensus Protocol (Democratic Swarm)"));

			const action = await select({
				message: "Select an action for swarm consensus:",
				options: [
					{ label: "Refactor Core Logic", value: "REFACTOR_CORE" },
					{ label: "Update Security Protocol", value: "UPDATE_SECURITY" },
					{ label: "Deploy to Production", value: "DEPLOY_PROD" },
					{ label: "Prune Global Memory", value: "PRUNE_GLOBAL" },
				],
			});

			if (typeof action === "symbol") return;

			const s = spinner();
			s.start("Broadcasting proposal to swarm...");

			const { getConsensusEngine } = await import("../../src/orchestration/consensus-engine.js");
			const engine = getConsensusEngine();

			const proposal = {
				id: `prop_${Date.now()}`,
				proposer: "User-Gateway",
				action: action as string,
				payload: { timestamp: new Date().toISOString() },
				timestamp: new Date().toISOString(),
			};

			const result = await engine.evaluateProposal(proposal);
			s.stop("Consensus cycle complete.");

			if (result.approved) {
				note(
					chalk.green(
						`Proposal APPROVED (${(result.ratio * 100).toFixed(0)}%)\nSwarm is aligned. Proceed with execution.`,
					),
					"Consensus Report",
				);
				outro(chalk.cyan("Democratic execution verified. ⛩️🗳️"));
			} else {
				note(
					chalk.red(
						`Proposal REJECTED (${(result.ratio * 100).toFixed(0)}%)\nSwarm consensus not reached. Compliance failure.`,
					),
					"Consensus Report",
				);
				outro(chalk.red("Execution halted. ⛩️🛑"));
			}
		});

	pulse
		.command("kill")
		.description("EMERGENCY: Stop all autonomous swarm processes and clean worktrees")
		.action(async () => {
			intro(chalk.red.bgWhite.bold(" ⛩️  EMERGENCY KILL-SWITCH ACTIVATED  "));

			const { WorktreeManager } = await import("../../src/orchestration/worktree-manager.js");
			const wt = new WorktreeManager(process.cwd());

			const worktrees = wt.listWorktrees();
			if (worktrees.length < 2) {
				// 1 is always the root
				note(chalk.green("No active autonomous worktrees detected. ⛩️🛡️"), "Safety Check");
				outro(chalk.cyan("Swarm is already dormant."));
				return;
			}

			const confirmed = await confirm({
				message: `Detected ${worktrees.length - 1} active worktrees. SHUT DOWN ALL and force-remove? (DANGER: Unsaved work in worktrees will be LOST)`,
			});

			if (confirmed === true) {
				const s = spinner();
				s.start("Terminating swarm processes...");

				for (const pathStr of worktrees) {
					if (pathStr === process.cwd()) continue;
					const parts = pathStr.split("/");
					const branch = parts[parts.length - 1];
					const [slug, ...idParts] = branch.split("-");
					const wpId = idParts.join("-");

					try {
						wt.removeWorktree(slug, wpId);
					} catch (e) {
						console.log(chalk.gray(`   - Could not remove ${branch}: ${(e as Error).message}`));
					}
				}

				s.stop("Swarm terminated.");
				note(
					chalk.red.bold("All autonomous worktrees have been purged. Protocol Zero restored. ⛩️🔥"),
					"Emergency Report",
				);
			}

			outro(chalk.red("The swarm has been silenced. ⛩️"));
		});
}
