import { BaseError } from "./base-error";

/**
 * Timeout Error
 * Thrown when operations exceed time limits
 */
export class TimeoutError extends BaseError {
	public readonly operation: string | null;
	public readonly timeoutMs: number | null;

	constructor(message: string, operation: string | null = null, timeoutMs: number | null = null) {
		super(message, "TIMEOUT_ERROR", 504, {
			operation,
			timeoutMs,
		});
		this.name = "TimeoutError";
		this.operation = operation;
		this.timeoutMs = timeoutMs;
	}
}
