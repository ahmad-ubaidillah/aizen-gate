/**
 * Situation Detection Module
 * Phase 3.2: Intent classification and agent routing for user input
 */

import { EventEmitter } from "node:events";

/**
 * Intent types supported by the system
 */
export type IntentType = "feature" | "bug" | "optimization" | "discussion" | "review" | "help";

/**
 * Urgency levels for intent classification
 */
export type UrgencyLevel = "low" | "medium" | "high";

/**
 * Intent interface representing classified user input
 */
export interface Intent {
	type: IntentType;
	urgency: UrgencyLevel;
	agents_needed: string[];
	confidence: number;
}

/**
 * Keyword patterns for intent detection
 * Supports both English and Indonesian keywords
 */
interface KeywordPattern {
	keywords: RegExp[];
	type: IntentType;
	urgency: UrgencyLevel;
	baseConfidence: number;
}

// Keyword patterns for intent detection
const INTENT_PATTERNS: KeywordPattern[] = [
	{
		// Feature detection
		keywords: [
			/\b(bikin|create|add|new|make)\s+(feature|fitur|functionality)\b/i,
			/\b(need|want|require)\s+(new|add)\b/i,
			/\bfitur\s+baru\b/i,
			/\bimplement\s+(new|feature)\b/i,
			/\bdevelop\s+(new|feature)\b/i,
			/\bscaffolding\b/i,
		],
		type: "feature",
		urgency: "medium",
		baseConfidence: 0.8,
	},
	{
		// Bug detection
		keywords: [
			/\b(bug|error|issue|problem)\b/i,
			/\b(ada|terdapat)\s+(bug|error|masalah)\b/i,
			/\bfix\s+(this|that|the)\b/i,
			/\bbug\s+fix\b/i,
			/\berror\s+(in|on|at)\b/i,
			/\bcrash(es|ed|ing)?\b/i,
			/\bnot\s+working\b/i,
			/\btidak\s+berfungsi\b/i,
			/\btidak\s+jalan\b/i,
		],
		type: "bug",
		urgency: "high",
		baseConfidence: 0.85,
	},
	{
		// Optimization detection
		keywords: [
			/\boptimi[sz](e|ation|ing)\b/i,
			/\bperformance\b/i,
			/\b(slow|slower|slowest)\b/i,
			/\b(improve|enhance)\s+(speed|performance)\b/i,
			/\brefactor\b/i,
			/\befficient/i,
			/\blambda\s+timeout\b/i,
			/\bcold\s+start\b/i,
		],
		type: "optimization",
		urgency: "medium",
		baseConfidence: 0.75,
	},
	{
		// Discussion detection
		keywords: [
			/\bdiscuss\b/i,
			/\b(apa|what)\s+(pendapat|opinion|thoughts)\b/i,
			/\bhow\s+about\b/i,
			/\bthink\s+about\b/i,
			/\bconsider\b/i,
			/\badvice\b/i,
			/\boptions?\b/i,
			/\balternatives?\b/i,
			/\bsebelum\s+(kita|anda)\b/i,
		],
		type: "discussion",
		urgency: "low",
		baseConfidence: 0.7,
	},
	{
		// Review detection
		keywords: [
			/\breview\b/i,
			/\b(cek|check)\s+(code|kode)\b/i,
			/\bcode\s+review\b/i,
			/\baudit\b/i,
			/\binspect\b/i,
			/\banalysis\b/i,
		],
		type: "review",
		urgency: "medium",
		baseConfidence: 0.8,
	},
	{
		// Help detection
		keywords: [
			/\bhelp\b/i,
			/\b(confused|uncertain)\b/i,
			/\btolong\b/i,
			/\bbantuan\b/i,
			/\bhow\s+do\s+I\b/i,
			/\bcan\s+you\s+help\b/i,
			/\bneed\s+assistance\b/i,
			/\bstuck\b/i,
			/\bguidance\b/i,
		],
		type: "help",
		urgency: "medium",
		baseConfidence: 0.9,
	},
];

/**
 * Agent routing configuration
 * Maps intent types to the required agent sequence
 */
export const AGENT_ROUTING: Record<IntentType, string[]> = {
	feature: ["pm", "architect", "developer"],
	bug: ["developer", "qa"],
	optimization: ["architect", "developer", "qa"],
	discussion: ["pm", "architect"],
	review: ["qa", "security"],
	help: ["pm"], // AZ (Aizen) guides the user
};

/**
 * Default urgency levels for each intent type
 */
export const DEFAULT_URGENCY: Record<IntentType, UrgencyLevel> = {
	feature: "medium",
	bug: "high",
	optimization: "medium",
	discussion: "low",
	review: "medium",
	help: "medium",
};

/**
 * Additional agent routing based on content keywords
 */
const SPECIALIZED_ROUTING: { pattern: RegExp; agents: string[] }[] = [
	{
		pattern: /\b(api|REST|endpoint|route)\b/i,
		agents: ["architect", "backend"],
	},
	{
		pattern: /\b(ui|interface|design|button|screen|page)\b/i,
		agents: ["designer", "frontend"],
	},
	{
		pattern: /\b(database|query|migration|schema)\b/i,
		agents: ["database-engineer"],
	},
	{
		pattern: /\b(security|vulnerability|injection|XSS)\b/i,
		agents: ["security"],
	},
	{
		pattern: /\b(deploy|docker|kubernetes|pipeline)\b/i,
		agents: ["devops"],
	},
	{
		pattern: /\b(ci|cd|cicd)\b/i,
		agents: ["devops"],
	},
];

