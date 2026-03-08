/**
 * Onboarding Configuration
 * Contains all dropdown options and prompts for the onboarding wizard
 */

const IDE_OPTIONS = [
	{ label: "🖥️ VSCode", value: "vscode", description: "Visual Studio Code" },
	{ label: "💻 VSCode Insiders", value: "vscode-insiders", description: "VSCode Insiders" },
	{ label: "🔵 Cursor", value: "cursor", description: "AI-first code editor" },
	{ label: "🐙 GitHub Codespaces", value: "codespaces", description: "Cloud development" },
	{ label: "💨 Windsurf", value: "windsurf", description: "Codeium's IDE" },
	{ label: "⌨️ CLI (Terminal)", value: "cli", description: "Command line only" },
	{ label: "🔄 Other", value: "other", description: "Custom setup" },
];

const DEV_TYPE_OPTIONS = [
	{
		label: "⚡ Fast (Prototype/POC)",
		value: "fast",
		description: "Quick iterations, minimal docs, fast feedback",
		details: "Token efficiency mode • Rapid prototyping • Minimal documentation",
	},
	{
		label: "🐢 Medium (MVP)",
		value: "medium",
		description: "Balance between speed and quality",
		details: "Standard documentation • Basic testing • Clear milestones",
	},
	{
		label: "🏗️ Slow (Complete Process)",
		value: "slow",
		description: "Full SDLC, comprehensive testing",
		details: "Enterprise-grade • Full test coverage • Complete documentation",
	},
];

const PRD_OPTIONS = [
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

const QUICK_START_OPTIONS = [
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

const QUICK_START_TEMPLATES = [
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

const PRD_CREATE_OPTIONS = [
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

const CONFIRM_OPTIONS = [
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

module.exports = {
	IDE_OPTIONS,
	DEV_TYPE_OPTIONS,
	PRD_OPTIONS,
	PRD_CREATE_OPTIONS,
	CONFIRM_OPTIONS,
	QUICK_START_OPTIONS,
	QUICK_START_TEMPLATES,
};
