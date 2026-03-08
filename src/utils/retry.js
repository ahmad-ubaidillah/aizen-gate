/**
 * Retry Utility
 * Generic retry decorator with exponential backoff
 */

/**
 * Retry options
 * @typedef {Object} RetryOptions
 * @property {number} maxAttempts - Maximum number of attempts (default: 3)
 * @property {number} initialDelayMs - Initial delay in ms (default: 100)
 * @property {number} maxDelayMs - Maximum delay in ms (default: 5000)
 * @property {number} backoffMultiplier - Backoff multiplier (default: 2)
 * @property {Function} shouldRetry - Function to determine if error is retryable
 */

/**
 * Default retryable errors
 */
const DEFAULT_RETRYABLE_ERRORS = [
	"ECONNREFUSED",
	"ECONNRESET",
	"ETIMEDOUT",
	"ENOTFOUND",
	"ENETUNREACH",
	"EHOSTUNREACH",
];

/**
 * Sleep for specified ms
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {RetryOptions} options - Retry options
 * @returns {Promise<any>} Result of function
 */
async function retry(fn, options = {}) {
	const {
		maxAttempts = 3,
		initialDelayMs = 100,
		maxDelayMs = 5000,
		backoffMultiplier = 2,
		shouldRetry = () => true,
	} = options;

	let lastError;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Check if we should retry
			if (attempt === maxAttempts || !shouldRetry(error)) {
				throw error;
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(initialDelayMs * backoffMultiplier ** (attempt - 1), maxDelayMs);

			console.log(
				`[RETRY] Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`,
			);
			await sleep(delay);
		}
	}

	throw lastError;
}

/**
 * Retry decorator for class methods
 * @param {RetryOptions} options - Retry options
 * @returns {Function} Decorator function
 */
function retryable(options = {}) {
	return (target, propertyKey, descriptor) => {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args) {
			return retry(() => originalMethod.apply(this, args), options);
		};

		return descriptor;
	};
}

module.exports = {
	retry,
	retryable,
	sleep,
	DEFAULT_RETRYABLE_ERRORS,
};
