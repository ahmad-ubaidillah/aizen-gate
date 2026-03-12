/**
 * AI Questions with Suggestions
 *
 * Phase 4: Conversational AI Features
 * Task 4.1: AI Questions with Suggestions
 *
 * This module provides utilities for creating questions with options,
 * generating suggestion prompts, formatting questions, and parsing answers.
 */

/**
 * Option for a question, containing the key, label, pros, cons, and optional recommendation
 */
export interface QuestionOption {
	key: string;
	label: string;
	pros: string[];
	cons: string[];
	recommendation?: string;
}

/**
 * Complete question structure with text, options, and required flag
 */
export interface Question {
	text: string;
	options: QuestionOption[];
	required: boolean;
}

/**
 * Agent role abbreviation mapping for display in suggestions
 */
const AGENT_ABBREVIATIONS: Record<string, string> = {
	pm: "PM",
	"product-manager": "PM",
	architect: "ARCH",
	designer: "DESIGN",
	developer: "DEV",
	qa: "QA",
	devops: "DEVOPS",
	security: "SEC",
	"database-engineer": "DB",
	analyst: "ANALYST",
	"scrum-master": "SM",
};

/**
 * Creates a Question object with the given text, options, and required flag
 *
 * @param text - The question text to ask the user
 * @param options - Array of QuestionOption objects representing available choices
 * @param required - Whether the question requires an answer (default: true)
 * @returns A Question object
 *
 * @example
 * const question = createQuestion(
 *   'Which authentication method should we use?',
 *   [
 *     {
 *       key: 'A',
 *       label: 'Email + Password',
 *       pros: ['Familiar to users'],
 *       cons: ['Needs forgot password flow']
 *     }
 *   ],
 *   true
 * );
 */
export function createQuestion(
	text: string,
	options: QuestionOption[],
	required: boolean = true,
): Question {
	return {
		text,
		options,
		required,
	};
}

/**
 * Generates a prompt for an AI agent to create suggestion text
 *
 * @param agent - The agent role or name making the suggestion
 * @param context - The context or feature being discussed
 * @param options - Array of QuestionOption objects
 * @returns A formatted prompt string for generating suggestions
 *
 * @example
 * const prompt = generateSuggestionPrompt('PM', 'login feature', [
 *   { key: 'A', label: 'Email + Password', pros: ['Familiar'], cons: ['Reset needed'] },
 *   { key: 'B', label: 'Social Login', pros: ['Fast'], cons: ['API keys'] }
 * ]);
 */
export function generateSuggestionPrompt(
	agent: string,
	context: string,
	options: QuestionOption[],
): string {
	const agentAbbrev = AGENT_ABBREVIATIONS[agent.toLowerCase()] || agent.toUpperCase();

	const optionsSummary = options
		.map((opt) => {
			const prosList = opt.pros.map((p) => `   • ${p}`).join("\n");
			const consList = opt.cons.map((c) => `   • ${c}`).join("\n");
			return `${opt.key}) ${opt.label}\n   Pros:\n${prosList}\n   Cons:\n${consList}`;
		})
		.join("\n\n");

	const recommendationSection = options.some((opt) => opt.recommendation)
		? `\n👉 I recommend **${getRecommendedOption(options).key}** because:\n${getRecommendedOption(options).recommendation}`
		: "";

	return `[${agentAbbrev}] For ${context}, here are ${options.length} approaches:\n\n${optionsSummary}\n${recommendationSection}\n\nYour choice? (${options.map((o) => o.key).join(" or ")})`;
}

/**
 * Helper to get the recommended option from a list
 */
function getRecommendedOption(options: QuestionOption[]): QuestionOption {
	return options.find((opt) => opt.recommendation) || options[0];
}

/**
 * Formats a Question object into a readable string with options
 *
 * @param question - The Question object to format
 * @returns A formatted string representation of the question
 *
 * @example
 * const question = createQuestion('Choose auth method?', [
 *   { key: 'A', label: 'Email', pros: ['Familiar'], cons: ['Reset'] }
 * ]);
 * console.log(formatQuestionWithOptions(question));
 * // Output:
 * // Question: Choose auth method?
 * //
 * // A) Email
 * //    Pros:
 * //    • Familiar
 * //    Cons:
 * //    • Reset
 * //
 * // Required: true
 * // Your choice? (A)
 */
export function formatQuestionWithOptions(question: Question): string {
	const optionsText = question.options
		.map((opt) => {
			const prosText =
				opt.pros.length > 0 ? `\n   Pros:\n${opt.pros.map((p) => `   • ${p}`).join("\n")}` : "";
			const consText =
				opt.cons.length > 0 ? `\n   Cons:\n${opt.cons.map((c) => `   • ${c}`).join("\n")}` : "";
			const recommendationText = opt.recommendation
				? `\n   Recommendation: ${opt.recommendation}`
				: "";

			return `${opt.key}) ${opt.label}${prosText}${consText}${recommendationText}`;
		})
		.join("\n\n");

	const requiredText = question.required ? "Required" : "Optional";

	return `Question: ${question.text}\n\n${optionsText}\n\n${requiredText}\nYour choice? (${question.options.map((o) => o.key).join(" or ")})`;
}

