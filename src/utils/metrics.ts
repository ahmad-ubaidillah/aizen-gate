/**
 * Metrics Collection for Aizen-Gate
 * In-memory metrics with framework-agnostic endpoints
 */

/**
 * Metrics data structure
 */
interface MetricsData {
	commandsTotal: number;
	commandsByType: Record<string, number>;
	errorsTotal: number;
	errorsByType: Record<string, number>;
	requestsTotal: number;
	commandDurations: number[];
	requestDurations: number[];
	activeConnections: number;
	memoryUsage: number;
}

const metrics: MetricsData = {
	commandsTotal: 0,
	commandsByType: {},
	errorsTotal: 0,
	errorsByType: {},
	requestsTotal: 0,
	commandDurations: [],
	requestDurations: [],
	activeConnections: 0,
	memoryUsage: 0,
};

type CounterName = keyof Pick<MetricsData, "commandsTotal" | "errorsTotal" | "requestsTotal">;
type RecordName = keyof Pick<MetricsData, "commandsByType" | "errorsByType">;

// Type-safe metrics accessor
function getMetricValue(name: string): number | undefined {
	const metric = metrics as unknown as Record<string, number>;
	return metric[name];
}

function setMetricValue(name: string, value: number): void {
	const metric = metrics as unknown as Record<string, number>;
	metric[name] = value;
}

function getRecordMetric(name: string): Record<string, number> | undefined {
	const metric = metrics as unknown as Record<string, Record<string, number>>;
	return metric[name];
}

export function incrementCounter(name: string, label?: string, value = 1): void {
	if (label) {
		// For labeled counters (commandsByType, errorsByType)
		const record = getRecordMetric(name);
		if (record) {
			record[label] = (record[label] || 0) + value;
		}
	} else {
		// For simple counters - validate name is a known counter
		const validCounters: CounterName[] = ["commandsTotal", "errorsTotal", "requestsTotal"];
		if (validCounters.includes(name as CounterName)) {
			const current = getMetricValue(name) ?? 0;
			setMetricValue(name, current + value);
		}
	}
}

export function recordHistogram(name: string, value: number): void {
	const histogramNames = ["commandDurations", "requestDurations"];
	if (histogramNames.includes(name)) {
		const metric = metrics as unknown as Record<string, number[]>;
		if (!metric[name]) {
			metric[name] = [];
		}
		metric[name].push(value);
		if (metric[name].length > 1000) {
			metric[name].shift();
		}
	}
}

export function setGauge(name: string, value: number): void {
	const gaugeNames: (keyof MetricsData)[] = ["activeConnections", "memoryUsage"];
	if (gaugeNames.includes(name as keyof MetricsData)) {
		const metric = metrics as unknown as Record<string, number>;
		metric[name] = value;
	}
}

function percentile(arr: number[], p: number): number {
	if (arr.length === 0) return 0;
	const index = Math.ceil((p / 100) * arr.length) - 1;
	return arr[index];
}

export interface MetricsSnapshot {
	commandsTotal: number;
	commandsByType: Record<string, number>;
	errorsTotal: number;
	errorsByType: Record<string, number>;
	requestsTotal: number;
	commandDuration: any;
	requestDuration: any;
	activeConnections: number;
	memoryUsage: number;
	timestamp: string;
}

export function getMetrics(): MetricsSnapshot {
	const sortedDurations = [...metrics.commandDurations].sort((a, b) => a - b);
	const sortedRequests = [...metrics.requestDurations].sort((a, b) => a - b);

	return {
		commandsTotal: metrics.commandsTotal,
		commandsByType: metrics.commandsByType,
		errorsTotal: metrics.errorsTotal,
		errorsByType: metrics.errorsByType,
		requestsTotal: metrics.requestsTotal,
		commandDuration: {
			count: sortedDurations.length,
			sum: sortedDurations.reduce((a, b) => a + b, 0),
			p50: percentile(sortedDurations, 50),
			p90: percentile(sortedDurations, 90),
		},
		requestDuration: {
			count: sortedRequests.length,
			sum: sortedRequests.reduce((a, b) => a + b, 0),
			p50: percentile(sortedRequests, 50),
			p90: percentile(sortedRequests, 90),
		},
		activeConnections: metrics.activeConnections,
		memoryUsage: metrics.memoryUsage,
		timestamp: new Date().toISOString(),
	};
}

export function recordCommand(commandType: string, durationMs: number, success = true): void {
	incrementCounter("commandsTotal");
	incrementCounter("commandsByType", commandType);
	recordHistogram("commandDurations", durationMs);
	if (!success) {
		incrementCounter("errorsTotal");
		incrementCounter("errorsByType", commandType);
	}
}

export function recordRequest(durationMs: number): void {
	incrementCounter("requestsTotal");
	recordHistogram("requestDurations", durationMs);
}

/**
 * Hono Middleware for Metrics
 */
export async function metricsMiddleware(_c: any, next: () => Promise<void>) {
	const start = Date.now();
	await next();
	const duration = Date.now() - start;
	recordRequest(duration);
}

/**
 * Prometheus format exporter
 */
export function prometheusExporter(): string {
	const m = getMetrics();
	let output = "";
	output += `# TYPE commands_total counter\ncommands_total ${m.commandsTotal}\n`;
	output += `# TYPE errors_total counter\nerrors_total ${m.errorsTotal}\n`;
	output += `# TYPE requests_total counter\nrequests_total ${m.requestsTotal}\n`;
	output += `# TYPE active_connections gauge\nactive_connections ${m.activeConnections}\n`;
	output += `# TYPE memory_usage_bytes gauge\nmemory_usage_bytes ${m.memoryUsage}\n`;
	return output;
}

export { getMetrics as default };
