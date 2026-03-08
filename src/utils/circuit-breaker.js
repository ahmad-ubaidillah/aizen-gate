/**
 * Circuit Breaker Utility
 * Prevents cascade failures by stopping requests to failing services
 */

const STATE = {
	CLOSED: "CLOSED", // Normal operation
	OPEN: "OPEN", // Failing, reject requests
	HALF_OPEN: "HALF_OPEN", // Testing if service recovered
};

/**
 * Circuit Breaker Options
 * @typedef {Object} CircuitBreakerOptions
 * @property {number} failureThreshold - Failures before opening (default: 5)
 * @property {number} successThreshold - Successes before closing (default: 2)
 * @property {number} timeout - Time in ms before half-open (default: 30000)
 * @property {Function} onStateChange - Callback when state changes
 */

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
	constructor(options = {}) {
		this.failureThreshold = options.failureThreshold || 5;
		this.successThreshold = options.successThreshold || 2;
		this.timeout = options.timeout || 30000;
		this.onStateChange = options.onStateChange || (() => {});

		this.state = STATE.CLOSED;
		this.failures = 0;
		this.successes = 0;
		this.lastFailureTime = null;
		this.nextAttempt = Date.now();
	}

	/**
	 * Get current state
	 */
	getState() {
		// Check if we should transition from OPEN to HALF_OPEN
		if (this.state === STATE.OPEN && Date.now() >= this.nextAttempt) {
			this.state = STATE.HALF_OPEN;
			this.successes = 0;
			this.onStateChange(STATE.HALF_OPEN);
		}
		return this.state;
	}

	/**
	 * Execute a function through the circuit breaker
	 * @param {Function} fn - Function to execute
	 * @returns {Promise<any>} Result of function
	 */
	async execute(fn) {
		const currentState = this.getState();

		if (currentState === STATE.OPEN) {
			const error = new Error("Circuit breaker is OPEN");
			error.code = "CIRCUIT_OPEN";
			throw error;
		}

		try {
			const result = await fn();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	/**
	 * Handle successful execution
	 */
	onSuccess() {
		this.failures = 0;

		if (this.state === STATE.HALF_OPEN) {
			this.successes++;
			if (this.successes >= this.successThreshold) {
				this.state = STATE.CLOSED;
				this.onStateChange(STATE.CLOSED);
			}
		}
	}

	/**
	 * Handle failed execution
	 */
	onFailure() {
		this.failures++;
		this.lastFailureTime = Date.now();

		if (this.state === STATE.HALF_OPEN) {
			// Failed during test, go back to OPEN
			this.state = STATE.OPEN;
			this.nextAttempt = Date.now() + this.timeout;
			this.onStateChange(STATE.OPEN);
		} else if (this.failures >= this.failureThreshold) {
			// Open the circuit
			this.state = STATE.OPEN;
			this.nextAttempt = Date.now() + this.timeout;
			this.onStateChange(STATE.OPEN);
		}
	}

	/**
	 * Reset the circuit breaker
	 */
	reset() {
		this.state = STATE.CLOSED;
		this.failures = 0;
		this.successes = 0;
		this.lastFailureTime = null;
		this.onStateChange(STATE.CLOSED);
	}

	/**
	 * Get status object
	 */
	getStatus() {
		return {
			state: this.state,
			failures: this.failures,
			successes: this.successes,
			nextAttempt: this.nextAttempt,
			lastFailureTime: this.lastFailureTime,
		};
	}
}

/**
 * Circuit Breaker decorator
 * @param {CircuitBreakerOptions} options - Circuit breaker options
 * @returns {Function} Decorator function
 */
function circuitBreaker(options = {}) {
	const breaker = new CircuitBreaker(options);

	return (target, propertyKey, descriptor) => {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args) {
			return breaker.execute(() => originalMethod.apply(this, args));
		};

		// Attach breaker to method for inspection
		descriptor.value.circuitBreaker = breaker;

		return descriptor;
	};
}

module.exports = {
	CircuitBreaker,
	circuitBreaker,
	STATE,
};
