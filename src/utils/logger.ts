/**
 * Winston Logger for Aizen-Gate
 * Centralized logging with multiple transports
 */
import path from "node:path";
import type { Request, Response } from "express";
import winston, { format, type Logger, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

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
	printf(({ level, message, timestamp: ts, context, ...metadata }) => {
		let msg = `${ts} [${level}]`;
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
const jsonLogFormat = combine(timestamp(), json());

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
	format: isDevelopment ? consoleFormat : jsonLogFormat,
	transports: [
		// Console transport
		new transports.Console({
			format: isDevelopment ? consoleFormat : jsonLogFormat,
		}),

		// Error log file (rotating daily)
		new DailyRotateFile({
			filename: path.join(logDir, "error-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			level: "error",
			maxSize: "20m",
			maxFiles: "14d",
			zippedArchive: true,
		}),

		// Combined log file (rotating daily)
		new DailyRotateFile({
			filename: path.join(logDir, "combined-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "7d",
			zippedArchive: true,
		}),
	],

	// Handle uncaught exceptions
	exceptionHandlers: [
		new DailyRotateFile({
			filename: path.join(logDir, "exceptions-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],

	// Handle unhandled promise rejections
	rejectionHandlers: [
		new DailyRotateFile({
			filename: path.join(logDir, "rejections-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],
});

/**
 * Create child logger with context
 * @param context - Context name (e.g., 'mcp', 'memory', 'api')
 * @returns Child logger
 */
export function createChildLogger(context: string): Logger {
	return logger.child({ context });
}

/**
 * Express request with custom Aizen properties
 */
export interface AizenRequest extends Request {
	requestId?: string;
	logger?: Logger;
}

/**
 * Request ID middleware for express
 * Adds request ID to all logs
 */
export function requestIdMiddleware(req: AizenRequest, res: Response, next: () => void): void {
	const requestId =
		(req.headers["x-request-id"] as string) ||
		(req.headers["x-correlation-id"] as string) ||
		generateRequestId();

	req.requestId = requestId;
	res.setHeader("X-Request-ID", requestId);

	// Attach request ID to logger
	req.logger = logger.child({ requestId, method: req.method, path: req.path });

	next();
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Log HTTP request
 */
export function logHttpRequest(req: AizenRequest, res: Response, durationMs: number): void {
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

export { logger as default };
