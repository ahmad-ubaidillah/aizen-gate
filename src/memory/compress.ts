import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import { MemoryBridge } from "./memory-bridge.js";
import { MemoryStore } from "./memory-store.js";

/**
 * Aizen-Gate Context Token Distillation
 * Moves old "Done" tasks out of board.md and trims redundant state.md lines
 * to drastically reduce API token context payloads.
 */
export async function compressContext(
	projectRoot: string,
): Promise<{ success: boolean; error?: string }> {
	console.log(chalk.yellow.bold("\n--- [OPS] Compressing Tokens & Distilling Memory ---\n"));

	const memory = new MemoryBridge(path.basename(projectRoot));
	const semanticMemory = new MemoryStore(projectRoot);

	const sharedDir = path.join(projectRoot, "aizen-gate", "shared");
	const boardPath = path.join(sharedDir, "board.md");
	const archiveDir = path.join(sharedDir, "archive");
	const archivePath = path.join(archiveDir, "board-history.md");
	const statePath = path.join(sharedDir, "state.md");

	try {
		await fs.ensureDir(archiveDir);
		let archiveContent = fs.existsSync(archivePath)
			? fs.readFileSync(archivePath, "utf8")
			: "# Board History Archive\n\n| ID | Task | Completed By | Date | Review Result |\n|:---|:---|:---|:---|:---|\n";

		// 1. Board Pruning & Semantic Fact Extraction
		if (fs.existsSync(boardPath)) {
			const boardData = fs.readFileSync(boardPath, "utf8");
			const lines = boardData.split("\n");
			const newLines: string[] = [];
			let inCompletedSection = false;
			let strippedTasks = 0;

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (line.includes("## Completed Tasks")) {
					inCompletedSection = true;
					newLines.push(line);
					continue;
				}

				if (inCompletedSection && line.startsWith("## ")) {
					inCompletedSection = false;
				}

				if (
					inCompletedSection &&
					line.startsWith("|") &&
					!line.includes("| ID |") &&
					!line.includes("|:--")
				) {
					// Extract completed row and push to archive/memory
					archiveContent += `${line}\n`;
					strippedTasks++;

					// SIFTING: Distill significant tasks into Long-Term Memory
					const taskParts = line
						.split("|")
						.map((p) => p.trim())
						.filter(Boolean);
					if (taskParts.length >= 2) {
						const taskId = taskParts[0];
						const taskDesc = taskParts[1];

						// Bridge to SQLite-based Legacy Memory
						await memory.storeDecision(`Completed Task: ${taskDesc}`, ["history", taskId]);

						// [NEW] SIFTING into Mem0 Semantic Fact Store
						await semanticMemory.add(`Task ${taskId} was completed: ${taskDesc}`, "board_archive");
					}
				} else {
					newLines.push(line);
				}
			}

			if (strippedTasks > 0) {
				fs.writeFileSync(boardPath, newLines.join("\n"));
				fs.writeFileSync(archivePath, archiveContent);
				console.log(
					chalk.green(`✔ Archived ${strippedTasks} completed tasks out of active context.`),
				);
			} else {
				console.log(chalk.gray("No new completed tasks to archive."));
			}
		}

		// 2. State.md Sliding Window (Context Rot Prevention)
		if (fs.existsSync(statePath)) {
			const stateData = fs.readFileSync(statePath, "utf8");
			const lines = stateData.split("\n");
			if (lines.length > 50) {
				// Keep the header (first 10) and most recent events (last 20)
				const header = lines.slice(0, 10);
				const footer = lines.slice(-20);

				// Extract facts from the middle slice before discarding it
				const middle = lines.slice(10, -20).join(" ");
				if (middle.length > 100) {
					await semanticMemory.add(
						`Historical state context: ${middle.slice(0, 200)}...`,
						"state_compression",
					);
				}

				const compressed = [
					...header,
					"\n... [Older contextual memory compressed via az-compress into Semantic Store] ...\n",
					...footer,
				].join("\n");
				fs.writeFileSync(statePath, compressed);
				console.log(chalk.green("✔ Compressed state.md using SLIDING WINDOW strategy."));
			} else {
				console.log(chalk.gray("state.md is already well within context limits."));
			}
		}

		// [FUTURE] 3. Artifact Summarization (Spec/Plan distillation)
		// If spec.md or plan.md are > budget, they could be summarized into 'Artifact Digests'.

		console.log(chalk.white("\n[OPS] Agent context is now highly optimized (RTK + Mem0 hybrid)."));
		return { success: true };
	} catch (err) {
		console.error(chalk.red(`\n[OPS] Compression failed: ${(err as Error).message}`));
		return { success: false, error: (err as Error).message };
	}
}
