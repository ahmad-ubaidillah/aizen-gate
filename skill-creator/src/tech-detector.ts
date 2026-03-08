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
