/**
 * Base Error Class for Aizen-Gate
 * All custom errors should extend this class
 */
class BaseError extends Error {
	constructor(message, code, statusCode = 500, metadata = {}) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.metadata = metadata;
		this.timestamp = new Date().toISOString();
		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			timestamp: this.timestamp,
			...this.metadata,
		};
	}
}

module.exports = { BaseError };
