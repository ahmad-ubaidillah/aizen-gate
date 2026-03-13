/**
 * Aizen-Gate Skill Registry
 * Keyword-based skill activation system for Phase 6
 * Supports both code-based and file-based (markdown) skills
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import grayMatter from "gray-matter";

/**
 * Skill Interface
 * Defines the structure for a registered skill with keyword triggers
 */
export interface Skill {
	id: string;
	name: string;
	keywords: string[];
	description: string;
	agent_required: string[];
	category?: string;
	priority?: number;
}

/**
 * Detection Result
 * Contains detected skills and metadata
 */
export interface DetectionResult {
	skills: Skill[];
	triggered_keywords: string[];
	confidence: number;
}

/**
 * Skill Registry
 * Manages skill registration, keyword mapping, and auto-detection
 */
export class SkillRegistry {
	private skills: Map<string, Skill> = new Map();
	private keywordIndex: Map<string, Set<string>> = new Map();
	private initialized: boolean = false;

	constructor() {
		this.initializeDefaultSkills();
	}

	/**
	 * Initialize with project root - loads both default and file-based skills
	 * @param projectRoot - Root directory of the project
	 */
	async initialize(projectRoot: string): Promise<void> {
		if (this.initialized) return;
		this.initialized = true;

		// 1. Try global cache first (~/.aizen-gate/skills)
		const os = await import("node:os");
		const globalSkillsPath = path.join(os.homedir(), ".aizen-gate", "skills");

		if (fs.existsSync(globalSkillsPath)) {
			await this.loadSkillsFromDirectory(globalSkillsPath);
		} else {
			// 2. Fallback to project root if global not found
			const referenceSkillsPath = path.join(projectRoot, "skills-reference", "skills");
			if (fs.existsSync(referenceSkillsPath)) {
				await this.loadSkillsFromDirectory(referenceSkillsPath);
			}
		}
	}

