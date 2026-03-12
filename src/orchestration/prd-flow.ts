import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { resolveAgentPath, getAgentContent } from "../agents/agent-resolver.js";

/**
 * [AZ] PRD Flow Orchestration
 * Implements conditional logic for PRD workflows:
 * - Option A: PM + BA review (existing PRD)
 * - Option B: Brainstorming to create PRD
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * PRD Flow options
 */
export type PRDFlowOption = "option-a" | "option-b";

/**
 * PRD Flow result
 */
export interface PRDFlowResult {
	success: boolean;
	message: string;
	prdPath?: string;
	sprintPath?: string;
	option: PRDFlowOption;
}

/**
 * Sprint task structure
 */
export interface SprintTask {
	id: string;
	title: string;
	description: string;
	priority: "must" | "should" | "could" | "won't";
	assignee?: string;
	status: "todo" | "in-progress" | "done";
	estimatedHours?: number;
}

// ============================================================================
// Constants
// ============================================================================

const PRD_PATH = "aizen-gate/prd/prd.md";
const TEMPLATE_PATH = "aizen-gate/prd/template.md";
const SPRINT_OUTPUT_PATH = "aizen-gate/shared/board.md";

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if PRD exists in the project
 * @param projectRoot - Root directory of the project
 * @returns True if prd.md exists
 */
export async function checkPRDExists(projectRoot: string): Promise<boolean> {
	const prdPath = path.join(projectRoot, PRD_PATH);
	return fs.pathExists(prdPath);
}

/**
 * Load the existing PRD from prd.md
 * @param projectRoot - Root directory of the project
 * @returns PRD content or null if not found
 */
export async function loadPRD(projectRoot: string): Promise<string | null> {
	const prdPath = path.join(projectRoot, PRD_PATH);
	const exists = await fs.pathExists(prdPath);

	if (!exists) {
		return null;
	}

	try {
		const content = await fs.readFile(prdPath, "utf-8");
		// Check if PRD is empty or just contains placeholder
		const trimmed = content.trim();
		if (trimmed.length < 50 || trimmed.includes("<!-- User fills in")) {
			return null;
		}
		return content;
	} catch (error) {
		console.error(chalk.red(`Error loading PRD: ${(error as Error).message}`));
		return null;
	}
}

/**
 * Run Option A: PM + BA Review Workflow
 * Triggered when user says "Hi Aizen, check my PRD"
 * @param projectRoot - Root directory of the project
 * @param userMessage - Optional user message with context
 * @returns PRDFlowResult
 */
export async function runOptionA(
	projectRoot: string,
	userMessage?: string,
): Promise<PRDFlowResult> {
	console.log(chalk.cyan("\n⛩️  PRD Flow | Option A: PM + BA Review"));

	// Step 1: Load existing PRD
	const prdContent = await loadPRD(projectRoot);

	if (!prdContent) {
		return {
			success: false,
			message: "No existing PRD found. Please create a PRD first or use Option B for brainstorming.",
			option: "option-a",
		};
	}

	console.log(chalk.green("✓ PRD loaded successfully"));

	// Step 2: Invoke PM agent for review
	console.log(chalk.yellow("\n📋 Invoking PM agent for PRD review..."));
	const pmResult = await invokePMAgent(projectRoot, prdContent, userMessage);

	if (!pmResult.success) {
		return {
			success: false,
			message: pmResult.message,
			option: "option-a",
		};
	}

	// Step 3: Invoke BA agent for analysis
	console.log(chalk.yellow("\n🔍 Invoking BA agent for requirements analysis..."));
	const baResult = await invokeBAAgent(projectRoot, prdContent);

	if (!baResult.success) {
		return {
			success: false,
			message: baResult.message,
			option: "option-a",
		};
	}

	// Step 4: Convert to sprint
	console.log(chalk.yellow("\n⚡ Converting PRD to sprint tasks..."));
	const sprintResult = await convertToSprint(projectRoot, prdContent);

	if (!sprintResult.success) {
		return {
			success: false,
			message: sprintResult.message || "Failed to convert to sprint",
			option: "option-a",
		};
	}

	return {
		success: true,
		message: "PRD reviewed by PM and BA. Sprint tasks created successfully.",
		prdPath: path.join(projectRoot, PRD_PATH),
		sprintPath: sprintResult.sprintPath,
		option: "option-a",
	};
}

/**
 * Run Option B: Brainstorming Workflow
 * Triggered when user says "Hi Aizen, help me build X"
 * @param projectRoot - Root directory of the project
 * @param userRequest - The user's request/idea
 * @returns PRDFlowResult
 */