/**
 * SituationDetector class
 * Handles intent classification and agent routing
 */
export class SituationDetector extends EventEmitter {
	constructor() {
		super();
	}

	/**
	 * Detect the intent from user input
	 * @param input - User input string
	 * @returns Classified Intent object
	 */
	detectIntent(input: string): Intent {
		const normalizedInput = input.toLowerCase().trim();
		let bestMatch: KeywordPattern | null = null;
		let highestScore = 0;

		// Find the best matching intent pattern
		for (const pattern of INTENT_PATTERNS) {
			for (const keyword of pattern.keywords) {
				if (keyword.test(normalizedInput)) {
					const score = pattern.baseConfidence;
					if (score > highestScore) {
						highestScore = score;
						bestMatch = pattern;
					}
				}
			}
		}

		// If no match found, default to help
		if (!bestMatch) {
			return {
				type: "help",
				urgency: "low",
				agents_needed: ["pm"],
				confidence: 0.3,
			};
		}

		// Determine urgency based on additional keywords
		const urgency = this.detectUrgency(normalizedInput, bestMatch.urgency);

		// Get base agents for the intent
		const agents = this.getAgentsForIntentByType(bestMatch.type);

		// Add specialized agents based on content
		const specializedAgents = this.detectSpecializedAgents(normalizedInput);
		const allAgents = this.mergeAgentLists(agents, specializedAgents);

		return {
			type: bestMatch.type,
			urgency,
			agents_needed: allAgents,
			confidence: highestScore,
		};
	}

	/**
	 * Detect urgency level from input
	 */
	private detectUrgency(input: string, baseUrgency: UrgencyLevel): UrgencyLevel {
		// High urgency keywords
		const highUrgencyPatterns = [
			/\b(urgent|critical|asap|immediately|now)\b/i,
			/\bsegera\b/i,
			/\b(kritis|darurat)\b/i,
			/\bdown\b/i,
			/\bproduction\s+issue\b/i,
		];

		// Low urgency keywords
		const lowUrgencyPatterns = [
			/\b(eventually|later|sometime|whenever)\b/i,
			/\bkapan\s+kapan\b/i,
			/\b(nanti|kelak)\b/i,
		];

		for (const pattern of highUrgencyPatterns) {
			if (pattern.test(input)) {
				return "high";
			}
		}

		for (const pattern of lowUrgencyPatterns) {
			if (pattern.test(input)) {
				return "low";
			}
		}

		return baseUrgency;
	}

	/**
	 * Get agents for a specific intent type
	 */
	getAgentsForIntent(intent: Intent): string[] {
		return [...intent.agents_needed];
	}

	/**
	 * Get base agents for intent type
	 */
	private getAgentsForIntentByType(type: IntentType): string[] {
		return AGENT_ROUTING[type] || [];
	}

	/**
	 * Detect specialized agents based on content keywords
	 */
	private detectSpecializedAgents(input: string): string[] {
		const agents: string[] = [];

		for (const route of SPECIALIZED_ROUTING) {
			if (route.pattern.test(input)) {
				agents.push(...route.agents);
			}
		}

		return agents;
	}

	/**
	 * Merge agent lists, removing duplicates while preserving order
	 */
	private mergeAgentLists(base: string[], specialized: string[]): string[] {
		const seen = new Set<string>();
		const result: string[] = [];

		for (const agent of [...base, ...specialized]) {
			if (!seen.has(agent)) {
				seen.add(agent);
				result.push(agent);
			}
		}

		return result;
	}

	/**
	 * Route to appropriate agents based on detected intent
	 * Emits events for each agent that needs to be engaged
	 * @param intent - The classified intent
	 */
	routeToAgents(intent: Intent): void {
		this.emit("route:start", intent);

		for (const agent of intent.agents_needed) {
			this.emit("agent:invoke", {
				agent,
				intent: intent.type,
				urgency: intent.urgency,
				confidence: intent.confidence,
			});
		}

		this.emit("route:complete", intent);
	}

	/**
	 * Full detection and routing pipeline
	 * @param input - User input string
	 * @returns The classified intent
	 */
	process(input: string): Intent {
		const intent = this.detectIntent(input);
		this.routeToAgents(intent);
		return intent;
	}
}

/**
 * Factory function to create a new SituationDetector instance
 */
export function createSituationDetector(): SituationDetector {
	return new SituationDetector();
}

/**
 * Convenience function for quick intent detection
 */
export function detectIntent(input: string): Intent {
	const detector = new SituationDetector();
	return detector.detectIntent(input);
}

/**
 * Convenience function to get agents for an intent
 */
export function getAgentsForIntent(intent: Intent): string[] {
	const detector = new SituationDetector();
	return detector.getAgentsForIntent(intent);
}

/**
 * Convenience function to route to agents
 */
export function routeToAgents(intent: Intent): void {
	const detector = new SituationDetector();
	detector.routeToAgents(intent);
}