	/**
	 * Initialize default skills with keyword mappings
	 */
	private initializeDefaultSkills(): void {
		const defaultSkills: Skill[] = [
			{
				id: "database-master",
				name: "Database Master",
				keywords: [
					"database",
					"schema",
					"migration",
					"sql",
					"db",
					"postgres",
					"mysql",
					"mongodb",
					"nosql",
					"query",
					"index",
					"table",
					"relationship",
					"orm",
				],
				description:
					"Expert in database design, schema management, migrations, and query optimization",
				agent_required: ["database-engineer"],
				category: "backend",
				priority: 10,
			},
			{
				id: "security-armor",
				name: "Security Armor",
				keywords: [
					"security",
					"vulnerability",
					"audit",
					"secure",
					"auth",
					"authentication",
					"authorization",
					"encryption",
					"pentest",
					"penetration",
					"threat",
					"xss",
					"csrf",
					"injection",
					"owasp",
				],
				description:
					"Security analysis, vulnerability assessment, penetration testing, and secure coding",
				agent_required: ["security"],
				category: "security",
				priority: 10,
			},
			{
				id: "testing-master",
				name: "Testing Master",
				keywords: [
					"test",
					"testing",
					"qa",
					"unit",
					"integration",
					"e2e",
					"coverage",
					"mock",
					"stub",
					"assertion",
					"jest",
					"vitest",
					"playwright",
					"cypress",
					"mocha",
					"junit",
				],
				description:
					"Comprehensive testing strategies including unit, integration, and end-to-end testing",
				agent_required: ["qa"],
				category: "quality",
				priority: 10,
			},
			{
				id: "api-standards",
				name: "API Standards",
				keywords: [
					"api",
					"rest",
					"endpoint",
					"graphql",
					"http",
					"request",
					"response",
					"json",
					"xml",
					"webhook",
					"crud",
					"restful",
					"openapi",
					"swagger",
				],
				description: "API design, RESTful conventions, GraphQL, and HTTP protocol best practices",
				agent_required: ["developer", "architect"],
				category: "backend",
				priority: 8,
			},
			{
				id: "vitals-templates",
				name: "Performance Vitals",
				keywords: [
					"performance",
					"optimize",
					"speed",
					"latency",
					"benchmark",
					"profiling",
					"cache",
					"bundle",
					"load-time",
					"fps",
					"memory",
					"cpu",
					"heap",
				],
				description: "Performance optimization, benchmarking, profiling, and speed improvements",
				agent_required: ["developer", "analyst"],
				category: "performance",
				priority: 8,
			},
			{
				id: "ui-ux-pro-max",
				name: "UI/UX Pro Max",
				keywords: [
					"design",
					"ui",
					"ux",
					"interface",
					"layout",
					"component",
					"responsive",
					"accessibility",
					"a11y",
					"animation",
					"css",
					"style",
					"theme",
					"design-system",
				],
				description:
					"User interface design, UX best practices, responsive layouts, and design systems",
				agent_required: ["designer"],
				category: "frontend",
				priority: 9,
			},
			{
				id: "devops-guru",
				name: "DevOps Guru",
				keywords: [
					"deploy",
					"deployment",
					"ci",
					"cd",
					"pipeline",
					"docker",
					"kubernetes",
					"k8s",
					"cloud",
					"infrastructure",
					"terraform",
					"ansible",
					"jenkins",
					"github-actions",
					"aws",
					"gcp",
					"azure",
				],
				description:
					"CI/CD pipelines, containerization, cloud infrastructure, and deployment automation",
				agent_required: ["devops"],
				category: "devops",
				priority: 9,
			},
			{
				id: "architect-pro",
				name: "Architect Pro",
				keywords: [
					"architecture",
					"design-pattern",
					"microservice",
					"monolith",
					"scalability",
					"system-design",
					"high-level",
					"abstraction",
					"interface",
					"coupling",
					"cohesion",
				],
				description:
					"System architecture, design patterns, microservices, and high-level system design",
				agent_required: ["architect"],
				category: "architecture",
				priority: 9,
			},
			{
				id: "pm-track",
				name: "PM Track",
				keywords: [
					"project",
					"planning",
					"roadmap",
					"sprint",
					"backlog",
					"task",
					"story",
					"ticket",
					"agile",
					"scrum",
					"kanban",
					"milestone",
					"deadline",
					"priority",
				],
				description: "Project management, sprint planning, backlog grooming, and agile methodology",
				agent_required: ["pm", "scrum-master"],
				category: "management",
				priority: 7,
			},
			{
				id: "analyst-pro",
				name: "Analyst Pro",
				keywords: [
					"analyze",
					"analysis",
					"data",
					"metrics",
					"report",
					"insight",
					"research",
					"investigation",
					"debug",
					"diagnose",
					"root-cause",
					"pattern",
				],
				description: "Data analysis, metrics reporting, research, and root cause analysis",
				agent_required: ["analyst"],
				category: "analysis",
				priority: 7,
			},
			{
				id: "quick-flow",
				name: "Quick Flow",
				keywords: [
					"quick",
					"fast",
					"simple",
					"prototype",
					"demo",
					"temp",
					"stub",
					"quick-fix",
					"hotfix",
				],
				description: "Quick prototyping, fast demos, and rapid development for temporary solutions",
				agent_required: ["quick-flow"],
				category: "utility",
				priority: 5,
			},
		];

		defaultSkills.forEach((skill) => this.registerSkill(skill));
	}

	/**
	 * Register a new skill
	 * @param skill - The skill to register
	 */
	registerSkill(skill: Skill): void {
		// Validate skill
		if (!skill.id || !skill.name || !skill.keywords || skill.keywords.length === 0) {
			throw new Error(`Invalid skill: ${JSON.stringify(skill)}`);
		}

		// Check for duplicate
		if (this.skills.has(skill.id)) {
			console.log(
				chalk.yellow(`[SkillRegistry] Skill "${skill.id}" already registered, updating...`),
			);
		}

		// Store skill
		this.skills.set(skill.id, skill);

		// Build keyword index
		skill.keywords.forEach((keyword) => {
			const normalizedKeyword = keyword.toLowerCase();
			if (!this.keywordIndex.has(normalizedKeyword)) {
				this.keywordIndex.set(normalizedKeyword, new Set());
			}
			this.keywordIndex.get(normalizedKeyword)?.add(skill.id);
		});

		console.log(chalk.green(`[SkillRegistry] Registered skill: ${skill.name} (${skill.id})`));
	}

