/**
 * Aizen-Gate WASM Core
 * Written in AssemblyScript for Near-Native Performance
 * 
 * Logic: Jaccard Similarity & Heuristic Distill
 */

export function jaccardSimilarity(tokensA: string[], tokensB: string[]): f32 {
    let intersection: i32 = 0;
    const setA = new Set<string>();
    
    for (let i = 0; i < tokensA.length; i++) {
        setA.add(tokensA[i]);
    }
    
    const setBSize = tokensB.length;
    for (let j = 0; j < setBSize; j++) {
        if (setA.has(tokensB[j])) {
            intersection++;
        }
    }
    
    // Union = A + B - Intersection
    // Note: This is an approximation since we don't deduplicate tokensB here for speed
    // Higher precision would require proper Set logic for both.
    const union = setA.size + setBSize - intersection;
    if (union == 0) return 0.0;
    
    return <f32>intersection / <f32>union;
}

export function heuristicDistill(content: string): string {
    // Simple distilled logic: extract uppercase words and numbers as "Core Logic"
    // (Actual pattern matching in WASM can be more complex)
    return content.split(" ").filter(w => w.length > 3).join(", ");
}

export function getVersion(): string {
    return "Aizen-WASM-v1.0.0-Stable";
}
