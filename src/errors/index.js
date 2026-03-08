/**
 * Aizen-Gate Error System
 * Centralized error handling with typed errors
 */
const { BaseError } = require("./base-error");
const { ValidationError } = require("./validation-error");
const { RuntimeError } = require("./runtime-error");
const { TimeoutError } = require("./timeout-error");

/**
 * Error Codes
 */
const ERROR_CODES = {
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
};

/**
 * Wrap a function to convert errors to typed errors
 * @param {Function} fn - Function to wrap
 * @param {string} operation - Operation name for context
 * @returns {Function} Wrapped function
 */
function withErrorContext(fn, operation) {
	return async (...args) => {
		try {
			return await fn(...args);
		} catch (error) {
			if (error instanceof BaseError) {
				throw error;
			}
			throw new RuntimeError(error.message || "Unknown error", operation, error);
		}
	};
}

module.exports = {
	BaseError,
	ValidationError,
	RuntimeError,
	TimeoutError,
	ERROR_CODES,
	withErrorContext,
};
