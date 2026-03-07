/**
 * Aizen-Gate Skill Generator
 * Internal logic for creating SKILL.md from raw documentation text.
 * Note: In the final app, this will be handled by the LLM.
 */
function generateSkillPrompt(scrapedData) {
	const { url, title, description, text } = scrapedData;

	return `
# INSTRUCTION: Generate a Aizen-Gate SKILL.md

You are the [SA] Skill Generator. Convert the following documentation into a standardized Aizen-Gate SKILL.md file.

## Source Information
- URL: ${url}
- Title: ${title}
- Description: ${description}

## Raw Documentation (Truncated)
${text.substring(0, 5000)}

---

## Output Requirements
1. **YAML Frontmatter**: Include name, description, authors (["Aizen-Gate Bot"]), status ("draft").
2. **Objective Section**: Clear goal of the skill.
3. **Roles Involved**: Identify which agents (e.g., [DEV], [ARCH]) use this.
4. **The Workflow**: Bulleted steps for implementation.
5. **Output Criteria**: What a success look like.
6. **Best Practices**: Extracted from the docs.
7. **Code Examples**: Include 1-2 key snippets if present in the text.
8. **Format**: Follow the Aizen-Gate SKILL.md standard.

Output the final Markdown ONLY.
`;
}

module.exports = { generateSkillPrompt };
