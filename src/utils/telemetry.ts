/**
 * OpenTelemetry Setup for Aizen-Gate
 * Distributed tracing
 */

// biome-ignore lint/suspicious/noExplicitAny: otel api
let _api: any = null;
// biome-ignore lint/suspicious/noExplicitAny: otel trace
let trace: any = null;

const isEnabled = process.env.OTEL_ENABLED === "true" || process.env.NODE_ENV === "production";

if (isEnabled) {
	try {
		// @ts-expect-error: Optional dependency
		const otel = await import("@opentelemetry/api");
		_api = otel;
		trace = otel.trace;
	} catch (_e) {
		console.warn("OpenTelemetry not available. Install @opentelemetry/api");
	}
}

/**
 * Telemetry configuration
 */
export const config = {
	serviceName: process.env.OTEL_SERVICE_NAME || "aizen-gate",
	exporterEndpoint: process.env.OTEL_EXPORTER_ENDPOINT || "http://localhost:4318/v1/traces",
	sampleRate: parseInt(process.env.OTEL_SAMPLE_RATE || "100", 10),
};

/**
 * Get tracer instance
 */
export function getTracer(): any {
	if (!trace) {
		return null;
	}

	return trace.getTracer(config.serviceName);
}

/**
 * Create a span for an operation
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenTelemetry span options can be complex
export function createSpan(name: string, options: any = {}): any {
	const tracer = getTracer();
	if (!tracer) {
		return null;
	}

	return tracer.startSpan(name, {
		kind: options.kind || trace.SpanKind.INTERNAL,
		attributes: {
			"service.name": config.serviceName,
			...options.attributes,
		},
	});
}

/**
 * Run function within a span
 */
export async function withSpan<T>(
	name: string,
	// biome-ignore lint/suspicious/noExplicitAny: span mapping
	fn: (span: any) => Promise<T>,
	// biome-ignore lint/suspicious/noExplicitAny: span options
	options: any = {},
): Promise<T> {
	const tracer = getTracer();
	if (!tracer) {
		return fn(null);
	}

	return tracer.startActiveSpan(name, { kind: options.kind }, async (span: any) => {
		try {
			// Add attributes
			if (options.attributes) {
				span.setAttributes(options.attributes);
			}

			const result = await fn(span);

			// Set success
			span.setStatus({ code: trace.SpanStatusCode.OK });

			return result;
		} catch (error: any) {
			// biome-ignore lint/suspicious/noExplicitAny: error handling
			// Set error status
			span.setStatus({
				code: trace.SpanStatusCode.ERROR,
				message: error.message,
			});
			span.setAttribute("error", true);
			span.setAttribute("error.message", error.message);

			throw error;
		} finally {
			span.end();
		}
	});
}

/**
 * Trace a function execution
 */
export async function traceFunction<T>(
	name: string,
	fn: () => Promise<T>,
	// biome-ignore lint/suspicious/noExplicitAny: span attributes
	attrs: any = {},
): Promise<T> {
	return withSpan(
		name,
		async () => {
			return fn();
		},
		{ attributes: attrs },
	);
}

/**
 * Add span event
 */
// biome-ignore lint/suspicious/noExplicitAny: span and attributes
export function addSpanEvent(span: any, name: string, attrs: any = {}): void {
	if (span) {
		span.addEvent(name, attrs);
	}
}

/**
 * Metrics hooks for commands
 */
const commandMetrics: { startTime: Record<string, number> } = {
	startTime: {},
};

/**
 * Start command timing
 */
export function startCommand(commandId: string): void {
	commandMetrics.startTime[commandId] = Date.now();
}

/**
 * End command timing and record
 */
export function endCommand(commandId: string, success = true): void {
	const startTime = commandMetrics.startTime[commandId];
	if (!startTime) return;

	const duration = Date.now() - startTime;
	const durationMs = parseFloat(duration.toFixed(2));

	// Log as span
	const span = createSpan(`command.${success ? "success" : "failure"}`, {
		attributes: {
			"command.id": commandId,
			"command.duration.ms": durationMs,
			"command.success": success,
		},
	});

	if (span) {
		span.end();
	}

	delete commandMetrics.startTime[commandId];
}

export { isEnabled };