export async function runOptionB(
	projectRoot: string,
	userRequest: string,
): Promise<PRDFlowResult> {
	console.log(chalk.cyan("\n⛩️  PRD Flow | Option B: Brainstorming"));

	// Step 1: Invoke PM + BA for brainstorming
	console.log(chalk.yellow("\n💡 Invoking PM and BA agents for brainstorming..."));

	const pmResult = await invokePMAgent(projectRoot, "", `Brainstorm: ${userRequest}`);
	const baResult = await invokeBAAgent(projectRoot, "", `Analyze: ${userRequest}`);

	if (!pmResult.success && !baResult.success) {
		return {
			success: false,
			message: "Failed to start brainstorming session. Please try again.",
			option: "option-b",
		};
	}

	// Step 2: Create PRD from conversation
	console.log(chalk.yellow("\n📝 Creating PRD from brainstorming session..."));
	const prdContent = await createPRDFromBrainstorm(projectRoot, userRequest, pmResult, baResult);

	// Step 3: Save PRD
	const prdPath = path.join(projectRoot, PRD_PATH);
	await fs.writeFile(prdPath, prdContent);
	console.log(chalk.green(`✓ PRD saved to ${PRD_PATH}`));

	// Step 4: Convert to sprint
	console.log(chalk.yellow("\n⚡ Converting PRD to sprint tasks..."));
	const sprintResult = await convertToSprint(projectRoot, prdContent);

	return {
		success: true,
		message: "PRD created from brainstorming. Sprint tasks generated successfully.",
		prdPath,
		sprintPath: sprintResult.sprintPath,
		option: "option-b",
	};
}

/**
 * Convert PRD content to sprint tasks
 * @param projectRoot - Root directory of the project
 * @param prdContent - PRD content
 * @returns Sprint result with path
 */
