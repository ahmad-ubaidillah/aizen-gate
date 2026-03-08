/**
 * Metrics Collection for Aizen-Gate
 * In-memory metrics with HTTP endpoint
 */
import type { Request, Response } from "express";

/**
 * Metrics data structure
 */
interface MetricsData {
	// Counters
	commandsTotal: number;
	commandsByType: Record<string, number>;
	errorsTotal: number;
	errorsByType: Record<string, number>;
	requestsTotal: number;

	// Histograms (stored as arrays for simple percentile calc)
	commandDurations: number[];
	requestDurations: number[];

	// Gauges
	activeConnections: number;
	memoryUsage: number;
}

const metrics: MetricsData = {
	// Counters
	commandsTotal: 0,
	commandsByType: {},
	errorsTotal: 0,
	errorsByType: {},
	requestsTotal: 0,

	// Histograms
	commandDurations: [],
	requestDurations: [],

	// Gauges
	activeConnections: 0,
	memoryUsage: 0,
};

/**
 * Increment a counter
 * @param name - Counter name
 * @param label - Label for breakdown
 * @param value - Value to increment
 */
export function incrementCounter(name: string, label?: string, value = 1): void {
	if (!metrics[name as keyof MetricsData]) {
		metrics[name as any] = label ? {} : 0;
	}

	if (label) {
		(metrics[name as any] as any)[label] = (metrics[name as any][label] || 0) + value;
	} else {
		(metrics[name as any] as any) += value;
	}
}

/**
 * Record a histogram value
 * @param name - Histogram name
 * @param value - Value to record
 */
export function recordHistogram(name: string, value: number): void {
	if (!(metrics as any)[name]) {
		(metrics as any)[name] = [];
	}

	(metrics as any)[name].push(value);
	if ((metrics as any)[name].length > 1000) {
		(metrics as any)[name].shift();
	}
}

/**
 * Set a gauge value
 * @param name - Gauge name
 * @param value - Value to set
 */
export function setGauge(name: string, value: number): void {
	(metrics as any)[name] = value;
}

/**
 * Calculate percentile from sorted array
 * @param arr - Sorted array
 * @param p - Percentile (0-100)
 * @returns Percentile value
 */
function percentile(arr: number[], p: number): number {
	if (arr.length === 0) return 0;
	const index = Math.ceil((p / 100) * arr.length) - 1;
	return arr[index];
}

/**
 * Duration metrics
 */
interface DurationMetrics {
	count: number;
	sum: number;
	min?: number;
	max?: number;
	p50: number;
	p90: number;
	p95?: number;
	p99?: number;
}

/**
 * Complete metrics snapshot
 */
export interface MetricsSnapshot {
	// Counters
	commandsTotal: number;
	commandsByType: Record<string, number>;
	errorsTotal: number;
	errorsByType: Record<string, number>;
	requestsTotal: number;

	// Histogram percentiles
	commandDuration: DurationMetrics;
	requestDuration: DurationMetrics;

	// Gauges
	activeConnections: number;
	memoryUsage: number;

	// Timestamp
	timestamp: string;
}

/**
 * Get metrics snapshot
 * @returns Metrics snapshot
 */
export function getMetrics(): MetricsSnapshot {
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
			min: percentile(sortedRequests, 0),
			max: percentile(sortedRequests, 100),
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
 * @param commandType - Type of command
 * @param durationMs - Duration in ms
 * @param success - Whether succeeded
 */
export function recordCommand(commandType: string, durationMs: number, success = true): void {
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
 * @param method - HTTP method
 * @param path - Request path
 * @param statusCode - Response status
 * @param durationMs - Duration in ms
 */
export function recordRequest(
	_method: string,
	_path: string,
	_statusCode: number,
	durationMs: number,
): void {
	incrementCounter("requestsTotal");
	recordHistogram("requestDurations", durationMs);
}

/**
 * Express middleware for metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: () => void): void {
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
export function metricsHandler(_req: Request, res: Response): void {
	// Update memory gauge
	setGauge("memoryUsage", process.memoryUsage().heapUsed);

	res.json(getMetrics());
}

/**
 * Prometheus format exporter
 */
export function prometheusExporter(): string {
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
