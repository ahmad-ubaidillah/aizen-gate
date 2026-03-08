import { BaseError } from "./base-error.js";
import { RuntimeError } from "./runtime-error.js";
import { TimeoutError } from "./timeout-error.js";
import { ValidationError } from "./validation-error.js";

// Re-export error classes
export { BaseError, RuntimeError, TimeoutError, ValidationError };
export type { BaseErrorOptions, ErrorMetadata } from "./base-error.js";

/**
 * Error Codes
 */
export const ERROR_CODES = {
	// Validation errors (4xx)
	VALIDATION_ERROR: "VALIDATION_ERROR",
	INVALID_INPUT: "INVALID_INPUT",
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",

	// Runtime errors (5xx)
	RUNTIME_ERROR: "RUNTIME_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR",
	NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
	INTERNAL_ERROR: "INTERNAL_ERROR",

	// External errors
	MCP_ERROR: "MCP_ERROR",
	DATABASE_ERROR: "DATABASE_ERROR",
	EXECUTION_ERROR: "EXECUTION_ERROR",
} as const;

/**
 * Wrap a function to convert errors to typed errors
 * @param fn - Function to wrap
 * @param operation - Operation name for context
 * @returns Wrapped function
 */
export function withErrorContext<T extends (...args: unknown[]) => Promise<unknown>>(
	fn: T,
	operation: string,
): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			throw new RuntimeError(
				error instanceof Error ? error.message : "Unknown error",
				operation,
				error,
			);
		}
	}) as T;
}