export async function convertToSprint(
	projectRoot: string,
	prdContent: string,
): Promise<{ success: boolean; sprintPath?: string; message?: string }> {
	// Extract user stories and requirements from PRD
	const tasks = extractTasksFromPRD(prdContent);

	// Generate sprint board content
	const sprintContent = generateSprintBoard(tasks);

	// Save to board.md
	const sprintPath = path.join(projectRoot, SPRINT_OUTPUT_PATH);
	await fs.writeFile(sprintPath, sprintContent);

	console.log(chalk.green(`✓ Sprint tasks saved to ${SPRINT_OUTPUT_PATH}`));

	return {
		success: true,
		sprintPath,
		message: `Generated ${tasks.length} sprint tasks`,
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Invoke the PM agent for PRD review
 */
async function invokePMAgent(
	projectRoot: string,
	prdContent: string,
	context?: string,
): Promise<{ success: boolean; message: string; output?: string }> {
	// PM agent invocation - reads PRD and asks clarifying questions
	// Uses new resolver to support both .md (Antigravity) and .yaml (legacy)
	const pmAgentPath = await resolveAgentPath(projectRoot, "pm");

	if (!pmAgentPath) {
		console.log(chalk.yellow("⚠ PM agent not found, skipping agent invocation"));
		return {
			success: true,
			message: "PM agent not configured, proceeding with automated analysis",
		};
	}

	console.log(chalk.dim(`  → PM Agent analyzing PRD... (${pmAgentPath})`));

	// Simulate PM agent analysis
	const pmOutput = await simulatePMAgentAnalysis(prdContent, context);

	return {
		success: true,
		message: "PM review completed",
		output: pmOutput,
	};
}

/**
 * Invoke the BA agent for requirements analysis
 */
async function invokeBAAgent(
	projectRoot: string,
	prdContent: string,
	context?: string,
): Promise<{ success: boolean; message: string; output?: string }> {
	// BA agent invocation - studies requirements and identifies gaps
	// Uses new resolver to support both .md (Antigravity) and .yaml (legacy)
	const baAgentPath = await resolveAgentPath(projectRoot, "analyst");

	if (!baAgentPath) {
		console.log(chalk.yellow("⚠ BA agent not found, skipping agent invocation"));
		return {
			success: true,
			message: "BA agent not configured, proceeding with automated analysis",
		};
	}

	console.log(chalk.dim(`  → BA Agent analyzing requirements... (${baAgentPath})`));

	// Simulate BA agent analysis
	const baOutput = await simulateBAAgentAnalysis(prdContent, context);

	return {
		success: true,
		message: "BA analysis completed",
		output: baOutput,
	};
}

/**
 * Simulate PM agent analysis (placeholder for actual agent invocation)
 */
async function simulatePMAgentAnalysis(prdContent: string, context?: string): Promise<string> {
	// In production, this would invoke the actual PM agent
	// For now, return a placeholder analysis
	const hasContent = prdContent.length > 50;

	if (context?.startsWith("Brainstorm:")) {
		return `PM Analysis: User wants to build something related to "${context.replace("Brainstorm: ", "")}". Need to clarify target users, core value proposition, and success metrics.`;
	}

	if (!hasContent) {
		return "PM Analysis: No PRD content to analyze.";
	}

	return `PM Analysis: PRD reviewed. Identified ${countSections(prdContent)} sections. Recommendations: 
- Executive summary is clear
- Consider adding more user stories
- Define success metrics upfront`;
}

/**
 * Simulate BA agent analysis (placeholder for actual agent invocation)
 */
async function simulateBAAgentAnalysis(prdContent: string, context?: string): Promise<string> {
	// In production, this would invoke the actual BA agent
	// For now, return a placeholder analysis

	if (context?.startsWith("Analyze:")) {
		return `BA Analysis: Analyzing requirements for "${context.replace("Analyze: ", "")}". Key considerations:
- Functional requirements need detail
- Non-functional requirements to define
- Technical constraints to consider`;
	}

	if (prdContent.length < 50) {
		return "BA Analysis: No PRD content to analyze.";
	}

	return `BA Analysis: Requirements reviewed. Found ${countRequirements(prdContent)} requirements. 
Gaps identified:
- Some acceptance criteria are vague
- Edge cases not fully covered
- Technical feasibility needs architect review`;
}

/**
 * Count sections in PRD content
 */
function countSections(content: string): number {
	const sectionHeaders = content.match(/^#{1,3}\s+/gm);
	return sectionHeaders ? sectionHeaders.length : 0;
}

/**
 * Count requirements in PRD content
 */
function countRequirements(content: string): number {
	const requirements = content.match(/FR-\d+/g);
	return requirements ? new Set(requirements).size : 0;
}

/**
 * Create PRD from brainstorming session
 */
async function createPRDFromBrainstorm(
	projectRoot: string,
	userRequest: string,
	pmResult: { output?: string },
	baResult: { output?: string },
): Promise<string> {
	// Load template
	const templatePath = path.join(projectRoot, TEMPLATE_PATH);
	let template = "";

	if (await fs.pathExists(templatePath)) {
		template = await fs.readFile(templatePath, "utf-8");
	} else {
		// Use default template
		template = getDefaultTemplate();
	}

	// Replace placeholders with brainstorming content
	let prdContent = template.replace(
		"## Executive Summary\n_Brief description",
		`## Executive Summary\n${userRequest} - Created through collaborative brainstorming session with PM and BA.`,
	);

	// Add PM analysis
	prdContent = prdContent.replace(
		"## 1. Problem Statement",
		`## 1. Problem Statement\n${pmResult.output || "To be defined based on user requirements."}`,
	);

	// Add BA analysis
	prdContent = prdContent.replace(
		"## 4. Functional Requirements",
		`## 4. Functional Requirements\n${baResult.output || "To be defined based on analysis."}`,
	);

	// Update metadata
	prdContent = prdContent.replace("**Status:** Draft", "**Status:** Draft (Created from brainstorming)");
	prdContent = prdContent.replace("**Last Updated:**", `**Last Updated:** ${new Date().toISOString().split("T")[0]}`);

	return prdContent;
}

/**
 * Get default PRD template
 */
function getDefaultTemplate(): string {
	return `# Product Requirements Document

## Executive Summary
_Brief description of the product/feature and its value proposition._

## 1. Problem Statement
_What problem are we solving? Why does it matter?_

## 2. Goals & Success Metrics

## 3. User Stories

## 4. Functional Requirements

## 5. Non-Functional Requirements

## 6. User Experience (UX) Goals

## 7. Technical Considerations

## 8. Milestones

## 9. Out of Scope

## 10. Open Questions

---

**Document Status:** Draft
**Last Updated:** 
**Owner:** 
**Reviewers:** 
`;
}

/**
 * Extract tasks from PRD content
 */
function extractTasksFromPRD(prdContent: string): SprintTask[] {
	const tasks: SprintTask[] = [];
	let taskId = 1;

	// Extract user stories
	const userStoryRegex =/\|\s*US\d+\s*\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
	let match;
	while ((match = userStoryRegex.exec(prdContent)) !== null) {
		tasks.push({
			id: `TASK-${taskId.toString().padStart(3, "0")}`,
			title: match[2].trim(),
			description: `User Story: As a ${match[1].trim()} I want to ${match[2].trim()} so that ${match[3].trim()}`,
			priority: "should",
			status: "todo",
		});
		taskId++;
	}

	// Extract functional requirements
	const frRegex = /### FR-\d+:\s+(.+)/g;
	while ((match = frRegex.exec(prdContent)) !== null) {
		tasks.push({
			id: `TASK-${taskId.toString().padStart(3, "0")}`,
			title: match[1].trim(),
			description: `Functional requirement from PRD`,
			priority: "must",
			status: "todo",
		});
		taskId++;
	}

	// If no tasks found, create a placeholder
	if (tasks.length === 0) {
		tasks.push({
			id: "TASK-001",
			title: "Define initial scope",
			description: "Work with stakeholders to define the initial project scope based on PRD",
			priority: "must",
			status: "todo",
		});
	}

	return tasks;
}

/**
 * Generate sprint board content
 */
function generateSprintBoard(tasks: SprintTask[]): string {
	const header = `# Sprint Board

Last Updated: ${new Date().toISOString()}

## To Do

`;

	const taskList = tasks
		.filter((t) => t.status === "todo")
		.map((t) => `- [ ] **${t.id}**: ${t.title} \`${t.priority}\``)
		.join("\n");

	const inProgress = tasks
		.filter((t) => t.status === "in-progress")
		.map((t) => `- [ ] **${t.id}**: ${t.title} \`${t.priority}\``)
		.join("\n");

	const done = tasks
		.filter((t) => t.status === "done")
		.map((t) => `- [x] **${t.id}**: ${t.title} \`${t.priority}\``)
		.join("\n");

	return (
		header +
		(taskList || "(No tasks)") +
		"\n\n## In Progress\n" +
		(inProgress || "(No tasks)") +
		"\n\n## Done\n" +
		(done || "(No tasks)") +
		"\n"
	);
}

// ============================================================================
// Main Entry Points
// ============================================================================

/**
 * Main PRD flow orchestrator
 * Determines which option to run based on PRD existence
 * @param projectRoot - Root directory of the project
 * @param userMessage - User's message/request
 * @returns PRDFlowResult
 */
export async function runPRDFlow(
	projectRoot: string,
	userMessage: string,
): Promise<PRDFlowResult> {
	const hasPRD = await checkPRDExists(projectRoot);
	const prdContent = await loadPRD(projectRoot);

	// Detect user intent
	const lowerMessage = userMessage.toLowerCase();

	// Option A triggers: "check my prd", "review prd", "validate prd"
	const optionATriggers = ["check my prd", "review prd", "validate prd", "look at my prd"];
	const isOptionA = optionATriggers.some((trigger) => lowerMessage.includes(trigger));

	// Option B triggers: "help me build", "create a", "i want to build", "new project"
	const optionBTriggers = ["help me build", "create a", "i want to build", "new project", "help me create"];
	const isOptionB = optionBTriggers.some((trigger) => lowerMessage.includes(trigger));

	if (hasPRD && prdContent && (isOptionA || (!isOptionB && hasPRD))) {
		// Run Option A: PM + BA review
		return runOptionA(projectRoot, userMessage);
	} else if (isOptionB || !hasPRD || !prdContent) {
		// Run Option B: Brainstorming
		// Extract the feature request from user message
		let featureRequest = userMessage;

		// Clean up the request
		optionBTriggers.forEach((trigger) => {
			featureRequest = featureRequest.replace(new RegExp(trigger, "gi"), "").trim();
		});

		if (!featureRequest || featureRequest.length < 3) {
			featureRequest = "New feature"; // Default
		}

		return runOptionB(projectRoot, featureRequest);
	}

	// Default: ask user for clarification
	return {
		success: false,
		message: "I can help you in two ways:\n1. **Check my PRD** - Review existing PRD with PM + BA agents\n2. **Help me build X** - Brainstorm and create a new PRD\n\nWhich would you prefer?",
		option: hasPRD ? "option-a" : "option-b",
	};
}

/**
 * Factory function to create PRD flow handler
 * @param projectRoot - Root directory of the project
 */
export function createPRDFlowHandler(projectRoot: string) {
	return {
		checkPRDExists: () => checkPRDExists(projectRoot),
		loadPRD: () => loadPRD(projectRoot),
		runOptionA: (userMessage?: string) => runOptionA(projectRoot, userMessage),
		runOptionB: (userRequest: string) => runOptionB(projectRoot, userRequest),
		convertToSprint: (prdContent: string) => convertToSprint(projectRoot, prdContent),
		runPRDFlow: (userMessage: string) => runPRDFlow(projectRoot, userMessage),
	};
}
