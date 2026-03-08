/**
 * Timeout Error
 * Thrown when operations exceed time limits
 */
const { BaseError } = require("./base-error");

class TimeoutError extends BaseError {
	constructor(message, operation = null, timeoutMs = null) {
		super(message, "TIMEOUT_ERROR", 504, {
			operation,
			timeoutMs,
		});
		this.name = "TimeoutError";
	}
}

module.exports = { TimeoutError };