	/**
	 * Find skills matching a specific keyword
	 * @param keyword - The keyword to search for
	 * @returns Array of matching skills
	 */
	findSkillByKeyword(keyword: string): Skill[] {
		const normalizedKeyword = keyword.toLowerCase();
		const skillIds = this.keywordIndex.get(normalizedKeyword);

		if (!skillIds) {
			return [];
		}

		return Array.from(skillIds)
			.map((id) => this.skills.get(id))
			.filter((skill): skill is Skill => skill !== undefined);
	}

	/**
	 * Auto-detect skills from user input
	 * @param input - The user input string
	 * @returns Detection result with matched skills
	 */
	detectSkillsInInput(input: string, projectRoot?: string): DetectionResult {
		// Auto-initialize if projectRoot provided and not yet initialized
		if (projectRoot && !this.initialized) {
			this.initialize(projectRoot); // Fire and forget, won't block
		}
		const normalizedInput = input.toLowerCase();
		const words = normalizedInput.split(/\s+/);
		const triggered_keywords: Set<string> = new Set();
		const matchedSkills: Map<string, Skill> = new Map();

		// Check each word and keyword for matches
		words.forEach((word) => {
			// Direct keyword match
			if (this.keywordIndex.has(word)) {
				const skillIds = this.keywordIndex.get(word)!;
				skillIds.forEach((id) => {
					if (!matchedSkills.has(id)) {
						const skill = this.skills.get(id);
						if (skill) matchedSkills.set(id, skill);
					}
					triggered_keywords.add(word);
				});
			}

			// Partial match (keyword contains the word or word contains keyword)
			this.keywordIndex.forEach((skillIds, keyword) => {
				if (keyword.includes(word) || word.includes(keyword)) {
					skillIds.forEach((id) => {
						if (!matchedSkills.has(id)) {
							const skill = this.skills.get(id);
							if (skill) matchedSkills.set(id, skill);
						}
						triggered_keywords.add(keyword);
					});
				}
			});
		});

		// Also check for multi-word keyword phrases in input
		this.skills.forEach((skill) => {
			skill.keywords.forEach((keyword) => {
				if (keyword.includes(" ") && normalizedInput.includes(keyword)) {
					if (!matchedSkills.has(skill.id)) {
						matchedSkills.set(skill.id, skill);
					}
					triggered_keywords.add(keyword);
				}
			});
		});

		// Sort by priority
		const skills = Array.from(matchedSkills.values()).sort(
			(a, b) => (b.priority || 0) - (a.priority || 0),
		);

		// Calculate confidence based on keyword coverage
		const confidence =
			skills.length > 0
				? Math.min(1, triggered_keywords.size / Math.max(1, skills[0].keywords.length))
				: 0;

		return {
			skills,
			triggered_keywords: Array.from(triggered_keywords),
			confidence,
		};
	}

	/**
	 * Get skill by ID
	 * @param id - The skill ID
	 * @returns The skill or undefined if not found
	 */
	getSkillById(id: string): Skill | undefined {
		return this.skills.get(id);
	}

	/**
	 * List all registered skills
	 * @returns Array of all registered skills
	 */
	listAllSkills(): Skill[] {
		return Array.from(this.skills.values());
	}

	/**
	 * Get skills by category
	 * @param category - The category to filter by
	 * @returns Array of skills in the category
	 */
	getSkillsByCategory(category: string): Skill[] {
		return Array.from(this.skills.values()).filter(
			(skill) => skill.category?.toLowerCase() === category.toLowerCase(),
		);
	}

