import chalk from "chalk";
import { createLlamaBridge } from "./llama-bridge.js";

/**
 * [AZ] QueryExpander
 * Generates technical variations of a query to catch broader context.
 */
export class QueryExpander {
	private static instance: QueryExpander;
	private llama = createLlamaBridge();

	private constructor() {}

	public static getInstance(): QueryExpander {
		if (!QueryExpander.instance) {
			QueryExpander.instance = new QueryExpander();
		}
		return QueryExpander.instance;
	}

	/**
	 * Expands a single query into multiple technical variations.
	 */
	public async expand(query: string): Promise<string[]> {
		const prompt = `
[SYSTEM: TECHNICAL QUERY EXPANDER]
You are Aizen-Architect. Expand the following task into 3 distinct technical search queries.
Goal: Catch relevant code patterns, architectural rules, and past failure logs.

Task: "${query}"

Output exactly 3 search terms, one per line. No numbering, no symbols.
Example:
Implementing a new API endpoint
Express.js routes patterns
REST API implementation best practices
Error handling in Express controllers

Queries:`;

		try {
			const response = await this.llama.generate(prompt, {
				temperature: 0.3,
				maxTokens: 100,
			});

			const variations = response
				.split("\n")
				.map((q) => q.trim())
				.filter((q) => q.length > 0)
				.slice(0, 3);

			// Always include original query
			if (!variations.includes(query)) {
				variations.unshift(query);
			}

			console.log(chalk.blue(`[AZ] Query expanded into ${variations.length} variations.`));
			return variations;
		} catch (err) {
			console.error("[AZ] Query expansion failed, falling back to original query.", err);
			return [query];
		}
	}
}
