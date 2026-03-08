import path from "node:path";

/**
 * [AZ] Input Sanitizer & Validator
 * Provides comprehensive input validation and sanitization for security
 */

/**
 * Path traversal prevention - blocks attempts to access files outside project root
 */
export function sanitizePath(userPath: string, projectRoot: string): string {
	// Normalize the user-provided path
	const normalized = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, "");

	// Resolve to absolute path
	const resolved = path.resolve(projectRoot, normalized);

	// Ensure the resolved path is within project root
	if (!resolved.startsWith(path.resolve(projectRoot))) {
		throw new Error("Access denied: Path traversal attempt detected");
	}

	return resolved;
}

/**
 * SQL injection prevention - sanitizes values for database queries
 */
export function sanitizeSQL(value: any): any {
	if (typeof value !== "string") return value;

	// Escape single quotes and semicolons
	return value.replace(/'/g, "''").replace(/;/g, "").replace(/--/g, "").replace(/\/\*/g, "");
}

/**
 * Command injection prevention - sanitizes shell command arguments
 */
export function sanitizeCommandArg(arg: any): any {
	if (typeof arg !== "string") return arg;

	// Block dangerous characters
	const dangerous = /[;&|`$(){}<>]/;
	if (dangerous.test(arg)) {
		throw new Error("Invalid characters in command argument");
	}

	return arg.trim();
}

/**
 * Task ID validation - ensures task IDs follow expected format
 */
export function validateTaskId(id: any): boolean {
	if (!id || typeof id !== "string") return false;

	// Expected format: aizen-001, aizen-123, etc.
	return /^aizen-\d{3,}$/i.test(id);
}

/**
 * File name sanitization - prevents invalid file names
 */
export function sanitizeFilename(filename: any): string {
	if (!filename || typeof filename !== "string") return "";

	// Remove or replace dangerous characters
	return filename
		.replace(/[<>:"/\\|?*]/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

/**
 * YAML content sanitization - prevents injection
 */
export function sanitizeYAMLContent(content: any): string {
	if (typeof content !== "string") return "";

	// Prevent template injection
	return content
		.replace(/\{\{/g, "&#123;&#123;")
		.replace(/\}\}/g, "&#125;&#125;")
		.replace(/<script/gi, "<script")
		.replace(/javascript:/gi, "");
}

/**
 * Email validation
 */
export function isValidEmail(email: any): boolean {
	if (!email || typeof email !== "string") return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidURL(url: any): boolean {
	if (!url || typeof url !== "string") return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Rate limiter - simple in-memory rate limiter
 */
export class RateLimiter {
	private maxRequests: number;
	private windowMs: number;
	private requests: Map<string, any>;

	constructor(maxRequests = 100, windowMs = 60000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
		this.requests = new Map();
	}

	isAllowed(identifier: string): boolean {
		const now = Date.now();
		const key = identifier || "default";

		// Clean old entries
		this.cleanup(key, now);

		const count = this.requests.get(key) || 0;

		if (count >= this.maxRequests) {
			return false;
		}

		this.requests.set(key, count + 1);
		return true;
	}

	private cleanup(key: string, now: number): void {
		const timestamps: number[] = this.requests.get(`${key}_ts`) || [];
		const valid = timestamps.filter((ts: number) => now - ts < this.windowMs);

		if (valid.length === 0) {
			this.requests.delete(key);
			this.requests.delete(`${key}_ts`);
		} else {
			this.requests.set(`${key}_ts`, valid);
		}
	}
}
