import { BaseError } from "./base-error";

/**
 * Runtime Error
 * Thrown when runtime operations fail
 */
export class RuntimeError extends BaseError {
	public readonly operation: string | null;
	public readonly originalError: string | null;

	constructor(message: string, operation: string | null = null, originalError: unknown = null) {
		const errorMessage =
			originalError instanceof Error ? originalError.message : String(originalError);

		super(message, "RUNTIME_ERROR", 500, {
			operation,
			originalError: errorMessage,
		});
		this.name = "RuntimeError";
		this.operation = operation;
		this.originalError = errorMessage;
	}
}
