/**
 * Shared Type Definitions for Aizen-Gate
 * Core types used across the application
 */

import type { NextFunction, Request, Response } from "express";

/* ============================================================================
 * Express Types
 * ========================================================================= */

/**
 * Express request with custom Aizen properties
 */
export interface AizenRequest extends Request {
	requestId?: string;
	logger?: import("winston").Logger;
	userId?: string;
	sessionId?: string;
}

/**
 * Express response with custom properties
 */
export interface AizenResponse extends Response {
	startTime?: number;
}

/**
 * Express next function
 */
export type AizenNext = NextFunction;

/* ============================================================================
 * Configuration Types
 * ========================================================================= */

/**
 * Aizen-Gate project configuration
 */
export interface AizenConfig {
	version: string;
	projectRoot: string;
	model_family?: string;
	ai_provider?: string;
	features?: Record<string, boolean>;
	[key: string]: unknown;
}

/**
 * Configuration for a specific feature
 */
export interface FeatureConfig {
	enabled: boolean;
	options?: Record<string, unknown>;
}

/* ============================================================================
 * Session Types
 * ========================================================================= */

/**
 * Session state
 */
export interface SessionState {
	id: string;
	projectRoot: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
	metadata?: Record<string, unknown>;
}

/**
 * Lifecycle status
 */
export type LifecycleStatus = "idle" | "initializing" | "running" | "paused" | "stopped";

/* ============================================================================
 * Command Types
 * ========================================================================= */

/**
 * CLI command options
 */
export interface CommandOptions {
	yes?: boolean;
	classic?: boolean;
	verbose?: boolean;
	force?: boolean;
	[key: string]: unknown;
}

/**
 * Command result
 */
export interface CommandResult {
	success: boolean;
	message?: string;
	data?: unknown;
	error?: Error;
}

/* ============================================================================
 * Plugin Types
 * ========================================================================= */

/**
 * Plugin manifest
 */
export interface PluginManifest {
	name: string;
	version: string;
	description?: string;
	main: string;
	author?: string;
	dependencies?: Record<string, string>;
}

/**
 * Plugin instance
 */
export interface Plugin {
	manifest: PluginManifest;
	enabled: boolean;
	instance?: unknown;
}

/* ============================================================================
 * Error Types
 * ========================================================================= */

/**
 * Error with additional context
 */
export interface ContextualError extends Error {
	code?: string;
	context?: Record<string, unknown>;
	cause?: Error;
}

/* ============================================================================
 * Metrics Types
 * ========================================================================= */

/**
 * Metric data point
 */
export interface MetricData {
	name: string;
	value: number;
	timestamp: Date;
	labels?: Record<string, string>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
	duration: number;
	memoryUsage?: NodeJS.MemoryUsage;
	cpuUsage?: NodeJS.CpuUsage;
}

/* ============================================================================
 * Task Types
 * ========================================================================= */

/**
 * Task status
 */
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

/**
 * Task priority
 */
export type TaskPriority = "low" | "medium" | "high" | "critical";

/**
 * Task item
 */
export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	assignee?: string;
	labels?: string[];
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date;
}

/**
 * Work package
 */
export interface WorkPackage {
	id: string;
	title: string;
	description?: string;
	tasks: Task[];
	status: TaskStatus;
	sprint?: string;
}

/* ============================================================================
 * Utility Types
 * ========================================================================= */

/**
 * Generic callback function
 */
export type Callback<T = void> = (error: Error | null, result?: T) => void;

/**
 * Async function without return value
 */
export type AsyncVoidFunction = () => Promise<void>;

/**
 * Async function with return value
 */
export type AsyncFunction<T = unknown> = () => Promise<T>;

/**
 * Constructor type
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Partial type with all keys optional recursively
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/* ============================================================================
 * File System Types
 * ========================================================================= */

/**
 * File watcher event
 */
export interface FileWatcherEvent {
	type: "add" | "change" | "unlink";
	path: string;
	timestamp: Date;
}

/**
 * File glob pattern
 */
export interface FilePattern {
	pattern: string;
	basePath?: string;
}
