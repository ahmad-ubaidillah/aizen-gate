import { BaseError } from "./base-error.js";

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends BaseError {
	public readonly field: string | null;
	public readonly value: unknown;

	constructor(message: string, field: string | null = null, value: unknown = null) {
		super(message, "VALIDATION_ERROR", 400, { field, value });
		this.name = "ValidationError";
		this.field = field;
		this.value = value;
	}
}
