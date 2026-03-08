/**
 * Metrics Collection for Aizen-Gate
 * In-memory metrics with HTTP endpoint
 */

const metrics = {
	// Counters
	commandsTotal: 0,
	commandsByType: {},
	errorsTotal: 0,
	errorsByType: {},
	requestsTotal: 0,

	// Histograms (stored as arrays for simple percentile calc)
	commandDurations: [],
	requestDurations: [],

	// Gauges
	activeConnections: 0,
	memoryUsage: 0,
};

/**
 * Increment a counter
 * @param {string} name - Counter name
 * @param {string} [label] - Label for breakdown
 * @param {number} [value=1] - Value to increment
 */
function incrementCounter(name, label = null, value = 1) {
	if (!metrics[name]) {
		metrics[name] = label ? {} : 0;
	}

	if (label) {
		metrics[name][label] = (metrics[name][label] || 0) + value;
	} else {
		metrics[name] += value;
	}
}

/**
 * Record a histogram value
 * @param {string} name - Histogram name
 * @param {number} value - Value to record
 */
function recordHistogram(name, value) {
	if (!metrics[name]) {
		metrics[name] = [];
	}

	// Keep last 1000 values for percentile calculation
	metrics[name].push(value);
	if (metrics[name].length > 1000) {
		metrics[name].shift();
	}
}

/**
 * Set a gauge value
 * @param {string} name - Gauge name
 * @param {number} value - Value to set
 */
function setGauge(name, value) {
	metrics[name] = value;
}

/**
 * Calculate percentile from sorted array
 * @param {number[]} arr - Sorted array
 * @param {number} p - Percentile (0-100)
 * @returns {number}
 */
function percentile(arr, p) {
	if (arr.length === 0) return 0;
	const index = Math.ceil((p / 100) * arr.length) - 1;
	return arr[index];
}

/**
 * Get metrics snapshot
 * @returns {object}
 */
function getMetrics() {
	// Calculate percentiles
	const sortedDurations = [...metrics.commandDurations].sort((a, b) => a - b);
	const sortedRequests = [...metrics.requestDurations].sort((a, b) => a - b);

	return {
		// Counters
		commandsTotal: metrics.commandsTotal,
		commandsByType: metrics.commandsByType,
		errorsTotal: metrics.errorsTotal,
		errorsByType: metrics.errorsByType,
		requestsTotal: metrics.requestsTotal,

		// Histogram percentiles
		commandDuration: {
			count: sortedDurations.length,
			sum: sortedDurations.reduce((a, b) => a + b, 0),
			min: percentile(sortedDurations, 0),
			max: percentile(sortedDurations, 100),
			p50: percentile(sortedDurations, 50),
			p90: percentile(sortedDurations, 90),
			p95: percentile(sortedDurations, 95),
			p99: percentile(sortedDurations, 99),
		},

		requestDuration: {
			count: sortedRequests.length,
			sum: sortedRequests.reduce((a, b) => a + b, 0),
			p50: percentile(sortedRequests, 50),
			p90: percentile(sortedRequests, 90),
		},

		// Gauges
		activeConnections: metrics.activeConnections,
		memoryUsage: metrics.memoryUsage,

		// Timestamp
		timestamp: new Date().toISOString(),
	};
}

/**
 * Record command execution
 * @param {string} commandType - Type of command
 * @param {number} durationMs - Duration in ms
 * @param {boolean} success - Whether succeeded
 */
function recordCommand(commandType, durationMs, success = true) {
	incrementCounter("commandsTotal");
	incrementCounter("commandsByType", commandType);
	recordHistogram("commandDurations", durationMs);

	if (!success) {
		incrementCounter("errorsTotal");
		incrementCounter("errorsByType", commandType);
	}
}

/**
 * Record HTTP request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} statusCode - Response status
 * @param {number} durationMs - Duration in ms
 */
function recordRequest(method, path, statusCode, durationMs) {
	incrementCounter("requestsTotal");
	recordHistogram("requestDurations", durationMs);
}

/**
 * Express middleware for metrics
 */
function metricsMiddleware(req, res, next) {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		recordRequest(req.method, req.path, res.statusCode, duration);
	});

	next();
}

/**
 * Metrics endpoint handler
 */
function metricsHandler(req, res) {
	// Update memory gauge
	setGauge("memoryUsage", process.memoryUsage().heapUsed);

	res.json(getMetrics());
}

/**
 * Prometheus format exporter
 */
function prometheusExporter() {
	const m = getMetrics();
	let output = "";

	// Counters
	output += `# TYPE commands_total counter\n`;
	output += `commands_total ${m.commandsTotal}\n`;

	for (const [type, count] of Object.entries(m.commandsByType)) {
		output += `# TYPE commands_by_type counter\n`;
		output += `commands_by_type{type="${type}"} ${count}\n`;
	}

	output += `# TYPE errors_total counter\n`;
	output += `errors_total ${m.errorsTotal}\n`;

	output += `# TYPE requests_total counter\n`;
	output += `requests_total ${m.requestsTotal}\n`;

	// Histograms
	if (m.commandDuration.count > 0) {
		output += `# TYPE command_duration_seconds histogram\n`;
		output += `command_duration_seconds_count ${m.commandDuration.count}\n`;
		output += `command_duration_seconds_sum ${(m.commandDuration.sum / 1000).toFixed(3)}\n`;
	}

	// Gauges
	output += `# TYPE active_connections gauge\n`;
	output += `active_connections ${m.activeConnections}\n`;

	output += `# TYPE memory_usage_bytes gauge\n`;
	output += `memory_usage_bytes ${m.memoryUsage}\n`;

	return output;
}

module.exports = {
	incrementCounter,
	recordHistogram,
	setGauge,
	getMetrics,
	recordCommand,
	recordRequest,
	metricsMiddleware,
	metricsHandler,
	prometheusExporter,
};
