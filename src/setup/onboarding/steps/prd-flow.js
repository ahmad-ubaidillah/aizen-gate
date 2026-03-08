const { select, note, text, cancel, isCancel, confirm } = require("@clack/prompts");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("node:path");
const {
	PRD_OPTIONS,
	PRD_CREATE_OPTIONS,
	QUICK_START_OPTIONS,
	QUICK_START_TEMPLATES,
} = require("../config/options");

/**
 * Pre-made PRD templates for quick start
 */
const QUICK_START_PRD = {
	todoApp: `# Simple Todo App - Product Requirements Document

## 1. Project Overview
- **Project Name:** Simple Todo App
- **Type:** Web Application
- **Core Feature:** A basic task management app to add, complete, and delete todos
- **Target Users:** Anyone who wants to organize their tasks

## 2. User Stories
| As a... | I want to... | So that... |
| :------ | :------------ | :---------- |
| User | Add a new task | I can track things I need to do |
| User | Mark a task as done | I can see what I've completed |
| User | Delete a task | I can remove things I no longer need |
| User | See all my tasks | I can get an overview of everything |

## 3. Functional Requirements
| ID | Feature | Description |
| :-- | :------ | :---------- |
| F1 | Add Task | User can type a task and press enter to add it |
| F2 | Complete Task | User can click a checkbox to mark task as done |
| F3 | Delete Task | User can click a button to remove a task |
| F4 | Task List | Display all tasks in a scrollable list |
| F5 | Persistence | Tasks are saved in browser localStorage |

## 4. UI/UX Requirements
- Clean, simple interface
- Clear visual feedback for completed tasks (strikethrough)
- Responsive design (works on mobile and desktop)
- No complex navigation - single page

## 5. Technical Stack (Recommended)
- **Frontend:** Plain HTML/CSS/JavaScript or React
- **Storage:** Browser localStorage
- **No backend required** - fully client-side

## 6. Out of Scope
- User authentication
- Multiple lists/categories
- Due dates
- Sharing/collaboration
`,
	auth: `# User Authentication - Product Requirements Document

## 1. Project Overview
- **Project Name:** User Authentication System
- **Type:** Web Application Feature
- **Core Feature:** Allow users to sign up, log in, and log out
- **Target Users:** App users who need personal accounts

## 2. User Stories
| As a... | I want to... | So that... |
| :------ | :------------ | :---------- |
| New User | Create an account | I can access my personalized data |
| Existing User | Log in with email/password | I can access my account |
| Logged User | Log out | I can safely leave the app |

## 3. Functional Requirements
| ID | Feature | Description |
| :-- | :------ | :---------- |
| F1 | Sign Up | User can register with email and password |
| F2 | Log In | User can authenticate to access their account |
| F3 | Log Out | User can end their session |
| F4 | Password Validation | Enforce minimum password strength |
| F5 | Session Management | Remember logged-in user |

## 4. Technical Stack (Recommended)
- **Frontend:** React, Vue, or plain JS
- **Backend:** Node.js/Express
- **Database:** SQLite or PostgreSQL
- **Auth:** JWT tokens
`,
	notes: `# Note-Taking App - Product Requirements Document

## 1. Project Overview
- **Project Name:** Simple Notes App
- **Type:** Web Application
- **Core Feature:** Create, edit, view, and delete text notes
- **Target Users:** Anyone who wants to jot down thoughts

## 2. User Stories
| As a... | I want to... | So that... |
| :------ | :------------ | :---------- |
| User | Create a new note | I can capture new information |
| User | Edit existing note | I can update my notes |
| User | Delete a note | I can remove unwanted notes |
| User | See all notes | I can browse my collection |

## 3. Functional Requirements
| ID | Feature | Description |
| :-- | :------ | :---------- |
| F1 | Create Note | Add new note with title and content |
| F2 | Edit Note | Modify existing note |
| F3 | Delete Note | Remove note permanently |
| F4 | List Notes | Show all notes with preview |
| F5 | Search Notes | Find notes by keyword |

## 4. Technical Stack (Recommended)
- **Frontend:** Plain HTML/CSS/JS or React
- **Storage:** Browser localStorage or simple backend
`,
};

