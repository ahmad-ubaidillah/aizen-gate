import path from "node:path";
import fs from "fs-extra";

/**
 * [AZ] Superagent - Trigger System
 * Activates shared standards when AIZEN.md is referenced
 * Phase 1: GEMINI-Style Implementation
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Trigger detection result
 */
export interface TriggerResult {
	detected: boolean;
	triggers: TriggerType[];
	confidence: number;
}

/**
 * Types of triggers that can be detected
 */
export type TriggerType =
	| "aizen_reference"
	| "keyword"
	| "file_reference"
	| "domain_specific";

/**
 * Project type for dynamic context loading
 */
export type ProjectType = "web" | "api" | "mobile" | "desktop" | "library" | "unknown";

/**
 * Domain type for specialized loading
 */
export type DomainType = "fintech" | "healthcare" | "ecommerce" | "saas" | "gaming" | "general";

/**
 * Module activation status
 */
export interface ModuleActivation {
	module: string;
	loaded: boolean;
	path?: string;
	error?: string;
}

/**
 * Superagent configuration
 */
export interface SuperagentConfig {
	projectRoot: string;
	memoryDbPath?: string;
	sharedModulesPath?: string;
	enableDynamicLoading?: boolean;
}

/**
 * Processing result with activated context
 */
export interface ProcessingResult {
	message: string;
	activatedStandards: string[];
	loadedModules: ModuleActivation[];
	identity: AgentIdentity | null;
	context: DynamicContext;
}

/**
 * Agent identity configuration
 */
export interface AgentIdentity {
	name: string;
	role: string;
	personality: string;
	capabilities: string[];
}

/**
 * Dynamic context based on project type
 */
