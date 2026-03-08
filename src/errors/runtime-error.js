/**
 * Runtime Error
 * Thrown when runtime operations fail
 */
const { BaseError } = require("./base-error");

class RuntimeError extends BaseError {
	constructor(message, operation = null, originalError = null) {
		super(message, "RUNTIME_ERROR", 500, {
			operation,
			originalError: originalError?.message || originalError,
		});
		this.name = "RuntimeError";
	}
}

module.exports = { RuntimeError };