/**
 * PRD Folder Structure:
 * aizen-gate/PRD/
 * ├── brainstorming.md    # Always exists (template)
 * └── prd.md             # Exists when user has PRD
 */

const BRAINSTORMING_TEMPLATE = `# ⛩️ AIZEN-GATE: The Expert Panel Brainstorm (Challenger Mode)

**Objective & Value:**
This template transforms any advanced LLM (ChatGPT, Claude 3.5+, Gemini 1.5 Pro) into a relentless, 5-person panel of industry experts. Instead of acting as a "yes-man" coding assistant, the AI will fiercely challenge your assumptions, uncover edge cases, and force you to define a highly professional Product Requirements Document (PRD) and Business Requirements Document (BRD) _before_ you write a single line of code.

**How to Use:**

1. Scroll down to the **"📝 USER INPUT"** section at the very bottom.
2. Fill out your project's goals, constraints, and raw ideas.
3. Use \`Cmd/Ctrl + A\` to copy this entire document.
4. Paste it into your AI assistant.
5. Survive the interrogation. Defend your choices until the Panel agrees.
6. Once you reach consensus, the AI will output the final \`prd.md\`. Save it to \`PRD/prd.md\` and run \`npx aizen-gate plan\`.

---

---

# [Project Name]: Industry Standard Master BRD & PRD

---

## 0. AI SYSTEM PROMPT: THE EXPERT PANEL (Challenger Mode)

> **Instructions for the AI:**
> You are no longer a single, helpful AI. You are a **Panel of 5 Senior Industry Experts**. For every input from the user, you must respond as a collective team of critical thinkers. You are not here to write code yet. You are here to interrogate the idea until it is bulletproof.

### 🎭 THE ROLES (Your Personas):

> 1.  **PM/PO (The Strategist):** Focus on ROI, market fit, and "The Why." You are obsessed with value and metrics. You always ask: "Why does the user care about this?"
> 2.  **UI/UX Designer (The Advocate):** Focus on user friction, accessibility, and flow. You hate complex workflows. You always ask: "Is this intuitive, or is it frustrating?"
> 3.  **Tech Lead/Architect (The Builder):** Focus on tech stack, scalability, and system bottlenecks. You are practical. You always ask: "Is this over-engineered? How does it scale?"
> 4.  **Senior QA (The Professional Pessimist):** Focus on edge cases, security, and "what-if" scenarios. Your job is to find holes. You always ask: "How can a user break this?"
> 5.  **Business & Legal (The Guardian):** Focus on compliance (GDPR/Data Privacy), marketing risks, and retention. You always ask: "Is this legal and sellable?"

### ⚖️ OPERATING RULES FOR THE AI:

> - **UNIVERSAL LANGUAGE RULE:** Even if the user brainstorms or speaks to you in a different language (e.g., Indonesian, Spanish), the final \`prd.md\` output MUST ALWAYS be written in professional English and strict Markdown format.
> - **STRICT NO-CODE POLICY:** You are absolutely forbidden from generating code, writing SQL schemas, or creating folder structures. Your ONLY output goal is to produce the Markdown \`prd.md\` string based on the format below. If you offer to write code, you fail the prompt.
> - **The Party Answer:** For every prompt from the user, at least 2 or 3 roles MUST chime in with their perspectives in a dialogue format.
> - **Proactive Opinion:** Don't just ask open-ended questions. Give strong opinions! (e.g., _"As the Tech Lead, I disagree with Option A because it won't scale. I strongly suggest Option B because..."_)
> - **The Challenger Rule:** If the user's idea is weak, vague, or fundamentally flawed, the Panel MUST push back and "counter-offer" with an industry-standard alternative. Do not be a "yes-man".
> - **Strict Sequencing:** Do not move to generate the PRD sections until the Panel is fully convinced the idea is sound.
> - **INITIAL GREETING RULE:** When you first receive this prompt, you MUST NOT write a long, intimidating introduction. You must ONLY reply with the following exact sentence: _"Okay, I understand. Please tell me your idea. You can use any language to brainstorm, it's okay, I will understand everything."_ Do not proceed until the user replies.
> - **The Conclusion Protocol:** Only when all 5 experts are satisfied, summarize with _"We have reached a consensus."_ Explain the final architecture in super-detail (conceptually, NO CODE), then ask: _"Do you approve us to generate the final Markdown?"_

---

## 🏗️ TARGET OUTPUT FORMAT (The PRD)

_Note to AI: When the user explicitly types "I AGREE" or "GENERATE", output the final consensus strictly using this structure below. **UNDER NO CIRCUMSTANCES should you write code, create folder structures, or write SQL schemas in the output.** **THE ENTIRE OUTPUT MUST BE IN ENGLISH AND IN STRICT MARKDOWN FORMAT.** Do not generate this until authorized._

## 1. Document Governance

- **Project Owner:** [User Name / Role]
- **Expert Panel Consensus:** Approved
- **Version:** v1.0.0
- **Last Updated:** [Today's Date]

## 2. Executive Summary & Problem Statement (The "Why")

- **PM Perspective:** [Core business goals and problem statement]
- **User Advocate Perspective:** [Specific real-world pain points being solved]
- **Value Proposition:** [Why this product wins the market]

## 3. Market Analysis & User Personas

- **Target Market:** [Primary market segments]
- **Detailed Personas:** [Psychographics, technical proficiency, primary frustrations]
- **Competitive Edge:** [Key differentiators from existing solutions]

## 4. Business Objectives & Success Metrics (KPIs)

- **North Star Metric:** [The absolute most important metric to track]
- **Counter Metrics:** [Metrics we must monitor to ensure quality doesn't drop, e.g., Speed vs. Error Rate]

## 5. User Experience (UX) & Workflows

- **Happy Path:** [Step-by-step ideal user journey]
- **Negative Path (QA Focused):** [Step-by-step handling of failures/errors]
- **System Logic:** [Core conditional branching - If/Then/Else]

## 6. Functional Requirements (The "What")

| Role   | Requirement       | Priority   | Logic / Acceptance Criteria     |
| :----- | :---------------- | :--------- | :------------------------------ |
| **PM** | [Feature Name]    | [P0/P1/P2] | [Strict business logic to pass] |
| **QA** | [Validation step] | [P0/P1/P2] | [Edge case handling rules]      |

## 7. Technical Architecture & Stack (The "How")

- **Stack:** [Frontend framework, Backend language, Database type, Infrastructure]
- **Architecture Pattern:** [e.g., Microservices, Event-Driven monolith, Serverless]
- **API & Data Flow:** [How data moves between the client, server, and third-party systems]

## 8. Security, Compliance & NFR (Non-Functional Requirements)

- **Security:** [Encryption strategy, Authentication type, Threat modeling notes]
- **Legal / Compliance:** [Data privacy (GDPR/UU PDP) and retention policies]
- **NFR:** [Target performance (latency), scalability expectations, and availability %]

## 9. QA Strategy & Test Plan

- **Test Levels:** [Strategy for Unit, Integration, UAT, and Automation]
- **Definition of Done (DoD):** [The final checklist before a Work Package can be merged]
- **Environment Strategy:** [Dev, Staging, and Production deployment pipeline]

## 10. Roadmap, Analytics & Risk Management

- **GTM Strategy:** [Go-to-market plan or rollout phases]
- **Event Tracking:** [Specific analytics tags needed for data-driven decisions]
- **Risk Matrix:** [High/Medium/Low risks and their exact mitigation plans]

---

---

## 📝 USER INPUT (FILL THIS OUT BEFORE COPYING)

**1. Project Name:**
[e.g., Aizen-Gate Core Web Dashboard]

**2. Core Problem We Are Solving:**
[e.g., Users have trouble tracking their agent's progress in real-time. They don't know what the AI is doing in the background.]

**3. Proposed Solution / Feature Idea:**
[e.g., A lightweight, WebSocket-based Kanban board that updates instantly as agents move Work Packages from 'Todo' to 'Done'.]

**4. Target Audience / Primary Users:**
[e.g., Mid-level Software Engineers, Technical Founders, and AI Hobbyists.]

**5. Known Technical Constraints or Preferences (Optional):**
[e.g., Must use React for frontend, must be lightweight so it doesn't drain memory, must run locally on port 6420.]

**[AI INSTRUCTION]**: Please read the User Input above and begin the Expert Panel Challenger Mode immediately.

**[AI INSTRUCTION]**: Please read the User Input above.

1. DO NOT generate the full PRD yet!
2. If the user has NOT filled out their project details above, simply output your **INITIAL GREETING RULE** and wait for them to respond with their idea.
3. If the user HAS provided an idea, the PM/PO must start by assessing "The Why" and asking 1-2 highly critical questions regarding the core problem. The Tech Lead must chime in immediately to point out 1 potential technical bottleneck.
4. Wait for the user's response to continue the dialogue.
`;

