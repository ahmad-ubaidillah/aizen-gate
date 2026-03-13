/**
 * Lightweight Native Logger for Aizen-Gate
 * Replaces Winston to reduce dependency weight (~3MB saved).
 */

import fs from "node:fs";
import path from "node:path";

const logDir = process.env.LOG_DIR || path.join(process.cwd(), "logs");
const isDevelopment = process.env.NODE_ENV !== "production";

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

type LogLevel = "debug" | "info" | "warn" | "error";

class AizenLogger {
	private level: LogLevel;

	constructor() {
		this.level = (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? "debug" : "info");
	}

	private getTimestamp(): string {
		return new Date().toISOString();
	}

	private writeToFile(level: string, message: string, metadata: any = {}): void {
		const entry = `${JSON.stringify({
			timestamp: this.getTimestamp(),
			level,
			message,
			...metadata,
		})}\n`;

		try {
			const dateStr = new Date().toISOString().split("T")[0];
			const filename = path.join(
				logDir,
				`${level === "error" ? "error" : "combined"}-${dateStr}.log`,
			);
			fs.appendFileSync(filename, entry);
		} catch (err) {
			console.error("[Logger] Failed to write to file:", err);
		}
	}

	public log(level: LogLevel, message: string, metadata: any = {}): void {
		const levels: LogLevel[] = ["debug", "info", "warn", "error"];
		if (levels.indexOf(level) < levels.indexOf(this.level)) return;

		const ts = this.getTimestamp();
		const color = level === "error" ? "\x1b[31m" : level === "warn" ? "\x1b[33m" : "\x1b[36m";
		const reset = "\x1b[0m";

		if (isDevelopment) {
			console.log(
				`${ts} [${color}${level.toUpperCase()}${reset}] ${message}`,
				Object.keys(metadata).length ? metadata : "",
			);
		}

		this.writeToFile(level, message, metadata);
	}

	public debug(msg: string, meta?: any) {
		this.log("debug", msg, meta);
	}
	public info(msg: string, meta?: any) {
		this.log("info", msg, meta);
	}
	public warn(msg: string, meta?: any) {
		this.log("warn", msg, meta);
	}
	public error(msg: string, meta?: any) {
		this.log("error", msg, meta);
	}

	public child(context: any) {
		return {
			debug: (msg: string, meta?: any) => this.debug(msg, { ...context, ...meta }),
			info: (msg: string, meta?: any) => this.info(msg, { ...context, ...meta }),
			warn: (msg: string, meta?: any) => this.warn(msg, { ...context, ...meta }),
			error: (msg: string, meta?: any) => this.error(msg, { ...context, ...meta }),
			log: (level: LogLevel, msg: string, meta?: any) =>
				this.log(level, msg, { ...context, ...meta }),
		};
	}
}

export const logger = new AizenLogger();

export function createChildLogger(context: string) {
	return logger.child({ context });
}

export interface AizenRequest {
	requestId?: string;
	logger?: any;
	[key: string]: any;
}

export function generateRequestId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export { logger as default };
