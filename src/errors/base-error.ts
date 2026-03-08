/**
 * Base Error Class for Aizen-Gate
 * All custom errors should extend this class
 */
export interface ErrorMetadata {
	[key: string]: unknown;
}

export interface BaseErrorOptions {
	metadata?: ErrorMetadata;
	field?: string | null;
	value?: unknown;
	operation?: string | null;
	originalError?: unknown;
	timeoutMs?: number | null;
}

export class BaseError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly timestamp: string;
	public readonly metadata: ErrorMetadata;

	constructor(
		message: string,
		code: string,
		statusCode: number = 500,
		options: BaseErrorOptions = {},
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.timestamp = new Date().toISOString();

		// Build metadata from all options
		const meta: ErrorMetadata = {};
		if (options.metadata) Object.assign(meta, options.metadata);
		if (options.field !== undefined) meta.field = options.field;
		if (options.value !== undefined) meta.value = options.value;
		if (options.operation !== undefined) meta.operation = options.operation;
		if (options.originalError !== undefined) meta.originalError = options.originalError;
		if (options.timeoutMs !== undefined) meta.timeoutMs = options.timeoutMs;
		this.metadata = meta;

		Error.captureStackTrace(this, this.constructor);
	}

	toJSON(): object {
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