const PRD_FOLDER = "aizen-gate/PRD";
const BRAINSTORMING_FILE = "brainstorming.md";
const PRD_FILE = "prd.md";

/**
 * PRD Flow Step
 * Handles PRD existence check and creation
 */
async function handlePRDFlow(projectRoot) {
	// Step 1: Check if user has PRD - simplified language
	const hasPRD = await select({
		message: "Do you already have a feature plan? (PRD = Product Requirements Document)",
		options: PRD_OPTIONS,
	});

	if (isCancel(hasPRD)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	// Step 2: Handle based on answer
	if (hasPRD === "yes") {
		return await handleHasPRD(projectRoot);
	} else {
		return await handleNoPRD(projectRoot);
	}
}

/**
 * Handle case when user already has PRD
 */
async function handleHasPRD(projectRoot) {
	note(
		"Please place your PRD document at:\n" +
			`${chalk.yellow(path.join(projectRoot, PRD_FOLDER, PRD_FILE))}\n\n` +
			`The file should be named ${chalk.yellow(PRD_FILE)} (lowercase).`,
		"Import Your PRD",
	);

	const prdFolderPath = path.join(projectRoot, PRD_FOLDER);
	const prdFilePath = path.join(prdFolderPath, PRD_FILE);
	const brainstormingPath = path.join(prdFolderPath, BRAINSTORMING_FILE);

	// Ensure PRD folder exists
	await fs.ensureDir(prdFolderPath);

	// Ensure brainstorming.md exists
	if (!(await fs.pathExists(brainstormingPath))) {
		await fs.writeFile(brainstormingPath, BRAINSTORMING_TEMPLATE);
	}

	// Check if prd.md exists
	const prdExists = await fs.pathExists(prdFilePath);

	if (prdExists) {
		note(chalk.green("✅ PRD file found!"), "PRD Ready");
		return {
			hasPRD: true,
			prdPath: prdFilePath,
			brainstormingPath,
			prdExists: true,
		};
	}

	// Prompt user to create the file
	const shouldCreate = await confirm({
		message: `Would you like to create ${PRD_FILE} now?`,
		defaultValue: false,
	});

	if (shouldCreate) {
		// Open editor for user to paste PRD
		note(
			`Please create your PRD file at:\n${chalk.yellow(prdFilePath)}\n\n` +
				"Then run: npx aizen-gate onboarding",
			"Create PRD File",
		);

		return {
			hasPRD: true,
			prdPath: prdFilePath,
			brainstormingPath,
			prdExists: false,
			userActionRequired: "create_prd",
		};
	}

	return {
		hasPRD: true,
		prdPath: prdFilePath,
		brainstormingPath,
		prdExists: false,
		userActionRequired: "create_prd",
	};
}

/**
 * Handle case when user doesn't have PRD - with Quick Start option
 */
async function handleNoPRD(projectRoot) {
	// First ask if they want quick start
	const wantsQuickStart = await select({
		message: "Would you like a quick start template? (Recommended for beginners)",
		options: QUICK_START_OPTIONS,
	});

	if (isCancel(wantsQuickStart)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	const prdFolderPath = path.join(projectRoot, PRD_FOLDER);
	const brainstormingPath = path.join(prdFolderPath, BRAINSTORMING_FILE);
	const prdFilePath = path.join(prdFolderPath, PRD_FILE);

	// Ensure PRD folder exists
	await fs.ensureDir(prdFolderPath);

	// Create brainstorming.md template
	await fs.writeFile(brainstormingPath, BRAINSTORMING_TEMPLATE);

	if (wantsQuickStart === "quick") {
		// Show template selection
		return await handleQuickStartTemplates(
			projectRoot,
			prdFolderPath,
			prdFilePath,
			brainstormingPath,
		);
	}

	// Manual creation (original flow)
	return await handleManualPRD(projectRoot, prdFolderPath, brainstormingPath, prdFilePath);
}

/**
 * Handle quick start template selection
 */
async function handleQuickStartTemplates(
	projectRoot,
	prdFolderPath,
	prdFilePath,
	brainstormingPath,
) {
	const template = await select({
		message: "What type of project would you like to build?",
		options: QUICK_START_TEMPLATES,
	});

	if (isCancel(template)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	let prdContent;
	let projectType;

	switch (template) {
		case "todo-app":
			prdContent = QUICK_START_PRD.todoApp;
			projectType = "Simple Todo App";
			break;
		case "auth":
			prdContent = QUICK_START_PRD.auth;
			projectType = "User Authentication";
			break;
		case "notes":
			prdContent = QUICK_START_PRD.notes;
			projectType = "Note-Taking App";
			break;
		default:
			// Custom - create blank PRD
			prdContent = "# My Project\n\n## Overview\nDescribe your project here...\n";
			projectType = "Custom Project";
	}

	// Write the PRD file
	await fs.writeFile(prdFilePath, prdContent);

	note(
		chalk.green("✅ Quick start template created!") +
			`\n\n` +
			`Project Type: ${chalk.cyan(projectType)}\n` +
			`Location: ${chalk.yellow(prdFilePath)}\n\n` +
			`You can edit this file or run ${chalk.yellow("npx aizen-gate idea")} for more help.`,
		"Quick Start Complete",
	);

	return {
		hasPRD: true,
		prdPath: prdFilePath,
		brainstormingPath,
		prdExists: true,
		projectType,
	};
}

/**
 * Handle manual PRD creation
 */
async function handleManualPRD(projectRoot, prdFolderPath, brainstormingPath, prdFilePath) {
	const createMethod = await select({
		message: "How would you like to create your feature plan?",
		options: PRD_CREATE_OPTIONS,
	});

	if (isCancel(createMethod)) {
		cancel("Onboarding cancelled.");
		return null;
	}

	if (createMethod === "pm-agent") {
		note(
			`${chalk.cyan("Great choice!")}\n\n` +
				"Run: " +
				chalk.yellow("npx aizen-gate idea") +
				"\n\n" +
				"This will launch an interactive brainstorming session with our PM Agent.\n" +
				"The Agent will help you create your feature plan through guided questions.",
			"PM Agent Feature Planning",
		);

		return {
			hasPRD: false,
			createMethod: "pm-agent",
			brainstormingPath,
			prdPath: prdFilePath,
			nextCommand: "npx aizen-gate idea",
		};
	} else {
		// Manual creation (ChatGPT/Gemini)
		note(
			`${chalk.cyan("Token-Saving Mode")}\n\n` +
				"1. Open: " +
				chalk.yellow(brainstormingPath) +
				"\n" +
				"2. Fill in the brainstorming template\n" +
				"3. Use ChatGPT/Gemini to expand into a full feature plan\n" +
				"4. Save as: " +
				chalk.yellow(PRD_FILE) +
				"\n\n" +
				"Then run: npx aizen-gate onboarding",
			"Manual Feature Plan Creation",
		);

		return {
			hasPRD: false,
			createMethod: "manual",
			brainstormingPath,
			prdPath: prdFilePath,
			nextCommand: "complete_prd_manually",
		};
	}
}

/**
 * Validate PRD is ready for processing
 */
async function validatePRDReady(projectRoot) {
	const prdFilePath = path.join(projectRoot, PRD_FOLDER, PRD_FILE);
	const prdExists = await fs.pathExists(prdFilePath);

	if (!prdExists) {
		return {
			ready: false,
			message: `Please create your PRD at: ${prdFilePath}`,
		};
	}

	const prdContent = await fs.readFile(prdFilePath, "utf-8");

	return {
		ready: true,
		prdPath: prdFilePath,
		content: prdContent,
	};
}

module.exports = {
	handlePRDFlow,
	validatePRDReady,
	PRD_FOLDER,
	BRAINSTORMING_FILE,
	PRD_FILE,
};
