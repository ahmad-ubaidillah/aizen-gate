/**
 * Skills CLI Commands
 */

import path from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import fs from "fs-extra";

/**
 * Register skills commands
 */
export function registerSkills(program: Command): void {
	const skillCmd = program
		.command("skill")
		.description("Manage and install agent skills from the library");

	skillCmd
		.command("search")
		.description("Search the Antigravity 1.2k+ skill library")
		.argument("<query>", "Keywords to search")
		.action(async (query: string) => {
			const { SkillHub } = await import("../../src/utils/skill-hub.js");
			const hub = new SkillHub(process.cwd());
			const results = await hub.search(query);
			console.log(chalk.cyan(`\n--- ⛩️ [Aizen] Skill Search Results: "${query}" ---\n`));
			results.forEach((s: any) => {
				console.log(`${chalk.yellow(s.name)} - ${s.description}`);
				console.log(chalk.gray(`   ID: ${s.id} | Downloads: ${s.downloads}\n`));
			});
		});

	skillCmd
		.command("install")
		.description("Install a specific skill from the registry")
		.argument("<id>", "Skill ID to install")
		.action(async (id: string) => {
			const { SkillHub } = await import("../../src/utils/skill-hub.js");
			const hub = new SkillHub(process.cwd());
			try {
				const res = await hub.install(id);
				console.log(chalk.green(`\n✔ Installed skill "${res.name}" into ${res.path}`));
			} catch (e: any) {
				console.error(chalk.red(`\n✖ Installation failed: ${e.message}`));
			}
		});

	skillCmd
		.command("add")
		.description("Create a new skill from documentation links")
		.argument("<links>", "Comma-separated documentation links")
		.action(async (links: string) => {
			const { runSkillCreator } = await import("../../skill-creator/index.js");
			await runSkillCreator(process.cwd(), links.split(","));
		});

	skillCmd
		.command("create")
		.description("Bootstrap a new custom skill for your workspace")
		.argument("<name>", "Skill name")
		.action(async (name: string) => {
			const skillFile = path.join(process.cwd(), "aizen-gate/skills", `${name}.md`);
			const content = `# Skill: ${name}

## Capability
- Describe the skill here.

## Usage
- Example interaction here.`;
			await fs.ensureDir(path.dirname(skillFile));
			await fs.writeFile(skillFile, content);
			console.log(chalk.green(`\n✔ Custom skill "${name}" bootstrapped at ${skillFile}`));
		});
}
