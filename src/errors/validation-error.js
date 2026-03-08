/**
 * Validation Error
 * Thrown when input validation fails
 */
const { BaseError } = require("./base-error");

class ValidationError extends BaseError {
	constructor(message, field = null, value = null) {
		super(message, "VALIDATION_ERROR", 400, { field, value });
		this.name = "ValidationError";
	}
}

module.exports = { ValidationError };
