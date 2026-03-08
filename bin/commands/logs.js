#!/usr/bin/env node

/**
 * Log Analytics Command
 * Parse and analyze log files
 */
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");

/**
 * Parse log line as JSON
 * @param {string} line - Log line
 * @returns {object|null}
 */
function parseLogLine(line) {
	try {
		return JSON.parse(line);
	} catch {
		// Try to parse as text format
		const match = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s+\[(\w+)\]\s+(.+)/);
		if (match) {
			return {
				timestamp: match[1],
				level: match[2],
				message: match[3],
			};
		}
		return null;
	}
}

/**
 * Read log file
 * @param {string} filename - Log filename
 * @returns {Promise<string[]>}
 */
async function readLogFile(filename) {
	const filepath = path.join(LOG_DIR, filename);
	const lines = [];

	if (!fs.existsSync(filepath)) {
		console.log(`Log file not found: ${filepath}`);
		return lines;
	}

	const fileStream = fs.createReadStream(filepath);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});

	for await (const line of rl) {
		if (line.trim()) {
			lines.push(line);
		}
	}

	return lines;
}

/**
 * Analyze logs
 * @param {string[]} lines - Log lines
 * @returns {object}
 */
function analyzeLogs(lines) {
	const stats = {
		total: lines.length,
		byLevel: {},
		byHour: {},
		errors: [],
		contexts: {},
	};

	for (const line of lines) {
		const log = parseLogLine(line);
		if (!log) continue;

		// Count by level
		const level = log.level || "unknown";
		stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

		// Count by hour
		if (log.timestamp) {
			const hour = log.timestamp.substring(0, 13);
			stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
		}

		// Track errors
		if (level === "error") {
			stats.errors.push({
				message: log.message,
				timestamp: log.timestamp,
				context: log.context,
			});
		}

		// Track contexts
		if (log.context) {
			stats.contexts[log.context] = (stats.contexts[log.context] || 0) + 1;
		}
	}

	return stats;
}

/**
 * Print analysis results
 * @param {object} stats - Statistics
 */
function printAnalysis(stats) {
	console.log("\n📊 Log Analysis Results\n");
	console.log(`Total entries: ${stats.total}\n`);

	console.log("📈 By Level:");
	for (const [level, count] of Object.entries(stats.byLevel)) {
		const bar = "█".repeat(Math.min(count / 10, 50));
		console.log(`  ${level.padEnd(7)} ${count.toString().padStart(5)} ${bar}`);
	}

	if (Object.keys(stats.contexts).length > 0) {
		console.log("\n🎯 By Context:");
		for (const [context, count] of Object.entries(stats.contexts)) {
			console.log(`  ${context}: ${count}`);
		}
	}

	if (stats.errors.length > 0) {
		console.log(`\n❌ Errors (${stats.errors.length}):`);
		stats.errors.slice(0, 10).forEach((err, i) => {
			console.log(`  ${i + 1}. [${err.timestamp}] ${err.message}`);
		});
		if (stats.errors.length > 10) {
			console.log(`  ... and ${stats.errors.length - 10} more`);
		}
	}

	// Time analysis
	if (Object.keys(stats.byHour).length > 0) {
		console.log("\n⏰ By Hour:");
		const sortedHours = Object.entries(stats.byHour).sort((a, b) => b[1] - a[1]);
		sortedHours.slice(0, 5).forEach(([hour, count]) => {
			console.log(`  ${hour}: ${count} entries`);
		});
	}
}

/**
 * Main function
 */
async function main() {
	const args = process.argv.slice(2);
	const command = args[0] || "analyze";

	switch (command) {
		case "analyze": {
			const filename = args[1] || "combined-" + getToday() + ".log";
			console.log(`📂 Reading ${filename}...`);
			const lines = await readLogFile(filename);
			const stats = analyzeLogs(lines);
			printAnalysis(stats);
			break;
		}

		case "errors": {
			const filename = args[1] || "error-" + getToday() + ".log";
			console.log(`📂 Reading ${filename}...`);
			const lines = await readLogFile(filename);
			console.log(`\n❌ Found ${lines.length} error entries:\n`);
			lines.forEach((line) => console.log(line));
			break;
		}

		case "list": {
			console.log("📁 Available log files:\n");
			if (!fs.existsSync(LOG_DIR)) {
				console.log("  No log directory found");
				break;
			}
			const files = fs
				.readdirSync(LOG_DIR)
				.filter((f) => f.endsWith(".log"))
				.sort()
				.reverse();
			files.forEach((f) => console.log(`  ${f}`));
			break;
		}

		case "watch": {
			console.log("👀 Watching logs (Ctrl+C to exit)...");
			const filename = args[1] || "combined-" + getToday() + ".log";
			let lastSize = 0;

			setInterval(async () => {
				const filepath = path.join(LOG_DIR, filename);
				if (!fs.existsSync(filepath)) return;

				const stats = fs.statSync(filepath);
				if (stats.size > lastSize) {
					// Read new lines
					const stream = fs.createReadStream(filepath, {
						start: lastSize,
						end: stats.size,
					});
					stream.on("data", (chunk) => {
						chunk
							.toString()
							.split("\n")
							.forEach((line) => {
								if (line.trim()) console.log(line);
							});
					});
					lastSize = stats.size;
				}
			}, 2000);
			break;
		}

		default:
			console.log("Usage:");
			console.log("  aizen-gate logs analyze [file]  - Analyze logs");
			console.log("  aizen-gate logs errors [file]   - Show errors");
			console.log("  aizen-gate logs list            - List log files");
			console.log("  aizen-gate logs watch [file]    - Watch logs live");
	}
}

/**
 * Get today's date string
 */
function getToday() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

main().catch(console.error);
