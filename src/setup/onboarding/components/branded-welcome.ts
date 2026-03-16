/**
 * Branded Welcome Component for Aizen-Gate
 * Creates visually stunning welcome screens with ASCII art
 */

import chalk from "chalk";

/**
 * ASCII Art Logo for Aizen-Gate
 * Torii gate design representing the "gate" in Aizen-Gate
 */
const AIZEN_ASCII_LOGO = `
${chalk.cyan("                        ⛩️")}
${chalk.cyan("═══════════════════════════════════════════════════════════")}
${chalk.cyan("║")}                                                             ${chalk.cyan("║")}
${chalk.cyan("║")}     ${chalk.bold.white("██╗  ██╗ █████╗ ███████╗██╗      ██████╗ ██╗   ██╗")}     ${chalk.cyan("║")}
${chalk.cyan("║")}     ${chalk.bold.white("██║  ██║██╔══██╗██╔════╝██║     ██╔═══██╗██║   ██║")}     ${chalk.cyan("║")}
${chalk.cyan("║")}     ${chalk.bold.white("███████║███████║███████╗██║     ██║   ██║██║   ██║")}     ${chalk.cyan("║")}
${chalk.cyan("║")}     ${chalk.bold.white("██╔══██║██╔══██║╚════██║██║     ██║   ██║██║   ██║")}     ${chalk.cyan("║")}
${chalk.cyan("║")}     ${chalk.bold.white("██║  ██║██║  ██║███████║███████╗╚██████╔╝╚██████╔╝")}     ${chalk.cyan("║")}
${chalk.cyan("║")}     ${chalk.bold.white("╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝")}      ${chalk.cyan("║")}
${chalk.cyan("║")}                                                             ${chalk.cyan("║")}
${chalk.cyan("║")}              ${chalk.bold.cyan("G A T E")}                              ${chalk.cyan("║")}
${chalk.cyan("║")}                                                             ${chalk.cyan("║")}
${chalk.cyan("═══════════════════════════════════════════════════════════")}
`;

/**
 * Mini ASCII Logo for smaller displays
 */
const AIZEN_MINI_LOGO = `
${chalk.cyan.bold("⛩️  AIZEN-GATE")}
${chalk.dim("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}
`;

/**
 * Welcome messages with variations
 */
const WELCOME_MESSAGES = [
	"Welcome to the Elite Swarm Architecture",
	"Your AI-Powered Development Shield Awaits",
	"Initializing the Ultimate Orchestration System",
	"Preparing Your Intelligent Development Companion",
	"Activating the AI Agent Coordination System",
];

const TAGLINES = [
	"The Ultimate AI-Orchestration & Specification Shield",
	"Where Intelligence Meets Development",
	"Your AI Development Team, Unified",
	"Elite Swarm Architecture for Modern Development",
];

/**
 * Get a random item from an array
 */
function getRandomItem<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

/**
 * Display options for the welcome screen
 */
export interface WelcomeOptions {
	/** Show full ASCII art logo (default: true) */
	showLogo?: boolean;
	/** Show version information */
	version?: string;
	/** Custom subtitle */
	subtitle?: string;
	/** Use minimal mode for smaller displays */
	minimal?: boolean;
	/** Show animation frames */
	animated?: boolean;
}

/**
 * Display the branded welcome screen with optional animation
 */
export async function displayWelcome(options: WelcomeOptions = {}): Promise<void> {
	const { showLogo = true, version, subtitle, minimal = false, animated = false } = options;

	if (minimal) {
		console.log();
		console.log(AIZEN_MINI_LOGO);
		if (version) {
			console.log(chalk.dim(`   Version ${version}`));
		}
		console.log();
		return;
	}

	// Display full branded welcome
	console.log();

	if (showLogo) {
		if (animated) {
			await displayAnimatedLogo();
		} else {
			console.log(AIZEN_ASCII_LOGO);
		}
	}

	// Tagline with typing effect if animated
	const tagline = getRandomItem(TAGLINES);
	if (animated) {
		await typeText(centerText(tagline), 20);
	} else {
		console.log(centerText(tagline));
	}
	console.log();

	// Version info
	if (version) {
		console.log(chalk.dim(centerText(`Version ${version}`)));
		console.log();
	}

	// Subtitle or random welcome message with fade effect if animated
	const message = subtitle || getRandomItem(WELCOME_MESSAGES);
	if (animated) {
		await fadeText(centerText(message), "cyan");
	} else {
		console.log(chalk.cyan(centerText(message)));
	}
	console.log();

	// Decorative separator with animation if enabled
	if (animated) {
		await drawSeparator("─────────────────────────────────────────");
	} else {
		console.log(chalk.dim(centerText("─────────────────────────────────────────")));
	}
	console.log();
}