/**
 * Parses a user's answer and returns the selected option key
 *
 * @param answer - The user's answer string
 * @param options - Array of QuestionOption objects to match against
 * @returns The key of the selected option, or empty string if invalid
 *
 * @example
 * const options = [
 *   { key: 'A', label: 'Email + Password', pros: [], cons: [] },
 *   { key: 'B', label: 'Social Login', pros: [], cons: [] }
 * ];
 *
 * parseAnswer('A', options);    // Returns 'A'
 * parseAnswer('b', options);    // Returns 'B' (case insensitive)
 * parseAnswer('Social Login', options); // Returns 'B' (matches label)
 * parseAnswer('invalid', options);      // Returns ''
 */
export function parseAnswer(answer: string, options: QuestionOption[]): string {
	if (!answer || typeof answer !== "string") {
		return "";
	}

	const normalizedAnswer = answer.trim().toLowerCase();

	// Try to match by key (case insensitive)
	for (const option of options) {
		if (option.key.toLowerCase() === normalizedAnswer) {
			return option.key;
		}
	}

	// Try to match by label (case insensitive)
	for (const option of options) {
		if (option.label.toLowerCase() === normalizedAnswer) {
			return option.key;
		}
	}

	// Try partial match on label
	for (const option of options) {
		if (option.label.toLowerCase().includes(normalizedAnswer)) {
			return option.key;
		}
	}

	// Try partial match on key
	for (const option of options) {
		if (
			option.key.toLowerCase() === normalizedAnswer ||
			normalizedAnswer.includes(option.key.toLowerCase())
		) {
			return option.key;
		}
	}

	return "";
}

/**
 * Validates if an answer is valid for the given question
 *
 * @param answer - The user's answer string
 * @param question - The Question object to validate against
 * @returns True if the answer is valid, false otherwise
 *
 * @example
 * const question = createQuestion('Choose auth?', [
 *   { key: 'A', label: 'Email', pros: [], cons: [] }
 * ], true);
 *
 * validateAnswer('A', question);  // Returns true
 * validateAnswer('invalid', question); // Returns false
 */
export function validateAnswer(answer: string, question: Question): boolean {
	const parsedKey = parseAnswer(answer, question.options);

	if (!parsedKey && question.required) {
		return false;
	}

	return true;
}

/**
 * Creates a suggestion formatted for display with pros/cons and recommendation
 *
 * @param agent - The agent role making the suggestion
 * @param context - The context being discussed
 * @param options - Array of QuestionOption objects
 * @returns Formatted suggestion string
 *
 * @example
 * const suggestion = formatSuggestion('pm', 'login feature', [
 *   {
 *     key: 'A',
 *     label: 'Email + Password',
 *     pros: ['Familiar to users'],
 *     cons: ['Needs forgot password flow']
 *   },
 *   {
 *     key: 'B',
 *     label: 'Social Login (Google/GitHub)',
 *     pros: ['One-click', 'Higher conversion'],
 *     cons: ['Needs API credentials'],
 *     recommendation: '1. Faster for MVP\n2. Higher conversion rate\n3. No forgot password needed'
 *   }
 * ]);
 */
export function formatSuggestion(
	agent: string,
	context: string,
	options: QuestionOption[],
): string {
	const agentAbbrev = AGENT_ABBREVIATIONS[agent.toLowerCase()] || agent.toUpperCase();

	const optionsText = options
		.map((opt) => {
			const prosList = opt.pros.length > 0 ? `\n   • Pros: ${opt.pros.join(", ")}` : "";
			const consList = opt.cons.length > 0 ? `\n   • Cons: ${opt.cons.join(", ")}` : "";

			return `${opt.key}) ${opt.label}${prosList}${consList}`;
		})
		.join("\n\n");

	const recommendedOption = options.find((opt) => opt.recommendation);
	const recommendationText = recommendedOption
		? `\n\n👉 I recommend **${recommendedOption.key}** because:\n   ${recommendedOption.recommendation?.replace(/\n/g, "\n   ")}`
		: "";

	return `[${agentAbbrev}] For ${context}, here are ${options.length} approaches:\n\n${optionsText}${recommendationText}\n\nYour choice? (${options.map((o) => o.key).join(" or ")})`;
}

/**
 * Gets the full option object by its key
 *
 * @param key - The option key to find
 * @param options - Array of QuestionOption objects
 * @returns The QuestionOption object if found, undefined otherwise
 *
 * @example
 * const options = [
 *   { key: 'A', label: 'Email', pros: [], cons: [] },
 *   { key: 'B', label: 'Social', pros: [], cons: [] }
 * ];
 *
 * getOptionByKey('A', options);  // Returns { key: 'A', label: 'Email', ... }
 * getOptionByKey('C', options);  // Returns undefined
 */
export function getOptionByKey(key: string, options: QuestionOption[]): QuestionOption | undefined {
	const normalizedKey = key.trim().toLowerCase();
	return options.find((opt) => opt.key.toLowerCase() === normalizedKey);
}
