import { execSync } from "node:child_process";
import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import { KanbanAutomation } from "../tasks/kanban-automation.js";

export interface MergeConflict {
	wpId: string;
	branchName: string;
}

export interface MergeState {
	currentIndex: number;
	wps: string[];
	featureSlug: string;
	targetBranch: string;
}

export class MergeEngine {
	private projectDir: string;
	private stateFile: string;

	constructor(projectDir: string) {
		this.projectDir = projectDir;
		this.stateFile = path.join(projectDir, "aizen-gate/shared/.merge-state.json");
	}

	/**
	 * Preflight validation ensures the system is in a clean state before attempting a pipeline.
	 */
	runPreflight(featureSlug: string): boolean {
		console.log(chalk.blue(`[Preflight] Validating environment for ${featureSlug}...`));
		try {
			// Ensure working directory is clean
			const status = execSync("git status --porcelain", {
				cwd: this.projectDir,
				encoding: "utf-8",
			});
			if (status.trim().length > 0) {
				throw new Error("Working directory is not clean. Commit or stash changes before merging.");
			}
			return true;
		} catch (e) {
			console.error(chalk.red(`[Preflight Failed] ${(e as Error).message}`));
			return false;
		}
	}

	/**
	 * Dry-run multiple merges using a temporary branch to forecast any potential conflicts early.
	 * This is a Spec-Kitty parity feature.
	 */
	forecastConflicts(featureSlug: string, targetBranch: string, wpOrder: string[]): MergeConflict[] {
		console.log(chalk.blue(`[Forecast] Predicting merge conflicts into ${targetBranch}...`));
		const conflicts: MergeConflict[] = [];

		const tempBranch = `merge-forecast-${Date.now()}`;
		try {
			execSync(`git branch ${tempBranch} ${targetBranch}`, {
				cwd: this.projectDir,
				stdio: "ignore",
			});
			execSync(`git checkout ${tempBranch}`, { cwd: this.projectDir, stdio: "ignore" });

			for (const wpId of wpOrder) {
				const branchName = `${featureSlug}-${wpId}`;
				try {
					execSync(`git merge ${branchName} --no-commit --no-ff`, {
						cwd: this.projectDir,
						stdio: "ignore",
					});
					execSync('git commit -m "Test Merge"', { cwd: this.projectDir, stdio: "ignore" });
				} catch (_err) {
					// Merge failed, means a conflict
					conflicts.push({ wpId, branchName });
					execSync("git merge --abort", { cwd: this.projectDir, stdio: "ignore" });
				}
			}
		} catch (_e) {
			// Ignore if branches don't exist in dry run, or simply log it
		} finally {
			// Clean up temp branch completely
			try {
				execSync(`git checkout ${targetBranch}`, { cwd: this.projectDir, stdio: "ignore" });
				execSync(`git branch -D ${tempBranch}`, { cwd: this.projectDir, stdio: "ignore" });
			} catch (_e) {
				// Branch may not exist or already deleted
			}
		}

		if (conflicts.length > 0) {
			console.log(
				chalk.yellow(
					`[Forecast] ⚠️ Conflicts predicted in the following Work Packages: ${conflicts.map((c) => c.wpId).join(", ")}`,
				),
			);
		} else {
			console.log(chalk.green(`[Forecast] 🚀 Clear skies. No conflicts predicted.`));
		}

		return conflicts;
	}

	/**
	 * Execute sequential merge of topological order. Persists state so it handles manual conflict resolution seamlessly.
	 */
	async executeMerge(
		featureSlug: string,
		wpOrder: string[],
		targetBranch: string = "main",
	): Promise<boolean> {
		if (!this.runPreflight(featureSlug)) return false;

		let state: MergeState = { currentIndex: 0, wps: wpOrder, featureSlug, targetBranch };
		if (fs.existsSync(this.stateFile)) {
			state = JSON.parse(fs.readFileSync(this.stateFile, "utf-8"));
			console.log(
				chalk.yellow(
					`[Merge] Resuming incomplete merge from state file. Next up: ${state.wps[state.currentIndex]}`,
				),
			);
		}

		console.log(
			chalk.blue(`[Merge] Merging ${wpOrder.length} work packages into ${targetBranch}...`),
		);

		try {
			execSync(`git checkout ${targetBranch}`, { cwd: this.projectDir, stdio: "inherit" });

			for (; state.currentIndex < state.wps.length; state.currentIndex++) {
				const wpId = state.wps[state.currentIndex];
				const branchName = `${featureSlug}-${wpId}`;
				console.log(
					`\n[Merge] Processing ${branchName} (${state.currentIndex + 1}/${state.wps.length})`,
				);

				fs.writeFileSync(this.stateFile, JSON.stringify(state));

				try {
					execSync(`git merge ${branchName} --no-ff -m "Merge WP: ${wpId}"`, {
						cwd: this.projectDir,
						stdio: "inherit",
					});
				} catch (_err) {
					console.error(
						chalk.red.bold(`\n[Merge Conflict] Conflict encountered in ${branchName}.`),
					);
					console.error(
						chalk.yellow(
							`Please resolve the conflict manually, commit the resolution, and then run 'aizen-gate merge --resume'.`,
						),
					);
					return false;
				}
			}

			// Cleanup
			if (fs.existsSync(this.stateFile)) {
				fs.unlinkSync(this.stateFile);
			}

			// [Kanban] Auto-update merged tasks to Done
			const kanban = new KanbanAutomation(this.projectDir);
			for (const wpId of wpOrder) {
				await kanban.onMerge(wpId);
			}

			console.log(
				chalk.green.bold(
					`\n🎉 Merge Successful: All ${wpOrder.length} feature branches successfully merged to ${targetBranch}.`,
				),
			);
			return true;
		} catch (e) {
			console.error(chalk.red(`[Merge] Fatal error during execution: ${(e as Error).message}`));
			return false;
		}
	}

	abortMerge() {
		try {
			execSync("git merge --abort", { cwd: this.projectDir, stdio: "ignore" });
			if (fs.existsSync(this.stateFile)) {
				fs.unlinkSync(this.stateFile);
			}
			console.log(chalk.green(`[Merge] Aborted successfully and state cleared.`));
		} catch (e) {
			console.error(chalk.red(`[Merge] Failed to abort: ${(e as Error).message}`));
		}
	}
}
