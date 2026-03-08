/**
 * Global Error Handler Middleware
 * Catches and formats all unhandled errors
 */
const { BaseError, ValidationError, RuntimeError, TimeoutError } = require("../errors");

/**
 * Sanitize error message for production
 * @param {Error} error - Original error
 * @param {boolean} isProduction - Whether running in production
 * @returns {object} Sanitized error object
 */
function sanitizeError(error, isProduction = false) {
	const baseResponse = {
		message: error.message,
		code: error.code || "INTERNAL_ERROR",
	};

	// Add stack trace only in development
	if (!isProduction && error.stack) {
		baseResponse.stack = error.stack.split("\n").slice(0, 3).join("\n");
	}

	// Add metadata if available
	if (error.metadata) {
		baseResponse.metadata = error.metadata;
	}

	return baseResponse;
}

/**
 * Express error handler middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {Function} next - Express next
 */
function errorHandler(err, req, res, next) {
	// Determine if production
	const isProduction = process.env.NODE_ENV === "production";

	// Log the error
	console.error(`[ERROR] ${err.name}: ${err.message}`);
	if (!isProduction) {
		console.error(err.stack);
	}

	// Handle known error types
	if (err instanceof ValidationError) {
		return res.status(400).json(sanitizeError(err, isProduction));
	}

	if (err instanceof TimeoutError) {
		return res.status(504).json(sanitizeError(err, isProduction));
	}

	if (err instanceof BaseError) {
		return res.status(err.statusCode || 500).json(sanitizeError(err, isProduction));
	}

	// Handle unknown errors
	const statusCode = err.statusCode || 500;
	const response = {
		message: isProduction ? "An unexpected error occurred" : err.message,
		code: "INTERNAL_ERROR",
	};

	if (!isProduction) {
		response.stack = err.stack?.split("\n").slice(0, 3).join("\n");
	}

	res.status(statusCode).json(response);
}

/**
 * Async error wrapper
 * Catches async errors and passes to error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Not found handler
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function notFoundHandler(req, res) {
	res.status(404).json({
		message: `Route ${req.method} ${req.path} not found`,
		code: "NOT_FOUND",
	});
}

module.exports = {
	errorHandler,
	asyncHandler,
	notFoundHandler,
	sanitizeError,
};
