import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Aizen-Gate Skill Hub
 * Orchestrates the search and local "installation" of skills from the
 * Antigravity 1.2k+ library.
 */
export class SkillHub {
	private sourceLib: string;
	private indexPath: string;
	private destDir: string;

	constructor(projectRoot: string) {
		// Source library located in the same parent directory as the superagent tool
		this.sourceLib = path.join(projectRoot, "..", "antigravity-awesome-skills-main");
		this.indexPath = path.join(this.sourceLib, "skills_index.json");
		this.destDir = path.join(projectRoot, "aizen-gate", "skills");
	}

	/**
	 * Search for a skill by name or description in the 1.2k+ library.
	 */
	async search(query: string): Promise<any[]> {
		if (!fs.existsSync(this.indexPath)) {
			console.log(chalk.red(`[SA] Skill library index not found at ${this.indexPath}`));
			return [];
		}

		try {
			const index = await fs.readJson(this.indexPath);
			const results = index.filter(
				(s: any) =>
					s.name?.toLowerCase().includes(query.toLowerCase()) ||
					s.description?.toLowerCase().includes(query.toLowerCase()) ||
					s.id?.toLowerCase().includes(query.toLowerCase()),
			);

			return results.slice(0, 10); // Return top 10 matches
		} catch (e) {
			console.error("[SkillHub] Search failed:", (e as Error).message);
			return [];
		}
	}

	/**
	 * "Install" (copy) a skill from the source library to the current project.
	 */
	async install(skillId: string): Promise<any> {
		if (!fs.existsSync(this.indexPath)) {
			throw new Error("Skill library not found.");
		}

		const index = await fs.readJson(this.indexPath);
		const skill = index.find((s: any) => s.id === skillId || s.name === skillId);

		if (!skill) {
			throw new Error(`Skill '${skillId}' not found in the library.`);
		}

		const srcPath = path.join(this.sourceLib, skill.path);
		// Categorize by category if available, otherwise 'community'
		const category = skill.category || "community";
		const destPath = path.join(this.destDir, category, path.basename(skill.path));

		if (!fs.existsSync(srcPath)) {
			throw new Error(`Source skill directory not found at ${srcPath}`);
		}

		await fs.ensureDir(path.dirname(destPath));
		await fs.copy(srcPath, destPath);

		return { success: true, path: destPath, name: skill.name };
	}

	/**
	 * Submit/Publish a local skill (Draft for Phase 7).
	 */
	async publish(localSkillName: string): Promise<any> {
		// Implementation for packaging and notifying community
		console.log(
			chalk.yellow(
				`[SA] Skill '${localSkillName}' packaged for submission. Reviewing constraints...`,
			),
		);
		return { success: true };
	}
}
