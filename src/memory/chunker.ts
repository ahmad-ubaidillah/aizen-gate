import chalk from "chalk";

/**
 * [AZ] Chunker
 * Splits code into logical blocks based on structural boundaries.
 */
export class Chunker {
	/**
	 * Splits code into chunks. Prefers structural boundaries (class, function, etc.)
	 */
	public static chunk(content: string, type: "code" | "text" = "code"): string[] {
		if (!content) return [];

		if (type === "text") {
			// Simple paragraph chunking for text
			return content.split(/\n\s*\n/).filter((c) => c.length > 50);
		}

		// Code Chunking: Split by exported functions, classes, or blocks
		// This is a heuristic-based contextual chunker
		const structuralMarkers = [
			/\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?(?:class|function|interface|const|async|enum)/g,
			/(?:export\s+)?(?:class|function|interface|const|async|enum)\s+[\w\d_]+/g,
		];

		const chunks: string[] = [];
		const _lastIndex = 0;

		// Use the best marker (docblocks are ideal)
		const matches = [...content.matchAll(structuralMarkers[0])];

		if (matches.length > 0) {
			for (let i = 0; i < matches.length; i++) {
				const start = matches[i].index!;
				const end = i < matches.length - 1 ? matches[i + 1].index! : content.length;
				const chunk = content.slice(start, end).trim();
				if (chunk.length > 100) chunks.push(chunk);
			}
		} else {
			// Fallback: Split by lines if no obvious structural markers
			const lines = content.split("\n");
			let current = "";
			for (const line of lines) {
				current += `${line}\n`;
				if (current.length > 1000) {
					chunks.push(current.trim());
					current = "";
				}
			}
			if (current.trim()) chunks.push(current.trim());
		}

		console.log(chalk.gray(`[AZ] Content chunked into ${chunks.length} fragments.`));
		return chunks;
	}
}
