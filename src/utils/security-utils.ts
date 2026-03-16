/**
 * Security Utilities Module
 * Provides secure alternatives for common security-sensitive operations.
 *
 * Security Improvements:
 * - Cryptographically secure random ID generation
 * - Path traversal prevention
 * - Input validation and sanitization
 * - Safe YAML loading (prevents code execution)
 * - Command parameter sanitization
 */

import crypto from "node:crypto";
import path from "node:path";
import yaml from "js-yaml";

/**
 * Secure ID Generation
 * Uses crypto.randomBytes() instead of Math.random() for cryptographic security.
 * Math.random() is predictable and should never be used for security-sensitive IDs.
 */

/**
 * Generates a cryptographically secure random ID.
 * @param prefix - Optional prefix for the ID (e.g., 'node', 'checkpoint')
 * @param length - Length of random portion (default: 8)
 * @returns Secure random ID string
 */
export function generateSecureId(prefix: string = "", length: number = 8): string {
	const bytes = crypto.randomBytes(Math.ceil(length * 0.75));
	const randomPart = bytes.toString("base64url").slice(0, length);
	return prefix ? `${prefix}-${randomPart}` : randomPart;
}

/**
 * Generates a secure numeric ID within a range.
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Secure random number in range
 */
export function generateSecureNumber(min: number, max: number): number {
	const range = max - min;
	const bytesNeeded = Math.ceil(Math.log2(range) / 8) || 1;
	let result: number;

	do {
		const bytes = crypto.randomBytes(bytesNeeded);
		result = bytes.readUIntBE(0, bytesNeeded);
	} while (result >= range * Math.floor(256 ** bytesNeeded / range));

	return min + (result % range);
}

/**
 * Generates a secure UUID v4.
 * @returns UUID string
 */
export function generateSecureUuid(): string {
	return crypto.randomUUID();
}

/**
 * Path Sanitization
 * Prevents directory traversal attacks by validating and normalizing paths.
 */

/**
 * Validates and sanitizes a path component to prevent directory traversal.
 * @param component - Path component to validate (e.g., taskId, filename)
 * @param options - Validation options
 * @returns Sanitized path component or throws error
 */
export function sanitizePathComponent(
	component: string,
	options: {
		allowExtension?: boolean;
		maxLength?: number;
		allowSpaces?: boolean;
	} = {},
): string {
	const { allowExtension = true, maxLength = 255, allowSpaces = true } = options;

	if (!component || typeof component !== "string") {
		throw new SecurityError("Path component must be a non-empty string");
	}

	// Check length
	if (component.length > maxLength) {
		throw new SecurityError(`Path component exceeds maximum length of ${maxLength}`);
	}

	// Check for null bytes
	if (component.includes("\0")) {
		throw new SecurityError("Path component contains null bytes");
	}

	// Check for directory traversal patterns
	const traversalPatterns = [
		"..",
		"/",
		"\\",
		// URL-encoded traversal
		"%2e%2e",
		"%252e",
		// Double encoding
		"..%2f",
		"..%5c",
	];

	const lowerComponent = component.toLowerCase();
	for (const pattern of traversalPatterns) {
		if (lowerComponent.includes(pattern.toLowerCase())) {
			throw new SecurityError(`Path component contains forbidden pattern: ${pattern}`);
		}
	}

	// Validate characters - alphanumeric, dash, underscore, and optionally dots/spaces
	const allowedPattern = allowSpaces
		? allowExtension
			? /^[a-zA-Z0-9._\-\s]+$/
			: /^[a-zA-Z0-9_\-\s]+$/
		: allowExtension
			? /^[a-zA-Z0-9._-]+$/
			: /^[a-zA-Z0-9_-]+$/;

	if (!allowedPattern.test(component)) {
		throw new SecurityError(
			`Path component contains invalid characters. Allowed: alphanumeric, dash, underscore${allowExtension ? ", dot" : ""}${allowSpaces ? ", space" : ""}`,
		);
	}

	return component;
}

/**
 * Validates that a resolved path stays within the expected directory.
 * @param basePath - The allowed base directory
 * @param targetPath - The path to validate
 * @returns The validated absolute path
 */
export function validatePathWithinBase(basePath: string, targetPath: string): string {
	const resolvedBase = path.resolve(basePath);
	const resolvedTarget = path.resolve(basePath, targetPath);

	if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
		throw new SecurityError(`Path traversal detected: target path escapes base directory`);
	}

	return resolvedTarget;
}

/**
 * Safe YAML Loading
 * Prevents code execution through YAML deserialization attacks.
 */

/**
 * Safely loads YAML content without allowing code execution.
 * Uses yaml.safeLoad semantics - only parses data, not functions.
 * @param content - YAML string content
 * @returns Parsed YAML object
 */
