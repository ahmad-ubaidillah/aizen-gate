/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/aizen/jaccardSimilarity
 * @param tokensA `~lib/array/Array<~lib/string/String>`
 * @param tokensB `~lib/array/Array<~lib/string/String>`
 * @returns `f32`
 */
export declare function jaccardSimilarity(tokensA: Array<string>, tokensB: Array<string>): number;
/**
 * assembly/aizen/heuristicDistill
 * @param content `~lib/string/String`
 * @returns `~lib/string/String`
 */
export declare function heuristicDistill(content: string): string;
/**
 * assembly/aizen/getVersion
 * @returns `~lib/string/String`
 */
export declare function getVersion(): string;
