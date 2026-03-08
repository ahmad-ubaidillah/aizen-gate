/**
 * LivingDocs: Manages Decisions, Pitfalls, and Patterns shared across phases.
 */

import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

export interface LivingDocsOptions {
	projectRoot: string;
}

export interface DocMenuItem {
	type: string;
	title: string;
	path: string;
}

export class LivingDocs {
	private sharedDir: string;
	private docs: Record<string, string>;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.sharedDir = path.join(projectRoot, "aizen-gate", "shared");
		this.docs = {
			decisions: path.join(this.sharedDir, "decisions.md"),
			pitfalls: path.join(this.sharedDir, "pitfalls.md"),
			patterns: path.join(this.sharedDir, "patterns.md"),
		};
	}

	async ensureDocs(): Promise<void> {
		await fs.ensureDir(this.sharedDir);
		for (const [key, filePath] of Object.entries(this.docs)) {
			if (!fs.existsSync(filePath)) {
				const title = key.charAt(0).toUpperCase() + key.slice(1);
				await fs.writeFile(
					filePath,
					`# 📜 Project ${title}\n*Accumulated cross-phase insights.*\n\n`,
				);
			}
		}
	}

	/**
	 * Appends an entry to a specific document.
	 */
	async append(type: string, phase: string, content: string): Promise<void> {
		if (!this.docs[type]) throw new Error(`Invalid doc type: ${type}`);
		await this.ensureDocs();

		const entry = `
### [${phase}] - ${new Date().toISOString().split("T")[0]}
${content}
---
`;
		await fs.appendFile(this.docs[type], entry);
		console.log(chalk.gray(`[Aizen] Insight captured in ${type}.md`));
	}

	/**
	 * Returns a combined context of all living docs.
	 */
	async getContext(): Promise<string> {
		await this.ensureDocs();
		let context = "\n## 📜 CROSS-PHASE INSIGHTS\n";
		for (const [key, filePath] of Object.entries(this.docs)) {
			const content = await fs.readFile(filePath, "utf8");
			context += `\n### ${key}\n${content.split("\n").slice(4).join("\n")}\n`; // Skip header
		}
		return context;
	}

	/**
	 * Returns a menu of available documentation items.
	 */
	async getMenu(): Promise<DocMenuItem[]> {
		await this.ensureDocs();
		const menu: DocMenuItem[] = [];
		for (const [key, filePath] of Object.entries(this.docs)) {
			const title = key.charAt(0).toUpperCase() + key.slice(1);
			menu.push({
				type: key,
				title,
				path: filePath,
			});
		}
		return menu;
	}
}
