/**
 * Circuit Breaker Utility
 * Prevents cascade failures by stopping requests to failing services
 */

/**
 * Circuit states
 */
export const STATE = {
	CLOSED: "CLOSED", // Normal operation
	OPEN: "OPEN", // Failing, reject requests
	HALF_OPEN: "HALF_OPEN", // Testing if service recovered
} as const;

export type CircuitState = typeof STATE.CLOSED | typeof STATE.OPEN | typeof STATE.HALF_OPEN;

/**
 * Circuit Breaker Options
 */
export interface CircuitBreakerOptions {
	failureThreshold?: number;
	successThreshold?: number;
	timeout?: number;
	onStateChange?: (state: CircuitState) => void;
}

/**
 * Circuit Breaker status
 */
export interface CircuitBreakerStatus {
	state: CircuitState;
	failures: number;
	successes: number;
	nextAttempt: number;
	lastFailureTime: number | null;
}

/**
 * Circuit Breaker class
 */
export class CircuitBreaker {
	public failureThreshold: number;
	public successThreshold: number;
	public timeout: number;
	public onStateChange: (state: CircuitState) => void;

	public state: CircuitState;
	public failures: number;
	public successes: number;
	public lastFailureTime: number | null;
	public nextAttempt: number;

	constructor(options: CircuitBreakerOptions = {}) {
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
	getState(): CircuitState {
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
	 * @param fn - Function to execute
	 * @returns Result of function
	 */
	async execute<T>(fn: () => Promise<T>): Promise<T> {
		const currentState = this.getState();

		if (currentState === STATE.OPEN) {
			const error = new Error("Circuit breaker is OPEN") as Error & { code: string };
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
	onSuccess(): void {
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
	onFailure(): void {
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
	reset(): void {
		this.state = STATE.CLOSED;
		this.failures = 0;
		this.successes = 0;
		this.lastFailureTime = null;
		this.onStateChange(STATE.CLOSED);
	}

	/**
	 * Get status object
	 */
	getStatus(): CircuitBreakerStatus {
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
 * @param options - Circuit breaker options
 * @returns Decorator function
 */
export function circuitBreaker(options: CircuitBreakerOptions = {}) {
	const breaker = new CircuitBreaker(options);

	return (
		_target: unknown,
		_propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<unknown>>,
	): TypedPropertyDescriptor<(...args: unknown[]) => Promise<unknown>> => {
		const originalMethod = descriptor.value;

		descriptor.value = async function (this: unknown, ...args: unknown[]) {
			return breaker.execute(() => originalMethod?.apply(this, args));
		} as typeof descriptor.value;

		// Attach breaker to method for inspection
		(descriptor.value as { circuitBreaker?: CircuitBreaker }).circuitBreaker = breaker;

		return descriptor;
	};
}
