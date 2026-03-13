import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { MissionEngine } from "../missions/mission-engine.js";

export class Migrator {
	private projectDir: string;
	private versionFile: string;

	constructor(projectDir: string) {
		this.projectDir = projectDir;
		this.versionFile = path.join(projectDir, "aizen-gate", "shared", ".version");
	}

	getCurrentVersion(): string {
		if (!fs.existsSync(this.versionFile)) {
			return "1.0.0"; // Assume v1 if upgrading for the first time
		}
		return fs.readFileSync(this.versionFile, "utf8").trim();
	}

	setVersion(version: string): void {
		fs.writeFileSync(this.versionFile, version, "utf8");
	}

	async runMigrations(): Promise<void> {
		const currentVersion = this.getCurrentVersion();
		const packageJsonPath = path.join(__dirname, "../../package.json");

		if (!fs.existsSync(packageJsonPath)) return;

		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		const targetVersion = packageJson.version;

		if (currentVersion === targetVersion) {
			console.log(chalk.green(`[SA Migrator] Project is already up to date (v${currentVersion}).`));
			return;
		}

		console.log(
			chalk.blue.bold(
				`\n[SA Migrator] Upgrading Aizen-Gate Workspace: v${currentVersion} ➔ v${targetVersion}\n`,
			),
		);

		// Ideally here we iterate through explicit migration scripts in 'migrations/'
		// e.g. migrations/2.0.0.js -> execute()
		// For now, simply initialize default templates
		console.log(chalk.yellow("Executing structural bootstraps..."));
		try {
			// Re-seed updated mission files
			const mz = new MissionEngine(this.projectDir);
			mz.init();

			this.setVersion(targetVersion);
			console.log(
				chalk.green(`\n✔ Migration complete. Workspace successfully updated to v${targetVersion}.`),
			);
		} catch (e) {
			console.error(chalk.red(`\n✖ Migration failed: ${(e as Error).message}`));
		}
	}
}
