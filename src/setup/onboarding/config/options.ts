/**
 * Onboarding Configuration
 * Contains all dropdown options and prompts for the onboarding wizard
 */

export interface Option {
	label: string;
	value: string;
	description: string;
	details?: string;
}

export const IDE_OPTIONS: Option[] = [
	{ label: "🖥️ VSCode", value: "vscode", description: "Visual Studio Code" },
	{ label: "💻 VSCode Insiders", value: "vscode-insiders", description: "VSCode Insiders" },
	{ label: "🔵 Cursor", value: "cursor", description: "AI-first code editor" },
	{ label: "🐙 GitHub Codespaces", value: "codespaces", description: "Cloud development" },
	{ label: "💨 Windsurf", value: "windsurf", description: "Codeium's IDE" },
	{ label: "⌨️ CLI (Terminal)", value: "cli", description: "Command line only" },
	{ label: "🔄 Other", value: "other", description: "Custom setup" },
];

export const DEV_TYPE_OPTIONS: Option[] = [
	{
		label: "⚡ Ideation & Exploration",
		value: "fast",
		description: "Quick iterations, rapid prototyping, minimal docs",
		details: "Best for brainstorming • Fast feedback loops • Token-efficient",
	},
	{
		label: "🐢 MVP Builder",
		value: "medium",
		description: "Balance between speed and quality",
		details: "Standard documentation • Basic testing • Clear milestones",
	},
	{
		label: "🏗️ Enterprise Platform",
		value: "slow",
		description: "Full SDLC, comprehensive testing & documentation",
		details: "Enterprise-grade • Full test coverage • Complete documentation",
	},
];

// ==================== NEW: Installation & Setup Options ====================

/**
 * Module/Installation Type Options
 * Improved UX writing for development pace selection
 */
export const MODULE_OPTIONS: Option[] = [
	{
		label: "⚡ Ideation Mode",
		value: "ideation",
		description: "Quick brainstorming & prototyping",
		details: "Perfect for exploring ideas • Minimal setup • Fast iteration",
	},
	{
		label: "🚀 MVP Mode",
		value: "mvp",
		description: "Build a minimum viable product",
		details: "Core features only • Balanced speed & quality • Quick to market",
	},
	{
		label: "🏢 Enterprise Mode",
		value: "enterprise",
		description: "Full-featured production application",
		details: "Complete SDLC • Comprehensive testing • Full documentation",
	},
];

/**
 * AI Tool Integration Options
 * All available AI coding assistants to integrate with
 */
export const AI_TOOL_OPTIONS: Option[] = [
	{ label: "Claude Code", value: "claude-code", description: "Anthropic's CLI AI assistant" },
	{
		label: "GitHub Copilot",
		value: "github-copilot",
		description: "Microsoft's AI pair programmer",
	},
	{ label: "Gemini CLI", value: "gemini-cli", description: "Google's multimodal CLI" },
	{ label: "Cursor", value: "cursor", description: "AI-first code editor" },
	{ label: "Qwen Code", value: "qwen-code", description: "Alibaba's AI coding assistant" },
	{ label: "opencode", value: "opencode", description: "Open source AI IDE" },
	{ label: "Windsurf", value: "windsurf", description: "Codeium's AI flow editor" },
	{ label: "Kilo Code", value: "kilo-code", description: "Lightweight AI coding assistant" },
	{ label: "Auggie CLI", value: "auggie-cli", description: "Augmented coding CLI" },
	{ label: "Roo Code", value: "roo-code", description: "AI-powered development environment" },
	{ label: "Codex CLI", value: "codex-cli", description: "OpenAI's CLI coding assistant" },
	{ label: "Antigravity", value: "antigravity", description: "Next-gen AI coding platform" },
];

/**
 * Language Options for interaction and output
 */
export const LANGUAGE_OPTIONS: Option[] = [
	{ label: "🇺🇸 English", value: "en", description: "English" },
	{ label: "🇮🇩 Indonesian", value: "id", description: "Bahasa Indonesia" },
	{ label: "🇪🇸 Spanish", value: "es", description: "Español" },
	{ label: "🇫🇷 French", value: "fr", description: "Français" },
	{ label: "🇩🇪 German", value: "de", description: "Deutsch" },
	{ label: "🇯🇵 Japanese", value: "ja", description: "日本語" },
	{ label: "🇰🇷 Korean", value: "ko", description: "한국어" },
	{ label: "🇨🇳 Chinese", value: "zh", description: "中文" },
	{ label: "🇵🇹 Portuguese", value: "pt", description: "Português" },
	{ label: "🇷🇺 Russian", value: "ru", description: "Русский" },
];

/**
 * User Pronoun Options for how Aizen addresses the user
 */
export const PRONOUN_OPTIONS: Option[] = [
	{ label: "👤 They/Them", value: "they", description: "Use they/them pronouns" },
	{ label: "👨 He/Him", value: "he", description: "Use he/him pronouns" },
	{ label: "👩 She/Her", value: "she", description: "Use she/her pronouns" },
	{ label: "👤 You/Your", value: "you", description: "Use you/your (neutral)" },
];

/**
 * PRD Ownership Options
 */
export const PRD_OPTIONS: Option[] = [
	{
		label: "✅ Yes, I have a feature plan (PRD)",
		value: "yes",
		description: "I already have a document describing my project",
	},
	{
		label: "❌ No, I need help creating one",
		value: "no",
		description: "Let's create one together - perfect for beginners!",
	},
];

export const QUICK_START_OPTIONS: Option[] = [
	{
		label: "✅ Yes! I want a quick start",
		value: "quick",
		description: "Use a pre-made template for common project types",
	},
	{
		label: "❌ No, I'll create from scratch",
		value: "manual",
		description: "Start with a blank template",
	},
];

export const QUICK_START_TEMPLATES: Option[] = [
	{
		label: "📋 Simple Todo App",
		value: "todo-app",
		description: "Basic task list with add/complete/delete",
	},
	{
		label: "🔐 User Authentication",
		value: "auth",
		description: "Login/signup with email and password",
	},
	{ label: "📝 Note-taking App", value: "notes", description: "Create, edit, and delete notes" },
	{ label: "🏗️ Custom Project", value: "custom", description: "Start with a blank template" },
];

export const PRD_CREATE_OPTIONS: Option[] = [
	{
		label: "💬 Create with PM Agent",
		value: "pm-agent",
		description: "Interactive discussion with our Product Manager agent",
		details: "Best for complex projects • Token usage depends on discussion length",
	},
	{
		label: "📝 Create manually (ChatGPT/Gemini)",
		value: "manual",
		description: "Use AI to create PRD yourself",
		details: "Token saving • You control the output",
	},
];

export const CONFIRM_OPTIONS: Option[] = [
	{
		label: "✅ Yes, let's build it!",
		value: "yes",
		description: "Continue to create tasks and start building",
	},
	{
		label: "📝 Let me edit the plan",
		value: "edit",
		description: "Make changes to the feature plan",
	},
	{ label: "🔄 Start over", value: "restart", description: "Begin from the beginning" },
];
