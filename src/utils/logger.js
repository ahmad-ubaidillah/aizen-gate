/**
 * Winston Logger for Aizen-Gate
 * Centralized logging with multiple transports
 */
const path = require("node:path");
const { format } = require("winston");
const winston = require("winston");
const { combine, timestamp, printf, colorize, json } = format;

// Log directory
const logDir = process.env.LOG_DIR || path.join(process.cwd(), "logs");

// Determine if development mode
const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Custom format for console output (development)
 */
const consoleFormat = combine(
	colorize(),
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	printf(({ level, message, timestamp, context, ...metadata }) => {
		let msg = `${timestamp} [${level}]`;
		if (context) msg += ` [${context}]`;
		msg += `: ${message}`;
		if (Object.keys(metadata).length > 0) {
			msg += ` ${JSON.stringify(metadata)}`;
		}
		return msg;
	}),
);

/**
 * JSON format for file output (production)
 */
const jsonFormat = combine(
	timestamp(),
	json(({ level, message, timestamp, context, ...metadata }) => ({
		level,
		message,
		timestamp,
		context,
		...metadata,
	})),
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
	format: isDevelopment ? consoleFormat : jsonFormat,
	transports: [
		// Console transport
		new winston.transports.Console({
			format: isDevelopment ? consoleFormat : jsonFormat,
		}),

		// Error log file (rotating daily)
		new winston.transports.DailyRotateFile({
			filename: path.join(logDir, "error-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			level: "error",
			maxSize: "20m",
			maxFiles: "14d",
			zippedArchive: true,
		}),

		// Combined log file (rotating daily)
		new winston.transports.DailyRotateFile({
			filename: path.join(logDir, "combined-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "7d",
			zippedArchive: true,
		}),
	],

	// Handle uncaught exceptions
	exceptionHandlers: [
		new winston.transports.DailyRotateFile({
			filename: path.join(logDir, "exceptions-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],

	// Handle unhandled promise rejections
	rejectionHandlers: [
		new winston.transports.DailyRotateFile({
			filename: path.join(logDir, "rejections-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],
});

/**
 * Create child logger with context
 * @param {string} context - Context name (e.g., 'mcp', 'memory', 'api')
 * @returns {winston.Logger} Child logger
 */
function createChildLogger(context) {
	return logger.child({ context });
}

/**
 * Request ID middleware for express
 * Adds request ID to all logs
 */
function requestIdMiddleware(req, res, next) {
	const requestId =
		req.headers["x-request-id"] || req.headers["x-correlation-id"] || generateRequestId();

	req.requestId = requestId;
	res.setHeader("X-Request-ID", requestId);

	// Attach request ID to logger
	req.logger = logger.child({ requestId, method: req.method, path: req.path });

	next();
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log HTTP request
 */
function logHttpRequest(req, res, durationMs) {
	const level = res.statusCode >= 400 ? "warn" : "info";
	logger.log(level, "HTTP Request", {
		method: req.method,
		path: req.path,
		statusCode: res.statusCode,
		duration: `${durationMs}ms`,
		requestId: req.requestId,
		userAgent: req.get("user-agent"),
	});
}

module.exports = {
	logger,
	createChildLogger,
	requestIdMiddleware,
	logHttpRequest,
	generateRequestId,
};