	/**
	 * Get required agents for detected skills
	 * @param skills - Array of skills
	 * @returns Unique array of required agent IDs
	 */
	getRequiredAgents(skills: Skill[]): string[] {
		const agents = new Set<string>();
		skills.forEach((skill) => {
			skill.agent_required.forEach((agent) => agents.add(agent));
		});
		return Array.from(agents);
	}

	/**
	 * Print skill registry status
	 */
	printStatus(): void {
		console.log(chalk.cyan("\n=== Skill Registry Status ===\n"));
		console.log(chalk.white(`Total Skills: ${this.skills.size}`));
		console.log(chalk.white(`Total Keywords Indexed: ${this.keywordIndex.size}\n`));

		console.log(chalk.yellow("Categories:"));
		const categories = new Set<string>();
		this.skills.forEach((skill) => {
			if (skill.category) categories.add(skill.category);
		});
		categories.forEach((cat) => {
			const count = this.getSkillsByCategory(cat).length;
			console.log(chalk.gray(`  - ${cat}: ${count} skills`));
		});

		console.log(chalk.yellow("\nRegistered Skills:"));
		this.listAllSkills().forEach((skill) => {
			console.log(chalk.green(`  • ${skill.name} (${skill.id})`));
			console.log(
				chalk.gray(
					`    Keywords: ${skill.keywords.slice(0, 5).join(", ")}${skill.keywords.length > 5 ? "..." : ""}`,
				),
			);
		});
		console.log("");
	}

	/**
	 * Load skills from markdown files in a directory
	 * Looks for SKILL.md files with frontmatter containing metadata
	 * @param skillsDir - Path to directory containing skill folders
	 * @returns Number of skills loaded
	 */
	async loadSkillsFromDirectory(skillsDir: string): Promise<number> {
		if (!fs.existsSync(skillsDir)) {
			console.log(chalk.yellow(`[SkillRegistry] Skills directory not found: ${skillsDir}`));
			return 0;
		}

		const entries = await fsPromises.readdir(skillsDir, { withFileTypes: true });
		let loadedCount = 0;

		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			const skillPath = path.join(skillsDir, entry.name, "SKILL.md");
			if (!fs.existsSync(skillPath)) continue;

			try {
				const content = await fsPromises.readFile(skillPath, "utf-8");
				const { data, content: markdown } = grayMatter(content);

				// Extract metadata from frontmatter
				const name = data.name || entry.name;
				const description = data.description || this.generateDescription(markdown);
				const category = data.category || this.inferCategory(entry.name);

				// Use provided keywords or generate from name/description
				let keywords: string[] = [];
				if (data.keywords && Array.isArray(data.keywords)) {
					keywords = data.keywords;
				} else if (data.keywords && typeof data.keywords === "string") {
					keywords = data.keywords.split(",").map((k: string) => k.trim());
				} else {
					keywords = this.generateKeywords(name, description);
				}

				// Create skill object
				const skill: Skill = {
					id: entry.name,
					name: name,
					keywords: keywords,
					description: description,
					agent_required: data.agents || data.agent_required || ["developer"],
					category: category,
					priority: data.priority || 5,
				};

				// Register the skill
				this.registerSkill(skill);
				loadedCount++;
			} catch (error) {
				console.log(
					chalk.red(
						`[SkillRegistry] Failed to load skill "${entry.name}": ${(error as Error).message}`,
					),
				);
			}
		}

