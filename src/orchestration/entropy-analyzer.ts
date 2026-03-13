import path from "node:path";
import fs from "fs-extra";
import { DashboardService } from "../../dashboard/dashboard-service.js";

export interface EntropyReport {
	score: number; // 0.0 (Clean) to 1.0 (Chaos)
	filesAnalyzed: number;
	hotspots: string[];
	recommendations: string[];
}

/**
 * [Phase 28] EntropyAnalyzer
 * Monitors system complexity and architectural drift.
 */
export class EntropyAnalyzer {
	private feed = DashboardService.getInstance();
	private projectRoot: string;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
	}

	/**
	 * Analyzes a directory for structural entropy.
	 */
	public async analyzeEntropy(dirPath: string): Promise<EntropyReport> {
		const fullPath = path.isAbsolute(dirPath) ? dirPath : path.join(this.projectRoot, dirPath);
		const files = await this.getAllFiles(fullPath);

		let _totalLines = 0;
		const hotspots: string[] = [];
		const recommendations: string[] = [];

		for (const file of files) {
			const stat = await fs.stat(file);
			if (stat.size > 50000) {
				// > 50KB is a hotspot
				hotspots.push(path.relative(this.projectRoot, file));
			}
			const content = await fs.readFile(file, "utf8");
			_totalLines += content.split("\n").length;
		}

		// Heuristic Entropy Score
		const fileCountFactor = Math.min(files.length / 100, 0.5);
		const hotspotFactor = Math.min(hotspots.length / 10, 0.5);
		const score = fileCountFactor + hotspotFactor;

		if (score > 0.7) {
			recommendations.push("Critical: Project entropy is too high. Initiate major refactor.");
		} else if (score > 0.4) {
			recommendations.push(
				"Warning: Complexity is growing. Prune dead code and split large files.",
			);
		}

		const report: EntropyReport = {
			score: Number(score.toFixed(2)),
			filesAnalyzed: files.length,
			hotspots,
			recommendations,
		};

		this.feed.emitThought(
			"ENTROPY_ANALYZER",
			`Entropy Analysis complete: Score ${report.score}. ${report.recommendations[0] || "System is stable."}`,
			{ score: report.score },
		);
		this.feed.emitEvent("entropy_update", report);

		return report;
	}

	private async getAllFiles(dir: string): Promise<string[]> {
		const results: string[] = [];
		if (!fs.existsSync(dir)) return results;

		const list = await fs.readdir(dir);
		for (const file of list) {
			const fullPath = path.join(dir, file);
			const stat = await fs.stat(fullPath);
			if (stat.isDirectory() && !file.includes("node_modules") && !file.includes(".git")) {
				results.push(...(await this.getAllFiles(fullPath)));
			} else if (stat.isFile() && /\.(ts|js|json|md)$/.test(file)) {
				results.push(fullPath);
			}
		}
		return results;
	}
}

let instance: EntropyAnalyzer | null = null;
export const getEntropyAnalyzer = (root?: string) => {
	if (!instance) instance = new EntropyAnalyzer(root || process.cwd());
	return instance;
};
