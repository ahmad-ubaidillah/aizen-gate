const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("fs-extra");

class WorktreeManager {
	constructor(projectDir) {
		this.projectDir = projectDir;
		// Keep it local to the repository where superagent is running
		this.worktreesDir = path.join(projectDir, ".worktrees");
	}

	isGitRepo() {
		try {
			execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore", cwd: this.projectDir });
			return true;
		} catch (_e) {
			return false;
		}
	}

	createWorktree(featureSlug, wpId, baseWp = null) {
		if (!this.isGitRepo()) {
			throw new Error("Cannot create worktree: Not in a git repository. Run 'git init' first.");
		}

		if (!fs.existsSync(this.worktreesDir)) {
			fs.mkdirSync(this.worktreesDir, { recursive: true });
		}

		const branchName = `${featureSlug}-${wpId}`;
		const worktreePath = path.join(this.worktreesDir, branchName);

		if (fs.existsSync(worktreePath)) {
			console.log(`[WorktreeManager] Worktree for ${wpId} already exists at ${worktreePath}`);
			return worktreePath;
		}

		try {
			if (baseWp) {
				// Base off another WP's branch for sequential chains
				const baseBranch = `${featureSlug}-${baseWp}`;
				console.log(`[WorktreeManager] Creating worktree for ${wpId} trailing ${baseBranch}...`);
				execSync(`git worktree add -b ${branchName} "${worktreePath}" ${baseBranch}`, {
					stdio: "pipe",
					cwd: this.projectDir,
				});
			} else {
				// Base off current branch (usually main)
				console.log(`[WorktreeManager] Creating parallel worktree for ${wpId}...`);
				execSync(`git worktree add -b ${branchName} "${worktreePath}"`, {
					stdio: "pipe",
					cwd: this.projectDir,
				});
			}

			// ⛩️ Symlink Constitution for standard adherence
			const sharedConst = path.join(this.projectDir, "aizen-gate", "shared", "constitution.md");
			const wtConst = path.join(worktreePath, "CONSTITUTION.md");
			if (fs.existsSync(sharedConst)) {
				try {
					fs.ensureSymlinkSync(sharedConst, wtConst);
					console.log(`[WorktreeManager] 📖 Linked Project Constitution to ${wpId}`);
				} catch (_e) {}
			}

			return worktreePath;
		} catch (e) {
			console.error(`[WorktreeManager] Failed to create worktree: ${e.message}`);
			throw e;
		}
	}

	listWorktrees() {
		if (!this.isGitRepo()) return [];
		try {
			const output = execSync("git worktree list --porcelain", {
				cwd: this.projectDir,
				encoding: "utf-8",
			});
			// porcelain output: "worktree /path/to/worktree" separated by empty lines
			const wts = output.match(/worktree (.+)/g) || [];
			return wts.map((wt) => wt.replace("worktree ", "").trim());
		} catch (_e) {
			return [];
		}
	}

	removeWorktree(featureSlug, wpId) {
		const branchName = `${featureSlug}-${wpId}`;
		const worktreePath = path.join(this.worktreesDir, branchName);

		try {
			// Clean up the worktree
			execSync(`git worktree remove --force "${worktreePath}"`, {
				stdio: "pipe",
				cwd: this.projectDir,
			});
			console.log(`[WorktreeManager] Cleaned up worktree for ${wpId}`);
			// Note: We leave the branch intact so it can be merged via 'az-merge' later.
		} catch (e) {
			console.error(`[WorktreeManager] Failed to remove worktree: ${e.message}`);
		}
	}

	autoCommitWP(branchName, wpId, message) {
		const worktreePath = path.join(this.worktreesDir, branchName);
		if (!fs.existsSync(worktreePath)) return;

		try {
			execSync("git add .", { cwd: worktreePath });
			const commitMsg = `${wpId} - ${message || "Atomic implementation commit"}`;
			execSync(`git commit -m "${commitMsg}"`, { cwd: worktreePath });
			console.log(`[WorktreeManager] ✔ Atomic commit created for ${wpId}`);
		} catch (e) {
			// Might fail if no changes, which is okay
			if (!e.message.includes("nothing to commit")) {
				console.error(`[WorktreeManager] Commit failed for ${wpId}: ${e.message}`);
			}
		}
	}
}

module.exports = { WorktreeManager };