export function safeYamlLoad(content: string): unknown {
	if (!content || typeof content !== "string") {
		throw new SecurityError("YAML content must be a non-empty string");
	}

	try {
		// SAFE_SCHEMA prevents !!js/function and other dangerous types
		return yaml.load(content, {
			schema: yaml.FAILSAFE_SCHEMA,
			json: true,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		throw new SecurityError(`Failed to parse YAML safely: ${message}`);
	}
}

/**
 * Safely dumps an object to YAML string.
 * @param data - Object to serialize
 * @returns YAML string
 */
export function safeYamlDump(data: unknown): string {
	return yaml.dump(data, {
		schema: yaml.FAILSAFE_SCHEMA,
		noRefs: true,
		sortKeys: true,
	});
}

/**
 * Command Sanitization
 * Prevents command injection in exec/execSync calls.
 */

/**
 * Validates a port number for use in network commands.
 * @param port - Port number to validate
 * @returns Validated port number
 */
export function validatePort(port: number): number {
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new SecurityError(`Invalid port number: ${port}. Must be integer 1-65535`);
	}
	return port;
}

/**
 * Escapes a shell argument to prevent injection.
 * Note: Prefer using spawn with args array over exec with string commands.
 * @param arg - Argument to escape
 * @returns Shell-escaped argument
 */
export function escapeShellArg(arg: string): string {
	if (!arg || typeof arg !== "string") {
		throw new SecurityError("Shell argument must be a non-empty string");
	}

	// Remove any null bytes
	const sanitized = arg.replace(/\0/g, "");

	// Escape single quotes and wrap in single quotes
	// This is the safest approach for shell arguments
	return `'${sanitized.replace(/'/g, "'\\''")}'`;
}

/**
 * Validates a file path for use in shell commands.
 * @param filePath - Path to validate
 * @returns Validated path
 */
export function validatePathForShell(filePath: string): string {
	// Check for dangerous patterns
	const dangerousPatterns = [";", "|", "&", "$", "`", "(", ")", "<", ">", "\n", "\r", "\0"];

	for (const pattern of dangerousPatterns) {
		if (filePath.includes(pattern)) {
			throw new SecurityError(`Path contains potentially dangerous character for shell use`);
		}
	}

	return filePath;
}

/**
 * Input Validation Helpers
 */

/**
 * Validates a task ID format.
 * @param taskId - Task ID to validate
 * @returns Validated task ID
 */
export function validateTaskId(taskId: string): string {
	if (!taskId || typeof taskId !== "string") {
		throw new SecurityError("Task ID must be a non-empty string");
	}

	// Task IDs should be alphanumeric with dashes/underscores
	const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

	if (!validPattern.test(taskId)) {
		throw new SecurityError(
			"Invalid task ID format. Must start with alphanumeric and contain only alphanumeric, dash, underscore, or dot",
		);
	}

	if (taskId.length > 128) {
		throw new SecurityError("Task ID exceeds maximum length of 128 characters");
	}

	return taskId;
}

/**
 * Validates a URL format.
 * @param url - URL to validate
 * @returns Validated URL string
 */
export function validateUrl(url: string): string {
	if (!url || typeof url !== "string") {
		throw new SecurityError("URL must be a non-empty string");
	}

	try {
		const parsed = new URL(url);
		// Only allow http and https protocols
		if (!["http:", "https:"].includes(parsed.protocol)) {
			throw new SecurityError(`Invalid URL protocol: ${parsed.protocol}`);
		}
		return url;
	} catch (error) {
		throw new SecurityError("Invalid URL format");
	}
}

/**
 * Validates an agent/node ID format.
 * @param agentId - Agent ID to validate
 * @returns Validated agent ID
 */
export function validateAgentId(agentId: string): string {
	if (!agentId || typeof agentId !== "string") {
		throw new SecurityError("Agent ID must be a non-empty string");
	}

	// Agent IDs should be alphanumeric with dashes
	const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/;

	if (!validPattern.test(agentId)) {
		throw new SecurityError(
			"Invalid agent ID format. Must contain only alphanumeric characters and dashes",
		);
	}

	if (agentId.length > 64) {
		throw new SecurityError("Agent ID exceeds maximum length of 64 characters");
	}

	return agentId;
}

/**
 * Custom Security Error
 */
export class SecurityError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SecurityError";
	}
}

/**
 * Rate Limiter for brute-force protection
 */
export class RateLimiter {
	private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();
	private maxAttempts: number;
	private windowMs: number;

	constructor(maxAttempts: number = 10, windowMs: number = 60000) {
		this.maxAttempts = maxAttempts;
		this.windowMs = windowMs;
	}

	/**
	 * Check if an action should be allowed for a given key.
	 * @param key - Identifier for the rate limit (e.g., IP, user ID)
	 * @returns true if allowed, false if rate limited
	 */
	check(key: string): boolean {
		const now = Date.now();
		const record = this.attempts.get(key);

		if (!record) {
			this.attempts.set(key, { count: 1, firstAttempt: now });
			return true;
		}

		// Reset if window has passed
		if (now - record.firstAttempt > this.windowMs) {
			this.attempts.set(key, { count: 1, firstAttempt: now });
			return true;
		}

		// Check if limit exceeded
		if (record.count >= this.maxAttempts) {
			return false;
		}

		record.count++;
		return true;
	}

	/**
	 * Reset rate limit for a key.
	 * @param key - Identifier to reset
	 */
	reset(key: string): void {
		this.attempts.delete(key);
	}

	/**
	 * Clean up expired entries.
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, record] of this.attempts.entries()) {
			if (now - record.firstAttempt > this.windowMs) {
				this.attempts.delete(key);
			}
		}
	}
}

// Export singleton rate limiter for general use
export const globalRateLimiter = new RateLimiter();