/**
 * Display a section header with consistent styling
 */
export function displaySectionHeader(title: string, icon?: string): void {
	const iconStr = icon || "▸";
	console.log();
	console.log(chalk.bold.cyan(`${iconStr} ${title}`));
	console.log(chalk.dim("─".repeat(title.length + 2)));
}

/**
 * Display a success message with checkmark
 */
export function displaySuccess(message: string): void {
	console.log(chalk.green(`  ✓ ${message}`));
}

/**
 * Display an info message
 */
export function displayInfo(message: string): void {
	console.log(chalk.cyan(`  → ${message}`));
}

/**
 * Display a warning message
 */
export function displayWarning(message: string): void {
	console.log(chalk.yellow(`  ⚠ ${message}`));
}

/**
 * Display an error message with styling
 */
export function displayError(message: string): void {
	console.log(chalk.red(`  ✗ ${message}`));
}

/**
 * Display a step indicator
 */
export function displayStep(current: number, total: number, message: string): void {
	const stepNum = chalk.dim(`[${current}/${total}]`);
	const arrow = chalk.cyan("►");
	console.log(`\n${stepNum} ${arrow} ${chalk.white(message)}`);
}

/**
 * Display a feature highlight box
 */
export function displayFeatureBox(
	title: string,
	features: string[],
	options: {
		icon?: string;
		color?: "cyan" | "green" | "yellow" | "magenta";
	} = {},
): void {
	const { icon = "✨", color = "cyan" } = options;
	const colorFn = chalk[color];

	const lines: string[] = [];
	const width = 50;

	lines.push(colorFn("┌" + "─".repeat(width - 2) + "┐"));
	lines.push(colorFn("│") + centerText(`${icon} ${title}`, width - 2) + colorFn("│"));
	lines.push(colorFn("├" + "─".repeat(width - 2) + "┤"));

	for (const feature of features) {
		const padded = `  ${feature}`;
		lines.push(colorFn("│") + padded.padEnd(width - 2) + colorFn("│"));
	}

	lines.push(colorFn("└" + "─".repeat(width - 2) + "┘"));

	console.log();
	for (const line of lines) {
		console.log(line);
	}
	console.log();
}

/**
 * Display a quick tip box
 */
export function displayTip(message: string): void {
	const lines = wrapText(message, 46);
	console.log();
	console.log(chalk.dim("┌─ 💡 Tip " + "─".repeat(38) + "┐"));
	for (const line of lines) {
		console.log(chalk.dim("│") + ` ${line}`.padEnd(48) + chalk.dim("│"));
	}
	console.log(chalk.dim("└" + "─".repeat(48) + "┘"));
	console.log();
}

/**
 * Display next steps after onboarding
 */
export function displayNextSteps(steps: string[]): void {
	console.log();
	console.log(chalk.bold.cyan("🚀 Next Steps"));
	console.log(chalk.dim("─".repeat(40)));

	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const num = chalk.cyan.bold(`${i + 1}.`);
		console.log(`  ${num} ${step}`);
	}

	console.log();
}

/**
 * Display a celebration message with enhanced effects
 */
export async function displayCelebration(
	message: string,
	options: { animated?: boolean } = {},
): Promise<void> {
	const emojis = ["🎉", "✨", "🚀", "⚡", "🌟", "🎊", "💫", "🔥"];
	const emoji1 = getRandomItem(emojis);
	const emoji2 = getRandomItem(emojis.filter((e) => e !== emoji1));

	console.log();

	if (options.animated) {
		// Animated celebration with multiple frames
		const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

		for (let i = 0; i < 10; i++) {
			const frame = frames[i % frames.length];
			process.stdout.write(
				`\r${chalk.cyan(frame)} ${chalk.green.bold(message)} ${chalk.cyan(frame)}`,
			);
			await new Promise((r) => setTimeout(r, 50));
		}

		process.stdout.write("\r");
	}

	// Final celebration display
	console.log(chalk.green.bold(`  ${emoji1} ${message} ${emoji2}`));

	// Add sparkles effect
	const sparkleLine = "  ✨ " + "▔".repeat(40) + " ✨";
	console.log(chalk.yellow(sparkleLine));
	console.log();
}

