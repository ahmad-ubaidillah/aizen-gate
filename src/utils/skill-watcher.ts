import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { autoGenerateSkills } from "../../skill-creator/index.js";

/**
 * [AZ] Skill Watcher
 * Monitors dependency files for changes to trigger automatic skill generation.
 */
export class SkillWatcher {
	private projectRoot: string;
	private targets: string[];
	private watchers: fs.FSWatcher[];

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.targets = ["package.json", "requirements.txt", "go.mod", "Cargo.toml", "pom.xml"];
		this.watchers = [];
	}

	start(): void {
		console.log(chalk.blue("[SkillWatcher] Shield active. Monitoring dependencies..."));

		this.targets.forEach((target) => {
			const targetPath = path.join(this.projectRoot, target);
			if (fs.existsSync(targetPath)) {
				console.log(chalk.gray(`   - Watching ${target}`));
				const watcher = fs.watch(targetPath, (eventType) => {
					if (eventType === "change") {
						console.log(
							chalk.yellow(`\n[AZ] Dependency change detected in ${target}. Updating skills...`),
						);
						this.triggerUpdate();
					}
				});
				this.watchers.push(watcher);
			}
		});

		// Initial scan
		this.triggerUpdate();
	}

	async triggerUpdate(): Promise<void> {
		try {
			await autoGenerateSkills(this.projectRoot);
		} catch (e: unknown) {
			const err = e as Error;
			console.error(`[SkillWatcher] Update failed: ${err.message}`);
		}
	}

	stop(): void {
		for (const w of this.watchers) {
			w.close();
		}
		this.watchers = [];
	}
}
