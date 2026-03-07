const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { autoGenerateSkills } = require("../skill-creator/index");

/**
 * [AZ] Skill Watcher
 * Monitors dependency files for changes to trigger automatic skill generation.
 */
class SkillWatcher {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.targets = ["package.json", "requirements.txt", "go.mod", "Cargo.toml", "pom.xml"];
		this.watchers = [];
	}

	start() {
		console.log(chalk.blue(`[SkillWatcher] Shield active. Monitoring dependencies...`));

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

	async triggerUpdate() {
		try {
			await autoGenerateSkills(this.projectRoot);
		} catch (e) {
			console.error(`[SkillWatcher] Update failed: ${e.message}`);
		}
	}

	stop() {
		this.watchers.forEach((w) => w.close());
		this.watchers = [];
	}
}

module.exports = { SkillWatcher };
