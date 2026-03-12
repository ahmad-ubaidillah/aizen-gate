import fs from "node:fs";
import path from "node:path";

export interface TechStack {
	languages: string[];
	frameworks: string[];
	databases: string[];
	libraries: string[];
	tools: string[];
}

/**
 * Agent mapping based on tech stack
 */
export const AGENT_MAPPING: Record<string, string[]> = {
	// Languages
	"JavaScript/TypeScript": ["developer", "frontend", "backend"],
	Python: ["developer", "data-engineer"],
	Go: ["developer", "backend", "devops"],
	Rust: ["developer", "backend", "security"],
	Java: ["developer", "backend"],
	PHP: ["developer", "backend"],

	// Frameworks
	React: ["frontend", "developer"],
	Nextjs: ["frontend", "backend", "developer"],
	Nuxt: ["frontend", "developer"],
	Vue: ["frontend", "developer"],
	Angular: ["frontend", "developer"],
	Svelte: ["frontend", "developer"],
	Express: ["backend", "developer"],
	Fastify: ["backend", "developer"],
	NestJS: ["backend", "developer", "architect"],
	Django: ["backend", "developer"],
	Flask: ["backend", "developer"],
	FastAPI: ["backend", "developer"],

	// Databases
	PostgreSQL: ["database-engineer"],
	MySQL: ["database-engineer"],
	MongoDB: ["database-engineer"],
	"MongoDB/Mongoose": ["database-engineer"],
	Redis: ["database-engineer", "devops"],
	Prisma: ["database-engineer", "developer"],
	SQLAlchemy: ["database-engineer", "developer"],

	// DevOps
	Docker: ["devops"],
	Kubernetes: ["devops"],
	AWS: ["devops", "architect"],
	GCP: ["devops", "architect"],
	Azure: ["devops", "architect"],

	// Security-sensitive
	Stripe: ["developer", "security"],
	Firebase: ["developer", "security"],
	Auth0: ["developer", "security"],

	// Testing
	Jest: ["qa"],
	Vitest: ["qa"],
	Playwright: ["qa"],
	Cypress: ["qa"],
};

/**
 * Aizen-Gate Tech Detector
 * Reads project files to identify the tech stack.
 */
export function detectStack(projectRoot: string): TechStack {
	const stack: TechStack = {
		languages: [],
		frameworks: [],
		databases: [],
		libraries: [],
		tools: [],
	};

	// 1. Detect from package.json (Node.js)
	const packageJsonPath = path.join(projectRoot, "package.json");
	if (fs.existsSync(packageJsonPath)) {
		try {
			const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
			const deps = { ...pkg.dependencies, ...pkg.devDependencies };

			stack.languages.push("JavaScript/TypeScript");

			if (deps.next) stack.frameworks.push("Next.js");
			if (deps.react) stack.frameworks.push("React");
			if (deps.express) stack.frameworks.push("Express");
			if (deps.prisma) stack.databases.push("Prisma (ORM)");
			if (deps.mongoose) stack.databases.push("MongoDB/Mongoose");
			if (deps["@stripe/stripe-js"]) stack.libraries.push("Stripe");
			if (deps.tailwindcss) stack.tools.push("Tailwind CSS");
		} catch (e) {
			console.warn(`[TechDetector] Failed to parse package.json: ${(e as Error).message}`);
		}
	}

	// 2. Detect from requirements.txt (Python)
	const requirementsPath = path.join(projectRoot, "requirements.txt");
	if (fs.existsSync(requirementsPath)) {
		const reqs = fs.readFileSync(requirementsPath, "utf8");
		stack.languages.push("Python");
		if (reqs.includes("Django")) stack.frameworks.push("Django");
		if (reqs.includes("Flask")) stack.frameworks.push("Flask");
		if (reqs.includes("fastapi")) stack.frameworks.push("FastAPI");
		if (reqs.includes("sqlalchemy")) stack.databases.push("SQLAlchemy");
	}

	// 3. Detect from file extensions
	const files = fs.readdirSync(projectRoot);
	if (files.some((f) => f.endsWith(".go"))) stack.languages.push("Go");
	if (files.some((f) => f.endsWith(".rs"))) stack.languages.push("Rust");
	if (files.some((f) => f.endsWith(".php"))) stack.languages.push("PHP");

	// Deduplicate and return
	return {
		languages: [...new Set(stack.languages)],
		frameworks: [...new Set(stack.frameworks)],
		databases: [...new Set(stack.databases)],
		libraries: [...new Set(stack.libraries)],
		tools: [...new Set(stack.tools)],
	};
}

/**
 * Detect which agents should be activated based on tech stack
 * @param stack - The detected tech stack
 * @returns Array of agent IDs to activate
 */
export function detectAgentsFromStack(stack: TechStack): string[] {
	const agents = new Set<string>();

	// Add default agents
	agents.add("developer");

	// Check languages
	for (const lang of stack.languages) {
		const langAgents = AGENT_MAPPING[lang];
		if (langAgents) langAgents.forEach((a) => agents.add(a));
	}

	// Check frameworks
	for (const fw of stack.frameworks) {
		const fwAgents = AGENT_MAPPING[fw];
		if (fwAgents) fwAgents.forEach((a) => agents.add(a));
	}

	// Check databases
	for (const db of stack.databases) {
		const dbAgents = AGENT_MAPPING[db];
		if (dbAgents) dbAgents.forEach((a) => agents.add(a));
	}

	// Check libraries
	for (const lib of stack.libraries) {
		const libAgents = AGENT_MAPPING[lib];
		if (libAgents) libAgents.forEach((a) => agents.add(a));
	}

	// Check tools
	for (const tool of stack.tools) {
		const toolAgents = AGENT_MAPPING[tool];
		if (toolAgents) toolAgents.forEach((a) => agents.add(a));
	}

	return Array.from(agents);
}
