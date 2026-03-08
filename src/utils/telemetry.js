/**
 * OpenTelemetry Setup for Aizen-Gate
 * Distributed tracing
 */

// Only load OpenTelemetry in production or when enabled
let api, trace, nodeSDK;

const isEnabled = process.env.OTEL_ENABLED === "true" || process.env.NODE_ENV === "production";

if (isEnabled) {
	try {
		// Dynamic import for ESM module
		const otel = await import('@opentelemetry/api');
		api = otel;
		trace = otel.trace;
	} catch (e) {
		console.warn("OpenTelemetry not available. Install @opentelemetry/api");
	}
}

/**
 * Telemetry configuration
 */
const config = {
	serviceName: process.env.OTEL_SERVICE_NAME || "aizen-gate",
	exporterEndpoint: process.env.OTEL_EXPORTER_ENDPOINT || "http://localhost:4318/v1/traces",
	sampleRate: parseInt(process.env.OTEL_SAMPLE_RATE || "100", 10),
};

/**
 * Get tracer instance
 */
function getTracer() {
	if (!trace) {
		return null;
	}

	return trace.getTracer(config.serviceName);
}

/**
 * Create a span for an operation
 * @param {string} name - Span name
 * @param {object} options - Span options
 * @returns {Span}
 */
function createSpan(name, options = {}) {
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
 * @param {string} name - Span name
 * @param {Function} fn - Function to run
 * @param {object} options - Span options
 */
async function withSpan(name, fn, options = {}) {
	const tracer = getTracer();
	if (!tracer) {
		return fn();
	}

	return tracer.startActiveSpan(name, { kind: options.kind }, async (span) => {
		try {
			// Add attributes
			if (options.attributes) {
				span.setAttributes(options.attributes);
			}

			const result = await fn(span);

			// Set success
			span.setStatus({ code: trace.SpanStatusCode.OK });

			return result;
		} catch (error) {
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
 * @param {string} name - Operation name
 * @param {Function} fn - Function to trace
 * @param {object} attrs - Additional attributes
 */
function traceFunction(name, fn, attrs = {}) {
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
 * @param {Span} span - Span
 * @param {string} name - Event name
 * @param {object} attrs - Event attributes
 */
function addSpanEvent(span, name, attrs = {}) {
	if (span) {
		span.addEvent(name, attrs);
	}
}

/**
 * Metrics hooks for commands
 */
const commandMetrics = {
	startTime: {},
};

/**
 * Start command timing
 * @param {string} commandId - Command ID
 */
function startCommand(commandId) {
	commandMetrics.startTime[commandId] = Date.now();
}

/**
 * End command timing and record
 * @param {string} commandId - Command ID
 * @param {boolean} success - Whether command succeeded
 */
function endCommand(commandId, success = true) {
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

module.exports = {
	config,
	getTracer,
	createSpan,
	withSpan,
	traceFunction,
	addSpanEvent,
	startCommand,
	endCommand,
	isEnabled,
};
