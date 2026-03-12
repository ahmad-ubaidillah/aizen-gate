/**
 * Agent Resolver Utility
 * Supports both .md (Antigravity) and .yaml (legacy) agent formats
 */

import fs from "fs-extra";
import path from "node:path";

/**
 * Resolve agent file path by name
 * Checks for .md first (Antigravity), then .yaml (legacy)
 * @param projectRoot - Project root directory
 * @param agentName - Agent name (e.g., "pm", "developer", "debugger")
 * @returns Full path to agent file or null if not found
 */
export async function resolveAgentPath(projectRoot: string, agentName: string): Promise<string | null> {
	const agentsDir = path.join(projectRoot, "agents");

	// First check for .md (Antigravity format)
	const mdPath = path.join(agentsDir, `${agentName}.md`);
	if (await fs.pathExists(mdPath)) {
		return mdPath;
	}

	// Then check for .yaml (legacy format)
	const yamlPath = path.join(agentsDir, `${agentName}.agent.yaml`);
	if (await fs.pathExists(yamlPath)) {
		return yamlPath;
	}

	// Check in legacy directory
	const legacyPath = path.join(agentsDir, "legacy", `${agentName}.agent.yaml`);
	if (await fs.pathExists(legacyPath)) {
		return legacyPath;
	}

	return null;
}

/**
 * Get all available agents in the project
 * @param projectRoot - Project root directory
 * @returns Array of agent names (without extension)
 */
export async function listAvailableAgents(projectRoot: string): Promise<string[]> {
	const agentsDir = path.join(projectRoot, "agents");
	const agents: Set<string> = new Set();

	if (await fs.pathExists(agentsDir)) {
		const files = await fs.readdir(agentsDir);
		for (const file of files) {
			// Skip directories and non-agent files
			if (file === "legacy" || file === ".gitkeep") continue;

			// Extract agent name
			const name = file
				.replace(".md", "")
				.replace(".agent.yaml", "")
				.replace(".yaml", "");

			agents.add(name);
		}
	}

	return Array.from(agents).sort();
}

/**
 * Load agent metadata from file
 * Supports both .md (frontmatter) and .yaml formats
 * @param agentPath - Full path to agent file
 * @returns Agent metadata object
 */
export async function loadAgentMetadata(agentPath: string): Promise<AgentMetadata | null> {
	const ext = path.extname(agentPath).toLowerCase();

	if (ext === ".yaml") {
		return loadYamlAgent(agentPath);
	} else if (ext === ".md") {
		return loadMdAgent(agentPath);
	}

	return null;
}

interface AgentMetadata {
	name: string;
	title: string;
	description: string;
	capabilities: string[];
	format: "md" | "yaml";
	path: string;
}

/**
 * Load metadata from YAML agent file
 */
async function loadYamlAgent(agentPath: string): Promise<AgentMetadata | null> {
	try {
		const yaml = await import("js-yaml");
		const content = await fs.readFile(agentPath, "utf-8");
		const data = yaml.load(content) as any;

		return {
			name: data.agent?.metadata?.name || path.basename(agentPath, ".yaml"),
			title: data.agent?.metadata?.title || "",
			description: data.agent?.metadata?.capabilities || "",
			capabilities: (data.agent?.metadata?.capabilities || "").split(", ").map((s: string) => s.trim()),
			format: "yaml",
			path: agentPath,
		};
	} catch (error) {
		console.error(`Failed to load YAML agent: ${agentPath}`, error);
		return null;
	}
}

/**
 * Load metadata from MD agent file (via frontmatter)
 */
async function loadMdAgent(agentPath: string): Promise<AgentMetadata | null> {
	try {
		const grayMatter = await import("gray-matter");
		const content = await fs.readFile(agentPath, "utf-8");
		const { data } = grayMatter.default(content);

		return {
			name: data.name || path.basename(agentPath, ".md"),
			title: data.title || "",
			description: data.description || "",
			capabilities: data.skills?.split(",").map((s: string) => s.trim()) || [],
			format: "md",
			path: agentPath,
		};
	} catch (error) {
		console.error(`Failed to load MD agent: ${agentPath}`, error);
		return null;
	}
}

/**
 * Get agent content (full file content)
 * @param agentPath - Full path to agent file
 * @returns Agent content as string
 */
export async function getAgentContent(agentPath: string): Promise<string | null> {
	try {
		if (await fs.pathExists(agentPath)) {
			return await fs.readFile(agentPath, "utf-8");
		}
		return null;
	} catch (error) {
		console.error(`Failed to read agent: ${agentPath}`, error);
		return null;
	}
}

export default {
	resolveAgentPath,
	listAvailableAgents,
	loadAgentMetadata,
	getAgentContent,
};
