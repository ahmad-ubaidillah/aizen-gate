import fs from "node:fs";
import path from "node:path";

/**
 * AI Platform/IDE Detector
 * Identifies which AI assistant platform the user is likely using.
 */

export interface PlatformInfo {
	id: string;
	name: string;
	icon: string;
	type: "cli" | "ide" | "extension" | "web" | "agent" | "other";
}

export interface PlatformConfig {
	files: string[];
	command: string;
}

export function detectPlatform(): string {
	// Priority order: Check most specific indicators first

	// 1. Claude Code (official Anthropic CLI)
	if (
		process.env.CLAUDE_CODE_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".claudecode")) ||
		fs.existsSync(path.join(process.cwd(), "CLAUDE.md"))
	) {
		return "claude-code";
	}

	// 2. Cursor (AI-first code editor)
	if (
		process.env.CURSOR_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".cursor")) ||
		fs.existsSync(path.join(process.cwd(), ".cursorrules"))
	) {
		return "cursor";
	}

	// 3. Windsurf (by Codeium)
	if (
		process.env.WINDSURF_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".windsurf")) ||
		fs.existsSync(path.join(process.cwd(), ".windsurfrc"))
	) {
		return "windsurf";
	}

	// 4. Kiro (new AI IDE)
	if (
		process.env.KIRO_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".kiro")) ||
		fs.existsSync(path.join(process.cwd(), ".kiro/config.md"))
	) {
		return "kiro";
	}

	// 5. Kilo (by Kiro team)
	if (
		process.env.KILO_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".kilo")) ||
		fs.existsSync(path.join(process.cwd(), ".kilo/config.md"))
	) {
		return "kilo";
	}

	// 6. OpenCode (open source AI IDE)
	if (
		process.env.OPENCODE_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".opencode")) ||
		fs.existsSync(path.join(process.cwd(), ".opencode/config.md"))
	) {
		return "opencode";
	}

	// 7. Zed (AI-powered code editor)
	if (
		process.env.ZED_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".zed")) ||
		fs.existsSync(path.join(process.cwd(), "zed.toml"))
	) {
		return "zed";
	}

	// 8. Gemini CLI / Antigravity
	if (
		process.env.GEMINI_HOME ||
		process.env.GEMINI_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".gemini")) ||
		fs.existsSync(path.join(process.cwd(), "GEMINI.md"))
	) {
		return "antigravity";
	}

	// 9. GitHub Copilot
	if (
		process.env.GITHUB_COPILOT_CMD ||
		fs.existsSync(path.join(process.cwd(), ".github/copilot-instructions.md")) ||
		fs.existsSync(path.join(process.cwd(), ".copilot"))
	) {
		return "copilot";
	}

	// 10. Cline (VSCode extension - formerly Claude Dev)
	if (
		process.env.CLINE_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".cline")) ||
		fs.existsSync(path.join(process.cwd(), ".claude/settings.json"))
	) {
		return "cline";
	}

	// 11. Bolt.new (AI webapp builder)
	if (
		process.env.BOLT_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".bolt")) ||
		fs.existsSync(path.join(process.cwd(), ".bolt/config"))
	) {
		return "bolt";
	}

	// 12. Lovable (AI webapp builder)
	if (
		process.env.LOVABLE_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".lovable")) ||
		fs.existsSync(path.join(process.cwd(), "lovable.config"))
	) {
		return "lovable";
	}

	// 13. Devin (AI software engineer by Cognition)
	if (process.env.DEVIN_VERSION || fs.existsSync(path.join(process.cwd(), ".devin"))) {
		return "devin";
	}

	// 14. OpenDevin (open source Devin alternative)
	if (
		process.env.OPENDEVIN_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".opendevin")) ||
		fs.existsSync(path.join(process.cwd(), "opendevin.conf"))
	) {
		return "opendevin";
	}

	// 15. Continue (VSCode/JetBrains extension)
	if (
		process.env.CONTINUE_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".continue")) ||
		fs.existsSync(path.join(process.cwd(), "continue_config.json"))
	) {
		return "continue";
	}

	// 16. Augment (AI coding assistant)
	if (
		process.env.AUGMENT_VERSION ||
		fs.existsSync(path.join(process.cwd(), ".augment")) ||
		fs.existsSync(path.join(process.cwd(), ".augmentrc"))
	) {
		return "augment";
	}

	// 17. Codeium ( Windsurf is based on it, but check for standalone)
	if (process.env.CODEIUM_VERSION || fs.existsSync(path.join(process.cwd(), ".codeium"))) {
		return "codeium";
	}

	// 18. Tabnine
	if (process.env.TABNINE_VERSION || fs.existsSync(path.join(process.cwd(), ".tabnine"))) {
		return "tabnine";
	}

	// Default to Generic
	return "generic";
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): PlatformInfo[] {
	return [
		{ id: "claude-code", name: "Claude Code", icon: "🤖", type: "cli" },
		{ id: "cursor", name: "Cursor", icon: "💻", type: "ide" },
		{ id: "windsurf", name: "Windsurf", icon: "🌊", type: "ide" },
		{ id: "kiro", name: "Kiro", icon: "⚡", type: "ide" },
		{ id: "kilo", name: "Kilo", icon: "⚡", type: "ide" },
		{ id: "opencode", name: "OpenCode", icon: "📦", type: "ide" },
		{ id: "zed", name: "Zed", icon: "⚔️", type: "ide" },
		{ id: "antigravity", name: "Gemini CLI", icon: "🌌", type: "cli" },
		{ id: "copilot", name: "GitHub Copilot", icon: "🧑‍💻", type: "extension" },
		{ id: "cline", name: "Cline", icon: "🤖", type: "extension" },
		{ id: "bolt", name: "Bolt.new", icon: "🔩", type: "web" },
		{ id: "lovable", name: "Lovable", icon: "❤️", type: "web" },
		{ id: "devin", name: "Devin", icon: "🧠", type: "agent" },
		{ id: "opendevin", name: "OpenDevin", icon: "🔓", type: "agent" },
		{ id: "continue", name: "Continue", icon: "▶️", type: "extension" },
		{ id: "augment", name: "Augment", icon: "📈", type: "extension" },
		{ id: "codeium", name: "Codeium", icon: "💯", type: "extension" },
		{ id: "tabnine", name: "Tabnine", icon: "🔢", type: "extension" },
		{ id: "generic", name: "Generic/Other", icon: "📋", type: "other" },
	];
}

