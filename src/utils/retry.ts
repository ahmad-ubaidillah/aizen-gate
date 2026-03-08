/**
 * Retry Utility
 * Generic retry decorator with exponential backoff
 */

export interface RetryOptions {
	maxAttempts?: number;
	initialDelayMs?: number;
	maxDelayMs?: number;
	backoffMultiplier?: number;
	shouldRetry?: (error: Error) => boolean;
}

export const DEFAULT_RETRYABLE_ERRORS = [
	"ECONNREFUSED",
	"ECONNRESET",
	"ETIMEDOUT",
	"ENOTFOUND",
	"ENETUNREACH",
	"EHOSTUNREACH",
];

/**
 * Sleep for specified ms
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const {
		maxAttempts = 3,
		initialDelayMs = 100,
		maxDelayMs = 5000,
		backoffMultiplier = 2,
		shouldRetry = () => true,
	} = options;

	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;

			if (attempt === maxAttempts || !shouldRetry(lastError)) {
				throw error;
			}

			const delay = Math.min(initialDelayMs * backoffMultiplier ** (attempt - 1), maxDelayMs);

			console.log(
				`[RETRY] Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...`,
			);
			await sleep(delay);
		}
	}

	throw lastError;
}

/**
 * Retry decorator for class methods
 */
export function retryable(options: RetryOptions = {}) {
	return <T extends (...args: unknown[]) => Promise<unknown>>(
		target: unknown,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<T>,
	): TypedPropertyDescriptor<T> => {
		const originalMethod = descriptor.value!;

		descriptor.value = async function (...args: Parameters<T>) {
			return retry(() => originalMethod.apply(this, args), options);
		} as T;

		return descriptor;
	};
}
