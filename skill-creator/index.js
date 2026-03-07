const { scrapeUrl } = require("./src/scraper");
const { generateSkillPrompt } = require("./src/skill-generator");
const { detectStack } = require("./src/tech-detector");
const { mapCodebase } = require("./src/map-codebase");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Aizen-Gate Skill Creator Entry Point
 */
/**
 * Aizen-Gate Skill Creator Entry Point (v2.0)
 */
async function runSkillCreator(projectRoot, links) {
	const skillsDir = path.join(projectRoot, "aizen-gate", "skills", "custom");
	await fs.promises.mkdir(skillsDir, { recursive: true });

	for (const url of links) {
		console.log(`[SkillCreator] Processing knowledge from: ${url}`);
		const scrapedData = await scrapeUrl(url);
		if (!scrapedData || !scrapedData.title) continue;

		const skillId = scrapedData.title.toLowerCase().replace(/\s+/g, "-");
		const skillPath = path.join(skillsDir, `${skillId}.md`);
		const _prompt = generateSkillPrompt(scrapedData);

		// In local mode, we save the "Instruction" block as the skill
		// In production Aizen, it would call an LLM to refine this into a SKILL.md
		const skillDoc = `# Skill: ${scrapedData.title}\n\n## Source\n${url}\n\n## Patterns & Best Practices\n${scrapedData.text.slice(0, 1000)}...\n\n[AZ] This skill was auto-generated from documentation. Refer to sources for details.`;

		fs.writeFileSync(skillPath, skillDoc);
		console.log(`[SkillCreator] ✔ Generated skill profile: ${skillPath}`);
	}
}

async function autoGenerateSkills(projectRoot) {
	console.log(`[AZ] Scanning project dependencies for skill opportunities...`);
	const stack = await detectStack(projectRoot);
	const dependencies = stack.dependencies || [];

	// Example: only auto-generate for major libraries
	const shortlist = dependencies.filter((d) =>
		["express", "nestjs", "react", "vue", "django", "flask", "fastapi"].includes(d.toLowerCase()),
	);

	for (const dep of shortlist) {
		console.log(`[AZ] Auto-detecting skill for: ${dep}`);
		// Here we would call a search API to find the docs, then runSkillCreator
		// Mocking documentation search results for demonstration
		const docLinks = {
			express: ["https://expressjs.com/"],
			nestjs: ["https://docs.nestjs.com/"],
			react: ["https://react.dev/"],
		};

		if (docLinks[dep]) {
			await runSkillCreator(projectRoot, docLinks[dep]);
		}
	}
}

module.exports = { createSkill, runSkillCreator, autoGenerateSkills, detectStack, mapCodebase };