		console.log(chalk.green(`[SkillRegistry] Loaded ${loadedCount} skills from ${skillsDir}`));
		return loadedCount;
	}

	/**
	 * Generate description from markdown content
	 */
	private generateDescription(markdown: string): string {
		const lines = markdown.split("\n").filter((line) => line.trim() && !line.startsWith("#"));
		return lines[0]?.substring(0, 200) || "Auto-generated skill from markdown";
	}

	/**
	 * Infer category from skill name
	 */
	private inferCategory(skillName: string): string {
		const name = skillName.toLowerCase();
		if (name.includes("database") || name.includes("db")) return "database";
		if (name.includes("security") || name.includes("audit")) return "security";
		if (name.includes("test") || name.includes("qa")) return "testing";
		if (name.includes("api") || name.includes("rest")) return "api";
		if (name.includes("deploy") || name.includes("devops") || name.includes("ci")) return "devops";
		if (name.includes("ui") || name.includes("ux") || name.includes("design")) return "frontend";
		if (name.includes("performance") || name.includes("optim")) return "performance";
		if (name.includes("architect") || name.includes("architecture")) return "architecture";
		return "general";
	}

	/**
	 * Generate keywords from name and description
	 */
	/**
	 * Generate keywords from name and description
	 */
	private generateKeywords(name: string, description: string): string[] {
		const text = `${name} ${description}`.toLowerCase();
		const words = text.split(/[\s,\-_]+/).filter((word) => word.length > 2);
		const stopWords = ["the", "and", "for", "with", "from", "that", "this", "have", "will", "your"];
		return [...new Set(words.filter((w) => !stopWords.includes(w)))].slice(0, 15);
	}

	/**
	 * [Phase 9] Autonomous Skill Auto-Healing
	 * Analyzes a broken skill and attempts to refactor its keywords/description
	 * based on actual usage patterns (fragments).
	 */
	async selfHealingSkill(
		skillId: string,
		fragments: { content: string; vector: any }[],
	): Promise<boolean> {
		const skill = this.skills.get(skillId);
		if (!skill) return false;

		console.log(
			chalk.yellow(
				`[Auto-Healing] Attempting to refactor broken skill: ${skill.name} (${skillId})`,
			),
		);

		const { localEmbedding } = await import("../memory/local-embed.js");
		const synthesis = localEmbedding.synthesize(fragments);

		// Propose new keywords from synthesis
		const newKeywords = Array.from(new Set([...skill.keywords, ...synthesis.unifiedVector])).slice(
			0,
			20,
		);

		const updatedSkill: Skill = {
			...skill,
			keywords: newKeywords,
			description: `${skill.description} (Auto-Healed: ${new Date().toISOString()})`,
		};

		this.registerSkill(updatedSkill);
		console.log(
			chalk.green(
				`[Auto-Healing] Skill ${skillId} updated with ${newKeywords.length} stabilized keywords.`,
			),
		);

		return true;
	}
}

// Export singleton instance
export const skillRegistry = new SkillRegistry();

// Auto-detection helper for use in orchestration
export function detectAndActivateSkills(input: string, projectRoot?: string): DetectionResult {
	const result = skillRegistry.detectSkillsInInput(input, projectRoot);

	if (result.skills.length > 0) {
		console.log(
			chalk.cyan(`\n⛩️ [SkillRegistry] Detected ${result.skills.length} skill(s) from input`),
		);
		console.log(chalk.gray(`   Triggered keywords: ${result.triggered_keywords.join(", ")}`));
		result.skills.forEach((skill) => {
			console.log(
				chalk.green(`   → Activating: ${skill.name} (${skill.agent_required.join(", ")})`),
			);
		});
	}

	return result;
}

/**
 * Initialize skill registry with default and file-based skills
 * @param projectRoot - Root directory of the project
 */
export async function initializeSkillRegistry(projectRoot: string): Promise<SkillRegistry> {
	const registry = new SkillRegistry();

	// Load skills from aizen-gate/skills-reference/skills directory
	await registry.initialize(projectRoot);

	// Also check legacy reference/skills path for backward compatibility
	const legacyPath = path.join(projectRoot, "reference", "skills");
	const loaded = await registry.loadSkillsFromDirectory(legacyPath);

	if (loaded > 0) {
		console.log(chalk.cyan(`[SkillRegistry] Loaded ${loaded} skills from legacy reference/skills`));
	}

	return registry;
}

export default SkillRegistry;
