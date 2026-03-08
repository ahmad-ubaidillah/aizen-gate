/**
 * [AZ] Input Sanitizer & Validator
 * Provides comprehensive input validation and sanitization for security
 */

// Path traversal prevention - blocks attempts to access files outside project root
function sanitizePath(userPath, projectRoot) {
	const path = require("node:path");

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

// SQL injection prevention - sanitizes values for database queries
function sanitizeSQL(value) {
	if (typeof value !== "string") return value;

	// Escape single quotes and semicolons
	return value.replace(/'/g, "''").replace(/;/g, "").replace(/--/g, "").replace(/\/\*/g, "");
}

// Command injection prevention - sanitizes shell command arguments
function sanitizeCommandArg(arg) {
	if (typeof arg !== "string") return arg;

	// Block dangerous characters
	const dangerous = /[;&|`$(){}<>]/;
	if (dangerous.test(arg)) {
		throw new Error("Invalid characters in command argument");
	}

	return arg.trim();
}

// Task ID validation - ensures task IDs follow expected format
function validateTaskId(id) {
	if (!id || typeof id !== "string") return false;

	// Expected format: aizen-001, aizen-123, etc.
	return /^aizen-\d{3,}$/i.test(id);
}

// File name sanitization - prevents invalid file names
function sanitizeFilename(filename) {
	if (!filename || typeof filename !== "string") return "";

	// Remove or replace dangerous characters
	return filename
		.replace(/[<>:"/\\|?*]/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

// YAML content sanitization - prevents injection
function sanitizeYAMLContent(content) {
	if (typeof content !== "string") return "";

	// Prevent template injection
	return content
		.replace(/\{\{/g, "&#123;&#123;")
		.replace(/\}\}/g, "&#125;&#125;")
		.replace(/<script/gi, "<script")
		.replace(/javascript:/gi, "");
}

// Email validation
function isValidEmail(email) {
	if (!email || typeof email !== "string") return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// URL validation
function isValidURL(url) {
	if (!url || typeof url !== "string") return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

// Rate limiter - simple in-memory rate limiter
class RateLimiter {
	constructor(maxRequests = 100, windowMs = 60000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
		this.requests = new Map();
	}

	isAllowed(identifier) {
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

	cleanup(key, now) {
		const timestamps = this.requests.get(`${key}_ts`) || [];
		const valid = timestamps.filter((ts) => now - ts < this.windowMs);

		if (valid.length === 0) {
			this.requests.delete(key);
			this.requests.delete(`${key}_ts`);
		} else {
			this.requests.set(`${key}_ts`, valid);
		}
	}
}

module.exports = {
	sanitizePath,
	sanitizeSQL,
	sanitizeCommandArg,
	validateTaskId,
	sanitizeFilename,
	sanitizeYAMLContent,
	isValidEmail,
	isValidURL,
	RateLimiter,
};
