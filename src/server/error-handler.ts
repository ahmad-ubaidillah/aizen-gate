/**
 * Global Error Handler Middleware
 * Catches and formats all unhandled errors
 */
import type { NextFunction, Request, Response } from "express";
import { BaseError, TimeoutError, ValidationError } from "../errors/index.js";

/**
 * Sanitized error response
 */
export interface SanitizedError {
	message: string;
	code: string;
	stack?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Sanitize error message for production
 * @param error - Original error
 * @param isProduction - Whether running in production
 * @returns Sanitized error object
 */
export function sanitizeError(error: Error, isProduction = false): SanitizedError {
	const baseResponse: SanitizedError = {
		message: error.message,
		code: (error as BaseError).code || "INTERNAL_ERROR",
	};

	// Add stack trace only in development
	if (!isProduction && error.stack) {
		baseResponse.stack = error.stack.split("\n").slice(0, 3).join("\n");
	}

	// Add metadata if available
	if ((error as BaseError).metadata) {
		baseResponse.metadata = (error as BaseError).metadata as Record<string, unknown>;
	}

	return baseResponse;
}

/**
 * Express error handler middleware
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
	// Determine if production
	const isProduction = process.env.NODE_ENV === "production";

	// Log the error
	console.error(`[ERROR] ${err.name}: ${err.message}`);
	if (!isProduction) {
		console.error(err.stack);
	}

	// Handle known error types
	if (err instanceof ValidationError) {
		res.status(400).json(sanitizeError(err, isProduction));
		return;
	}

	if (err instanceof TimeoutError) {
		res.status(504).json(sanitizeError(err, isProduction));
		return;
	}

	if (err instanceof BaseError) {
		res.status((err as BaseError).statusCode || 500).json(sanitizeError(err, isProduction));
		return;
	}

	// Handle unknown errors
	const statusCode = (err as BaseError).statusCode || 500;
	const response: SanitizedError = {
		message: isProduction ? "An unexpected error occurred" : err.message,
		code: "INTERNAL_ERROR",
	};

	if (!isProduction) {
		response.stack = err.stack?.split("\n").slice(0, 3).join("\n");
	}

	res.status(statusCode).json(response);
}

/**
 * Async function type
 */
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Async error wrapper
 * Catches async errors and passes to error handler
 * @param fn - Async function to wrap
 * @returns Wrapped function
 */
export function asyncHandler(
	fn: AsyncFunction,
): (req: Request, res: Response, next: NextFunction) => void {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
	res.status(404).json({
		message: `Route ${req.method} ${req.path} not found`,
		code: "NOT_FOUND",
	});
}
