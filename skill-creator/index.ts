import fs from "node:fs";
import path from "node:path";
import { mapCodebase } from "./src/map-codebase.js";
import { scrapeUrl } from "./src/scraper.js";
import { generateSkillPrompt } from "./src/skill-generator.js";
import { detectStack } from "./src/tech-detector.js";

/**
 * Aizen-Gate Skill Creator Entry Point (v2.0)
 */
export async function runSkillCreator(projectRoot: string, links: string[]): Promise<void> {
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

export async function autoGenerateSkills(projectRoot: string): Promise<void> {
	console.log("[AZ] Scanning project dependencies for skill opportunities...");
	const stack = await detectStack(projectRoot);
	const dependencies = stack.libraries || [];

	// Example: only auto-generate for major libraries
	const shortlist = dependencies.filter((d: string) =>
		["express", "nestjs", "react", "vue", "django", "flask", "fastapi"].includes(d.toLowerCase()),
	);

	for (const dep of shortlist) {
		console.log(`[AZ] Auto-detecting skill for: ${dep}`);
		// Here we would call a search API to find the docs, then runSkillCreator
		// Mocking documentation search results for demonstration
		const docLinks: Record<string, string[]> = {
			express: ["https://expressjs.com/"],
			nestjs: ["https://docs.nestjs.com/"],
			react: ["https://react.dev/"],
		};

		if (docLinks[dep]) {
			await runSkillCreator(projectRoot, docLinks[dep]);
		}
	}
}

export { detectStack, mapCodebase };
