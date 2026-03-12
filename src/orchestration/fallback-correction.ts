/**
 * Fallback Correction System
 * Phase 3.3: Allows users to correct Aizen's intent detection
 */

import { AGENT_ROUTING, DEFAULT_URGENCY, type Intent, type IntentType } from "./situation-detector";

/**
 * Mapping of correction codes to intent types
 */
const CORRECTION_MAP: Record<string, IntentType> = {
	f: "feature",
	F: "feature",
	b: "bug",
	B: "bug",
	o: "optimization",
	O: "optimization",
	d: "discussion",
	D: "discussion",
	r: "review",
	R: "review",
	h: "help",
	H: "help",
};

/**
 * CorrectionPrompt interface
 * Represents the correction prompt shown to users
 */
export interface CorrectionPrompt {
	detectedIntent: Intent;
	promptText: string;
	timestamp: Date;
}

/**
 * Generate a correction prompt for the detected intent
 * @param detectedIntent - The originally detected Intent object
 * @returns CorrectionPrompt object with formatted prompt text
 */
export function generateCorrectionPrompt(detectedIntent: Intent): CorrectionPrompt {
	const agentsList = detectedIntent.agents_needed.join(" + ");
	const intentLabel = capitalizeFirst(detectedIntent.type);

	const promptText = `[AZ] I detected this as "${intentLabel}". Calling [${agentsList}].

If incorrect, please correct me:
- [F] = Feature
- [B] = Bug
- [O] = Optimization
- [D] = Discussion
- [R] = Review
- [H] = Help`;

	return {
		detectedIntent,
		promptText,
		timestamp: new Date(),
	};
}

/**
 * Parse the user's correction response
 * @param response - The user's correction response (single letter)
 * @returns IntentType if valid correction, null otherwise
 */
export function parseCorrection(response: string): IntentType | null {
	const normalized = response.trim().toLowerCase();
	const intentType = CORRECTION_MAP[normalized];

	return intentType || null;
}

/**
 * Handle the user's correction and return the corrected intent
 * @param originalIntent - The original detected intent
 * @param correction - The user's correction response
 * @returns Corrected Intent object
 */
export function handleCorrection(originalIntent: Intent, correction: string): Intent {
	const correctedType = parseCorrection(correction);

	// If correction is invalid, return original intent
	if (!correctedType) {
		return originalIntent;
	}

	// Get agents for the corrected intent type
	const agentsNeeded = AGENT_ROUTING[correctedType] || [];

	return {
		type: correctedType,
		urgency: DEFAULT_URGENCY[correctedType],
		agents_needed: agentsNeeded,
		confidence: 1.0, // User-confirmed correction = 100% confidence
	};
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create a correction prompt and return it as a formatted string
 * @param detectedIntent - The detected intent
 * @returns Formatted prompt string ready for display
 */
export function createCorrectionPromptString(detectedIntent: Intent): string {
	return generateCorrectionPrompt(detectedIntent).promptText;
}

/**
 * Validate if a correction code is valid
 * @param correction - The correction code to validate
 * @returns true if valid, false otherwise
 */
export function isValidCorrection(correction: string): boolean {
	const normalized = correction.trim().toLowerCase();
	return normalized in CORRECTION_MAP;
}

/**
 * Get all supported correction codes
 * @returns Array of supported correction codes
 */
export function getSupportedCorrections(): string[] {
	return Object.keys(CORRECTION_MAP);
}

/**
 * Example usage:
 *
 * ```typescript
 * import {
 *   generateCorrectionPrompt,
 *   parseCorrection,
 *   handleCorrection
 * } from './fallback-correction';
 *
 * // Example 1: Generate correction prompt
 * const detectedIntent = {
 *   type: 'bug',
 *   urgency: 'high',
 *   agents_needed: ['developer', 'qa'],
 *   confidence: 0.85
 * };
 *
 * const prompt = generateCorrectionPrompt(detectedIntent);
 * console.log(prompt.promptText);
 * // Output:
 * // [AZ] I detected this as "Bug". Calling [developer + QA].
 * //
 * // If incorrect, please correct me:
 * // - [F] = Feature
 * // - [B] = Bug
 * // - [O] = Optimization
 * // - [D] = Discussion
 * // - [R] = Review
 * // - [H] = Help
 *
 * // Example 2: Parse user correction
 * const userCorrection = 'F';
 * const parsed = parseCorrection(userCorrection);
 * console.log(parsed); // 'feature'
 *
 * // Example 3: Handle correction and get corrected intent
 * const correctedIntent = handleCorrection(detectedIntent, 'F');
 * console.log(correctedIntent);
 * // Output:
 * // {
 * //   type: 'feature',
 * //   urgency: 'medium',
 * //   agents_needed: ['pm', 'architect', 'developer'],
 * //   confidence: 1.0
 * // }
 *
 * // Example 4: Case-insensitive parsing
 * console.log(parseCorrection('f'));  // 'feature'
 * console.log(parseCorrection('F'));  // 'feature'
 * console.log(parseCorrection('bug')); // null (not a valid single-letter code)
 *
 * // Example 5: Validate correction codes
 * console.log(isValidCorrection('F')); // true
 * console.log(isValidCorrection('X')); // false
 * console.log(getSupportedCorrections()); // ['f', 'F', 'b', 'B', 'o', 'O', 'd', 'D', 'r', 'R', 'h', 'H']
 * ```
 */