/**
 * Center text in a given width
 */
function centerText(text: string, width: number = 57): string {
	const padding = Math.max(0, Math.floor((width - text.length) / 2));
	return " ".repeat(padding) + text;
}

/**
 * Wrap text to a maximum width
 */
function wrapText(text: string, maxWidth: number): string[] {
	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		if (currentLine.length + word.length + 1 <= maxWidth) {
			currentLine += (currentLine ? " " : "") + word;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);
	return lines;
}

/**
 * Display a branded separator
 */
export function displaySeparator(): void {
	console.log(chalk.dim("═══════════════════════════════════════════════════════════"));
}

/**
 * Display installation progress header
 */
export function displayInstallHeader(): void {
	console.log();
	console.log(chalk.cyan.bold("⛩️  AIZEN-GATE INSTALLATION"));
	console.log(chalk.dim("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
	console.log();
	console.log(chalk.white("Preparing your AI development environment..."));
	console.log();
}

/**
 * Display start command header
 */
export function displayStartHeader(): void {
	console.log();
	console.log(chalk.cyan.bold("🚀 AIZEN-GATE STARTUP"));
	console.log(chalk.dim("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
	console.log();
	console.log(chalk.white("Initializing your intelligent development workspace..."));
	console.log();
}

/**
 * Animated logo display with fade-in effect
 */
async function displayAnimatedLogo(): Promise<void> {
	const lines = AIZEN_ASCII_LOGO.split("\n");

	for (const line of lines) {
		console.log(line);
		await new Promise((r) => setTimeout(r, 30));
	}
}

/**
 * Type text with animation effect
 */
async function typeText(text: string, delay: number = 30): Promise<void> {
	process.stdout.write(" ");
	for (const char of text) {
		process.stdout.write(char);
		await new Promise((r) => setTimeout(r, delay));
	}
	console.log();
}

/**
 * Fade text in with color transition
 */
async function fadeText(text: string, color: string): Promise<void> {
	const colorFn = chalk[color] || chalk.cyan;
	console.log(colorFn(text));
	await new Promise((r) => setTimeout(r, 100));
}

/**
 * Draw separator with animation
 */
async function drawSeparator(char: string): Promise<void> {
	process.stdout.write(chalk.dim(centerText("")));
	for (let i = 0; i < char.length; i++) {
		process.stdout.write(chalk.dim(char[i]));
		await new Promise((r) => setTimeout(r, 10));
	}
	console.log();
}

/**
 * Display success animation with checkmark
 */
export async function displayAnimatedSuccess(message: string): Promise<void> {
	const checkmark = "✓";
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

	// Show spinner animation
	for (let i = 0; i < 15; i++) {
		const frame = frames[i % frames.length];
		process.stdout.write(`\r${chalk.cyan(frame)} ${message}`);
		await new Promise((r) => setTimeout(r, 50));
	}

	// Replace with checkmark
	process.stdout.write(`\r${chalk.green(checkmark)} ${message}  \n`);
}

/**
 * Display enhanced feature showcase with icons
 */
export function displayFeatureShowcase(
	title: string,
	features: Array<{ icon: string; name: string; description: string }>,
): void {
	console.log();
	console.log(chalk.bold.cyan(`▸ ${title}`));
	console.log(chalk.dim("─".repeat(50)));

	for (const feature of features) {
		console.log();
		console.log(`  ${feature.icon}  ${chalk.bold.white(feature.name)}`);
		console.log(chalk.dim(`     ${feature.description}`));
	}

	console.log();
	console.log(chalk.dim("─".repeat(50)));
	console.log();
}

/**
 * Display progress celebration with multiple stages
 */
export async function displayProgressCelebration(
	stages: Array<{ message: string; icon: string }>,
): Promise<void> {
	console.log();

	for (let i = 0; i < stages.length; i++) {
		const stage = stages[i];
		const percentage = Math.round(((i + 1) / stages.length) * 100);

		// Progress bar
		const barWidth = 30;
		const filled = Math.round((percentage / 100) * barWidth);
		const empty = barWidth - filled;
		const bar = chalk.green("█".repeat(filled)) + chalk.dim("░".repeat(empty));

		process.stdout.write(`\r${stage.icon} ${bar} ${percentage}% - ${stage.message}`);

		await new Promise((r) => setTimeout(r, 300));
	}

	console.log();
	console.log();
}

export { AIZEN_ASCII_LOGO, AIZEN_MINI_LOGO, getRandomItem };