export interface DynamicContext {
	projectType: ProjectType;
	domain: DomainType;
	loadedStandards: string[];
	keywordModules: string[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * All 13 shared modules that can be activated
 */
export const SHARED_MODULES = [
	"ai-master",
	"api-standards",
	"compliance",
	"database-master",
	"design-system",
	"domain-blueprints",
	"i18n-master",
	"infra-blueprints",
	"metrics",
	"security-armor",
	"testing-master",
	"ui-ux-pro-max",
	"vitals-templates",
] as const;

/**
 * Keyword to module mapping
 */
export const KEYWORD_TRIGGERS: Record<string, string> = {
	database: "database-master",
	schema: "database-master",
	migration: "database-master",
	security: "security-armor",
	vulnerability: "security-armor",
	test: "testing-master",
	testing: "testing-master",
	api: "api-standards",
	performance: "vitals-templates",
	design: "design-system",
	ui: "ui-ux-pro-max",
	ux: "ui-ux-pro-max",
};

/**
 * Action keywords that trigger Aizen
 */
export const ACTION_KEYWORDS = ["build", "fix", "optimize", "design", "create", "implement", "refactor"];

/**
 * File references that trigger standards
 */
export const TRIGGER_FILES = ["spec.md", "prd.md", "architecture.md", "requirements.md"];

// ============================================================================
// Superagent Class
// ============================================================================

/**
 * [AZ] Superagent - Trigger System
 * Detects when to activate shared standards and loads appropriate modules
 */
export class Superagent {
	private projectRoot: string;
	private memoryDbPath: string;
	private sharedModulesPath: string;
	private enableDynamicLoading: boolean;
	private cachedProjectInfo: { projectType: ProjectType; domain: DomainType } | null = null;

	/**
	 * Create a new Superagent instance
	 * @param config - Configuration options
	 */
	constructor(config: SuperagentConfig) {
		this.projectRoot = config.projectRoot;
		this.memoryDbPath = config.memoryDbPath || path.join(this.projectRoot, "aizen-gate", "shared", "memory.db");
		this.sharedModulesPath =
			config.sharedModulesPath || path.join(this.projectRoot, "aizen-gate", ".shared");
		this.enableDynamicLoading = config.enableDynamicLoading ?? true;
	}

	/**
	 * Process a message and detect triggers
	 * @param message - User message to process
	 * @returns Processing result with activated context
	 */
	async processMessage(message: string): Promise<ProcessingResult> {
		// Step 1: Detect triggers
		const triggerResult = this.detectTriggers(message);

		if (!triggerResult.detected) {
			return {
				message: "No triggers detected",
				activatedStandards: [],
				loadedModules: [],
				identity: null,
				context: {
					projectType: "unknown",
					domain: "general",
					loadedStandards: [],
					keywordModules: [],
				},
			};
		}

		// Step 2: Activate shared standards
		const activatedStandards = await this.activateSharedStandards();

		// Step 3: Load modules based on triggers
		const loadedModules = await this.loadTriggeredModules(triggerResult);

		// Step 4: Activate agent identity
		const identity = this.activateAgentIdentity();

		// Step 5: Load dynamic context
		const context = await this.loadDynamicContext(message);

		return {
			message: `Processed message with ${triggerResult.triggers.length} trigger(s)`,
			activatedStandards,
			loadedModules,
			identity,
			context,
		};
	}

	/**
	 * Detect triggers in the message
	 * @param message - Message to analyze
	 * @returns Trigger detection result
	 */
	detectTriggers(message: string): TriggerResult {
		const triggers: TriggerType[] = [];
		let confidence = 0;
		const lowerMessage = message.toLowerCase();

		// Check for AIZEN.md or @aizen reference
		if (lowerMessage.includes("aizen.md") || lowerMessage.includes("@aizen")) {
			triggers.push("aizen_reference");
			confidence += 0.5;
		}

		// Check for action keywords
		for (const keyword of ACTION_KEYWORDS) {
			if (lowerMessage.includes(keyword)) {
				triggers.push("keyword");
				confidence += 0.2;
				break;
			}
		}

		// Check for file references
		for (const file of TRIGGER_FILES) {
			if (lowerMessage.includes(file)) {
				triggers.push("file_reference");
				confidence += 0.3;
				break;
			}
		}

		return {
			detected: triggers.length > 0,
			triggers,
			confidence: Math.min(confidence, 1.0),
		};
	}

	/**
	 * Activate all shared standards/modules
	 * @returns List of activated standard paths
	 */
	async activateSharedStandards(): Promise<string[]> {
		const activatedPaths: string[] = [];

		for (const module of SHARED_MODULES) {
			const modulePath = path.join(this.sharedModulesPath, module);
			const exists = await fs.pathExists(modulePath);

			if (exists) {
				activatedPaths.push(modulePath);
			}
		}

		return activatedPaths;
	}

	/**
	 * Load modules triggered by keywords in the message
	 * @param triggerResult - Trigger detection result
	 * @returns List of loaded modules
	 */
	async loadTriggeredModules(triggerResult: TriggerResult): Promise<ModuleActivation[]> {
		const loadedModules: ModuleActivation[] = [];

		// Load keyword-based modules
		const keywordModules = this.checkSkillTriggers(triggerResult.triggers);

		for (const moduleName of keywordModules) {
			const modulePath = path.join(this.sharedModulesPath, moduleName);
			const exists = await fs.pathExists(modulePath);

			loadedModules.push({
				module: moduleName,
				loaded: exists,
				path: exists ? modulePath : undefined,
				error: exists ? undefined : "Module not found",
			});
		}

		return loadedModules;
	}

	/**
	 * Check for skill triggers based on keywords
	 * @param triggers - List of detected triggers
	 * @returns List of module names to load
	 */
	checkSkillTriggers(triggers: TriggerType[]): string[] {
		// Use analyzeKeywords logic for keyword triggers
		// This is called with message content in processMessage
		// For now, return empty as the actual keyword matching happens via analyzeKeywords
		if (!triggers.includes("keyword")) {
			return [];
		}
		// When keyword trigger is detected, modules are loaded via loadTriggeredModules
		return [];
	}

	/**
	 * Load a specific module by name
	 * @param moduleName - Name of the module to load
	 * @returns Module activation status
	 */
	async loadModule(moduleName: string): Promise<ModuleActivation> {
		const modulePath = path.join(this.sharedModulesPath, moduleName);
		const exists = await fs.pathExists(modulePath);

		return {
			module: moduleName,
			loaded: exists,
			path: exists ? modulePath : undefined,
			error: exists ? undefined : "Module not found",
		};
	}

	/**
	 * Activate the agent identity
	 * @returns Agent identity configuration
	 */
	activateAgentIdentity(): AgentIdentity {
		return {
			name: "Aizen",
			role: "Orchestrator",
			personality: "Professional, efficient, and thorough",
			capabilities: [
				"Project orchestration",
				"Standard enforcement",
				"Quality assurance",
				"Context awareness",
			],
		};
	}

	/**
	 * Load dynamic context based on project type and domain
	 * @param message - User message to analyze
	 * @returns Dynamic context configuration
	 */
	async loadDynamicContext(message: string): Promise<DynamicContext> {
		const { projectType, domain } = await this.detectProjectContext(message);

		const loadedStandards: string[] = [];
		const keywordModules: string[] = [];

		// Load standards based on project type
		if (projectType === "web") {
			loadedStandards.push("design-system", "ui-ux-pro-max");
		} else if (projectType === "api") {
			loadedStandards.push("api-standards", "security-armor");
		} else if (projectType === "mobile") {
			loadedStandards.push("ui-ux-pro-max", "design-system");
		}

		// Load standards based on domain
		if (domain === "fintech") {
			loadedStandards.push("compliance", "security-armor");
		} else if (domain === "healthcare") {
			loadedStandards.push("compliance", "security-armor");
		}

		// Detect keyword modules from message
		const lowerMessage = message.toLowerCase();
		for (const [keyword, module] of Object.entries(KEYWORD_TRIGGERS)) {
			if (lowerMessage.includes(keyword) && !keywordModules.includes(module)) {
				keywordModules.push(module);
			}
		}

		return {
			projectType,
			domain,
			loadedStandards,
			keywordModules,
		};
	}

	/**
	 * Detect project type and domain from message or file system
	 * @param message - User message to analyze
	 * @returns Project type and domain
	 */
	private async detectProjectContext(
		message: string,
	): Promise<{ projectType: ProjectType; domain: DomainType }> {
		// Use cached info if available
		if (this.cachedProjectInfo) {
			return this.cachedProjectInfo;
		}

		// Try to detect from package.json
		let projectType: ProjectType = "unknown";
		let domain: DomainType = "general";

		const packageJsonPath = path.join(this.projectRoot, "package.json");
		if (await fs.pathExists(packageJsonPath)) {
			try {
				const pkg = await fs.readJson(packageJsonPath);

				// Detect project type from keywords in package.json
				const searchableText = `${pkg.name} ${pkg.description || ""} ${Object.keys(
					pkg.dependencies || {},
				).join(" ")}`.toLowerCase();

				if (searchableText.includes("react") || searchableText.includes("vue") || searchableText.includes("angular")) {
					projectType = "web";
				} else if (searchableText.includes("express") || searchableText.includes("fastify")) {
					projectType = "api";
				} else if (searchableText.includes("react-native") || searchableText.includes("ionic")) {
					projectType = "mobile";
				}

				// Detect domain
				if (searchableText.includes("fintech") || searchableText.includes("payment") || searchableText.includes("bank")) {
					domain = "fintech";
				} else if (searchableText.includes("health") || searchableText.includes("medical")) {
					domain = "healthcare";
				} else if (searchableText.includes("shop") || searchableText.includes("store")) {
					domain = "ecommerce";
				}
			} catch {
				// Ignore errors reading package.json
			}
		}

		// Also check message for hints
		const lowerMessage = message.toLowerCase();
		if (lowerMessage.includes("web") || lowerMessage.includes("frontend")) {
			projectType = "web";
		} else if (lowerMessage.includes("api") || lowerMessage.includes("backend")) {
			projectType = "api";
		} else if (lowerMessage.includes("mobile") || lowerMessage.includes("ios") || lowerMessage.includes("android")) {
			projectType = "mobile";
		}

		// Cache the result
		this.cachedProjectInfo = { projectType, domain };

		return { projectType, domain };
	}

	/**
	 * Process a message with keyword analysis for skill triggers
	 * @param message - User message to analyze
	 * @returns List of modules to activate based on keywords
	 */
	analyzeKeywords(message: string): string[] {
		const modules: string[] = [];
		const lowerMessage = message.toLowerCase();

		for (const [keyword, module] of Object.entries(KEYWORD_TRIGGERS)) {
			if (lowerMessage.includes(keyword) && !modules.includes(module)) {
				modules.push(module);
			}
		}

		return modules;
	}

	/**
	 * Check if memory database is accessible
	 * @returns True if memory system is available
	 */
	async isMemorySystemAvailable(): Promise<boolean> {
		return fs.pathExists(this.memoryDbPath);
	}

	/**
	 * Get the path to a specific shared module
	 * @param moduleName - Name of the module
	 * @returns Path to the module directory
	 */
	getModulePath(moduleName: string): string {
		return path.join(this.sharedModulesPath, moduleName);
	}
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a Superagent instance with default configuration
 * @param projectRoot - Root directory of the project
 * @returns Configured Superagent instance
 */
export function createSuperagent(projectRoot: string): Superagent {
	return new Superagent({
		projectRoot,
		enableDynamicLoading: true,
	});
}

/**
 * Create a Superagent instance with custom configuration
 * @param config - Custom configuration
 * @returns Configured Superagent instance
 */
export function createSuperagentWithConfig(config: SuperagentConfig): Superagent {
	return new Superagent(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a trigger type is in the list
 * @param triggers - List of trigger types
 * @param target - Target trigger type to check
 * @returns True if target is in triggers
 */
export function hasTrigger(triggers: TriggerType[], target: TriggerType): boolean {
	return triggers.includes(target);
}

/**
 * Get all modules that would be triggered by a keyword
 * @param keyword - Keyword to search for
 * @returns List of matching module names
 */
export function getModulesForKeyword(keyword: string): string[] {
	const lowerKeyword = keyword.toLowerCase();
	const modules: string[] = [];

	for (const [key, module] of Object.entries(KEYWORD_TRIGGERS)) {
		if (key.includes(lowerKeyword) || lowerKeyword.includes(key)) {
			if (!modules.includes(module)) {
				modules.push(module);
			}
		}
	}

	return modules;
}

/**
 * Get all shared module names
 * @returns List of all shared module names
 */
export function getSharedModules(): readonly string[] {
	return SHARED_MODULES;
}