const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * Aizen-Gate Plugin Manager
 * Installs community skills/plugins from URLs or registries.
 */
async function installSkill(projectRoot, skillNameOrUrl) {
	console.log(chalk.blue.bold(`\n--- [SA] Installing Skill: ${skillNameOrUrl} ---\n`));

	let rawUrl = "";
	let skillPathName = "";

	// Simple resolution logic: If URL, use directly. If name, assume GitHub default org pattern.
	if (skillNameOrUrl.startsWith("http")) {
		rawUrl = skillNameOrUrl;
		// Try to infer name from URL (e.g., https://raw.githubusercontent.com/.../my-skill/SKILL.md)
		const parts = rawUrl.split("/");
		skillPathName = parts[parts.length - 2] || "custom-skill";
	} else {
		// e.g. "superagent-awesome-skills/marketing/seo"
		// This is a dummy registry mapping for proof of concept
		const registryBase = "https://raw.githubusercontent.com/aizen-gate/awesome-skills/main/skills";
		rawUrl = `${registryBase}/${skillNameOrUrl}/SKILL.md`;
		skillPathName = skillNameOrUrl.split("/").pop();
	}

	try {
		console.log(chalk.cyan(`Fetching from ${rawUrl}...`));

		// Dynamically fetch using native fetch API (Node 18+)
		const response = await fetch(rawUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch skill: ${response.status} ${response.statusText}`);
		}

		const skillMarkdown = await response.text();

		// Ensure SKILL.md actually looks like a skill (has name/description yaml)
		if (!skillMarkdown.includes("name:") && !skillMarkdown.includes("description:")) {
			console.log(
				chalk.yellow(
					`[Warning] The fetched file does not contain standard SKILL yaml frontmatter. Saving anyway.`,
				),
			);
		}

		// Determine destination: aizen-gate/skills/community/<skillPathName>/SKILL.md
		const destDir = path.join(projectRoot, "aizen-gate", "skills", "community", skillPathName);
		await fs.ensureDir(destDir);

		const destPath = path.join(destDir, "SKILL.md");
		await fs.writeFile(destPath, skillMarkdown);

		console.log(chalk.green(`\n✔ Skill successfully installed to: ${destPath}`));
		console.log(`Agents can now utilize this skill when resolving tasks.`);

		return { success: true, path: destPath };
	} catch (err) {
		console.error(chalk.red(`\n✖ Skill installation failed: ${err.message}`));
		return { success: false, error: err.message };
	}
}

module.exports = { installSkill };
