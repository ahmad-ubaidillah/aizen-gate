const chalk = require("chalk");
const path = require("node:path");
const fs = require("fs-extra");

function registerSkills(program) {
	const skillCmd = program
		.command("skill")
		.description("Manage and install agent skills from the library");

	skillCmd
		.command("search")
		.description("Search the Antigravity 1.2k+ skill library")
		.argument("<query>", "Keywords to search")
		.action(async (query) => {
			const { SkillHub } = require("../../src/utils/skill-hub");
			const hub = new SkillHub();
			const results = await hub.search(query);
			console.log(chalk.cyan(`\n--- ⛩️ [Aizen] Skill Search Results: "${query}" ---\n`));
			results.forEach((s) => {
				console.log(`${chalk.yellow(s.name)} - ${s.description}`);
				console.log(chalk.gray(`   ID: ${s.id} | Downloads: ${s.downloads}\n`));
			});
		});

	skillCmd
		.command("install")
		.description("Install a specific skill from the registry")
		.argument("<id>", "Skill ID to install")
		.action(async (id) => {
			const { SkillHub } = require("../../src/utils/skill-hub");
			const hub = new SkillHub();
			try {
				const res = await hub.install(id);
				console.log(chalk.green(`\n✔ Installed skill "${res.name}" into ${res.path}`));
			} catch (e) {
				console.error(chalk.red(`\n✖ Installation failed: ${e.message}`));
			}
		});

	skillCmd
		.command("add")
		.description("Create a new skill from documentation links")
		.argument("<links>", "Comma-separated documentation links")
		.action(async (links) => {
			const { runSkillCreator } = require("../../skill-creator/index");
			await runSkillCreator(process.cwd(), links.split(","));
		});

	skillCmd
		.command("create")
		.description("Bootstrap a new custom skill for your workspace")
		.argument("<name>", "Skill name")
		.action(async (name) => {
			const skillFile = path.join(process.cwd(), "aizen-gate/skills", `${name}.md`);
			const content = `# Skill: ${name}\n\n## Capability\n- Describe the skill here.\n\n## Usage\n- Example interaction here.`;
			await fs.ensureDir(path.dirname(skillFile));
			await fs.writeFile(skillFile, content);
			console.log(chalk.green(`\n✔ Custom skill "${name}" bootstrapped at ${skillFile}`));
		});
}

module.exports = { registerSkills };
