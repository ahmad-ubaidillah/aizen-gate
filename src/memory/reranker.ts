import { localEmbedding } from "./local-embed.js";

/**
 * [AZ] ReRanker
 * Performs semantic re-ranking on candidate items using cross-similarity checks.
 */
export class ReRanker {
	private static instance: ReRanker;

	private constructor() {}

	public static getInstance(): ReRanker {
		if (!ReRanker.instance) {
			ReRanker.instance = new ReRanker();
		}
		return ReRanker.instance;
	}

	/**
	 * Re-ranks items based on deeper semantic analysis.
	 */
	public async rerank(query: string, items: any[]): Promise<any[]> {
		if (items.length <= 1) return items;

		const _queryVector = await localEmbedding.embed(query);

		const reranked = items.map((item) => {
			let crossScore = 0;

			// If item has content_raw, use it for deeper check (heuristic)
			if (item.content_raw) {
				// Simple heuristic: Keyword density in raw code
				const keywords = query
					.toLowerCase()
					.split(/\s+/)
					.filter((k) => k.length > 3);
				const matches = keywords.filter((k) => item.content_raw.toLowerCase().includes(k)).length;
				crossScore = matches / (keywords.length || 1);
			}

			// Hybrid score: Original score (cosine) + Cross-match heuristic
			const finalScore = item.finalScore * 0.7 + crossScore * 0.3;
			return { ...item, finalScore };
		});

		return reranked.sort((a, b) => b.finalScore - a.finalScore);
	}
}
