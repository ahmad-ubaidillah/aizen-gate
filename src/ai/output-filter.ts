/**
 * [RTK] Output Filter Engine
 *
 * Intercepts tool/command output and applies 6 semantic compression strategies.
 * High-performance, heuristic-based, zero extra LLM cost.
 */

/**
 * Filter levels
 */
export type FilterLevel = "minimal" | "balanced" | "aggressive";

/**
 * Filter options
 */
export interface FilterOptions {
	level?: FilterLevel;
}

/**
 * [RTK] Output Filter Engine
 */
export class OutputFilter {
	public options: FilterOptions;

	constructor(options: FilterOptions = {}) {
		this.options = {
			level: "balanced", // 'minimal' | 'balanced' | 'aggressive'
			...options,
		};
	}

	/**
	 * Main entry point for filtering tool output.
	 */
	filter(rawText: string, commandType: string): string {
		if (!rawText || this.options.level === "minimal") return rawText;

		switch (commandType) {
			case "git_status":
				return this.filterGitStatus(rawText);
			case "git_diff":
				return this.filterGitDiff(rawText);
			case "git_log":
				return this.filterGitLog(rawText);
			case "ls_la":
				return this.filterLsLa(rawText);
			case "npm_test":
				return this.filterTestOutput(rawText);
			case "cat":
				return this.filterCatOutput(rawText);
			case "json":
				return this.filterJSON(rawText);
			case "logs":
				return this.filterLogs(rawText);
			default:
				return this.filterGeneric(rawText);
		}
	}

	/**
	 * Strategy: Stats Extraction for Git Status.
	 */
	filterGitStatus(text: string): string {
		const lines = text.split("\n");
		let staged = 0;
		let modified = 0;
		let untracked = 0;

		lines.forEach((l) => {
			if (l.match(/^(M|A|D|R|C|U)\s/)) staged++;
			else if (l.includes("modified:")) modified++;
			else if (l.includes("untracked") || l.match(/^\??\s/)) untracked++;
		});

		if (staged + modified + untracked === 0) return "Working tree clean ✓";

		return `Git Status: ${staged} staged, ${modified} modified, ${untracked} untracked. [RTK Compact Stats]`;
	}

	/**
	 * Strategy: Tree Compression for Ls -la.
	 */
	filterLsLa(text: string): string {
		const lines = text.split("\n").filter((l) => l.trim() && !l.includes("total "));
		if (lines.length > 20) {
			const top = lines.slice(0, 10);
			const bottom = lines.slice(-5);
			return [
				...top,
				`... [${lines.length - 15} files hidden via RTK Tree Compression] ...`,
				...bottom,
			].join("\n");
		}
		return text;
	}

	/**
	 * Strategy: Error-Only for Test Outputs.
	 */
	filterTestOutput(text: string): string {
		// Only keep lines with 'FAIL', 'Error:', or summary stats
		const lines = text.split("\n");
		const filtered = lines.filter(
			(l) =>
				l.includes("FAIL") ||
				l.includes("Error:") ||
				l.includes("failed") ||
				l.includes("PASS") ||
				l.match(/Tests:\s+\d+/i),
		);

		if (filtered.length === 0) return "Tests passed (details omitted) ✓";
		return filtered.join("\n");
	}

	/**
	 * Strategy: Code Signature Extraction (Cat / Read).
	 */
	filterCatOutput(text: string): string {
		if (this.options.level === "aggressive") {
			// Keep only function/class signatures, strip bodies
			return text.replace(/\{[\s\S]*?\n\}/g, "{ ... [Body stripped by RTK] }");
		}
		// Minimal: Strip comments
		return text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1").trim();
	}

	/**
	 * Strategy: Deduplication for Logs.
	 */
	filterLogs(text: string): string {
		const lines = text.split("\n");
		const counts = new Map<string, number>();
		const result: string[] = [];

		lines.forEach((l) => {
			const entry = l.trim();
			if (!entry) return;
			counts.set(entry, (counts.get(entry) || 0) + 1);
		});

		counts.forEach((count, line) => {
			result.push(count > 1 ? `${line} [×${count}]` : line);
		});

		return result.join("\n");
	}

	/**
	 * Strategy: Structure-Only (JSON schema extraction).
	 */
	filterJSON(text: string): string {
		try {
			const data = JSON.parse(text);
			// Recursively extract keys and types
			const getSchema = (obj: unknown): unknown => {
				if (Array.isArray(obj)) return obj.length > 0 ? [getSchema(obj[0])] : [];
				if (obj !== null && typeof obj === "object") {
					const schema: Record<string, unknown> = {};
					Object.keys(obj as object).forEach((k) => {
						schema[k] = getSchema((obj as Record<string, unknown>)[k]);
					});
					return schema;
				}
				return typeof obj;
			};
			return `${JSON.stringify(getSchema(data), null, 2)}\n[RTK Schema-Only Extraction]`;
		} catch {
			return text;
		}
	}

	/**
	 * Fallback: Truncate long irrelevant noise.
	 */
	filterGeneric(text: string): string {
		if (text.length > 2000) {
			return (
				text.slice(0, 500) +
				`\n\n... [RTK Generic Truncation: ${text.length - 1000} chars removed] ...\n\n` +
				text.slice(-500)
			);
		}
		return text;
	}

	/**
	 * Placeholder for git diff filtering
	 */
	filterGitDiff(text: string): string {
		return this.filterGeneric(text);
	}

	/**
	 * Placeholder for git log filtering
	 */
	filterGitLog(text: string): string {
		return this.filterGeneric(text);
	}
}