/**
 * Get platform-specific file paths for injection
 */
export function getPlatformConfig(platform: string): PlatformConfig {
	const configs: Record<string, PlatformConfig> = {
		"claude-code": {
			files: ["CLAUDE.md"],
			command: "npx aizen-gate",
		},
		cursor: {
			files: [".cursorrules"],
			command: "npx aizen-gate",
		},
		windsurf: {
			files: [".windsurf/rules/rules.md"],
			command: "npx aizen-gate",
		},
		kiro: {
			files: [".kiro/config.md"],
			command: "npx aizen-gate",
		},
		kilo: {
			files: [".kilo/config.md"],
			command: "npx aizen-gate",
		},
		opencode: {
			files: [".agents/config.md"],
			command: "npx aizen-gate",
		},
		zed: {
			files: [".zed/settings.json"],
			command: "npx aizen-gate",
		},
		antigravity: {
			files: ["GEMINI.md"],
			command: "npx aizen-gate",
		},
		copilot: {
			files: [".github/copilot-instructions.md"],
			command: "npx aizen-gate",
		},
		cline: {
			files: [".claude/settings.json"],
			command: "npx aizen-gate",
		},
		bolt: {
			files: [".bolt/config"],
			command: "npx aizen-gate",
		},
		lovable: {
			files: ["lovable.config"],
			command: "npx aizen-gate",
		},
		devin: {
			files: [".devin/config.md"],
			command: "npx aizen-gate",
		},
		opendevin: {
			files: ["opendevin.conf"],
			command: "npx aizen-gate",
		},
		continue: {
			files: ["continue_config.json"],
			command: "npx aizen-gate",
		},
		augment: {
			files: [".augmentrc"],
			command: "npx aizen-gate",
		},
		codeium: {
			files: [".codeium/config.json"],
			command: "npx aizen-gate",
		},
		tabnine: {
			files: [".tabnine/config.json"],
			command: "npx aizen-gate",
		},
		generic: {
			files: ["AGENTS.md", "CLAUDE.md"],
			command: "npx aizen-gate",
		},
	};

	return configs[platform] || configs.generic;
}
