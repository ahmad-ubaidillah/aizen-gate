/**
 * Summary-Based Context Management
 *
 * Phase 4: Conversational AI Features
 * Task 4.2: Summary-Based Context Management
 *
 * This module provides:
 * - Rolling conversation summary generation
 * - Token usage tracking per session/agent
 * - SQLite-backed storage for summaries and token usage
 * - Configurable message threshold for summary generation
 */

import path from "node:path";
import Database from "better-sqlite3";
import chalk from "chalk";
import fs from "fs-extra";

/**
 * Message structure for summary generation
 */
export interface Message {
	id?: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp?: string;
	agent?: string;
}

/**
 * Token usage record structure
 */
export interface TokenUsage {
	id: number;
	session_id: string;
	agent: string;
	tokens_used: number;
	timestamp: string;
}

/**
 * Summary record structure
 */
export interface SummaryRecord {
	id: number;
	session_id: string;
	summary: string;
	message_range_start: number;
	message_range_end: number;
	created_at: string;
}

/**
 * Configuration options for SummaryManager
 */
export interface SummaryManagerConfig {
	/** Number of messages before triggering summary (default: 20) */
	messageThreshold?: number;
	/** Path to the database file */
	dbPath?: string;
}

/**
 * [AZ] Summary Manager
 *
 * Manages conversation summaries and token usage tracking
 * for context management in long-running sessions.
 */
export class SummaryManager {
	private db: Database.Database;
	private messageThreshold: number;

	/**
	 * Creates a new SummaryManager instance
	 *
	 * @param projectRoot - Root path of the project
	 * @param config - Optional configuration options
	 */
	constructor(projectRoot: string, config: SummaryManagerConfig = {}) {
		this.messageThreshold = config.messageThreshold || 20;

		const dbPath = config.dbPath || path.join(projectRoot, "aizen-gate", "shared", "memory.db");
		fs.ensureDirSync(path.dirname(dbPath));

		this.db = new Database(dbPath);
		this.initTables();

		console.log(
			chalk.cyan(`[SummaryManager] Initialized with threshold: ${this.messageThreshold} messages`),
		);
	}

	/**
	 * Initialize database tables for summaries and token usage
	 */
	private initTables(): void {
		// Create summaries table
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        summary TEXT NOT NULL,
        message_range_start INTEGER NOT NULL,
        message_range_end INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_summaries_session ON summaries(session_id);
      CREATE INDEX IF NOT EXISTS idx_summaries_range ON summaries(session_id, message_range_start, message_range_end);
    `);

		// Create token_usage table
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        agent TEXT NOT NULL,
        tokens_used INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_token_usage_session ON token_usage(session_id);
      CREATE INDEX IF NOT EXISTS idx_token_usage_agent ON token_usage(agent);
      CREATE INDEX IF NOT EXISTS idx_token_usage_timestamp ON token_usage(timestamp);
    `);

		console.log(chalk.green(`[SummaryManager] Database tables initialized`));
	}

	/**
	 * Check if summary should be generated based on message count
	 *
	 * @param messageCount - Current number of messages in the session
	 * @returns True if summary should be generated
	 *
	 * @example
	 * const shouldSummarize = summaryManager.shouldGenerateSummary(20); // Returns true
	 * const shouldSummarize = summaryManager.shouldGenerateSummary(15); // Returns false
	 */
	shouldGenerateSummary(messageCount: number): boolean {
		return messageCount > 0 && messageCount % this.messageThreshold === 0;
	}

	/**
	 * Generate a rolling summary from messages
	 *
	 * @param messages - Array of Message objects to summarize
	 * @returns Formatted summary string
	 *
	 * @example
	 * const messages = [
	 *   { role: 'user', content: 'I want to build a React app with PostgreSQL' },
	 *   { role: 'assistant', content: 'Great choice! Let me design the architecture.' }
	 * ];
	 * const summary = summaryManager.generateSummary(messages);
	 */
	generateSummary(messages: Message[]): string {
		if (!messages || messages.length === 0) {
			return "## Conversation Summary\n\nNo messages to summarize.";
		}

		const startMsg = 1;
		const endMsg = messages.length;

		// Extract key information from messages
		const decisions: string[] = [];
		const progress: string[] = [];
		const questions: string[] = [];

		// Analyze messages for key patterns
		const decisionKeywords = ["decided", "choose", "selected", "agreed", "will use", "going with"];
		const progressKeywords = ["completed", "finished", "done", "started", "implemented", "created"];
		const questionKeywords = ["?", "need to decide", "unclear", "how should", "what about"];

		for (const msg of messages) {
			const content = msg.content.toLowerCase();

			// Check for decisions
			if (decisionKeywords.some((kw) => content.includes(kw))) {
				// Extract the relevant part of the message
				const decisionMatch = msg.content.match(
					/(?:decided|chosen|selected|agreed|will use|going with)[:\s]+(.+?)(?:\.|$)/i,
				);
				if (decisionMatch && decisions.length < 5) {
					decisions.push(decisionMatch[1].trim());
				}
			}

			// Check for progress
			if (progressKeywords.some((kw) => content.includes(kw))) {
				const progressMatch = msg.content.match(
					/(?:completed|finished|done|started|implemented|created)[:\s]+(.+?)(?:\.|$)/i,
				);
				if (progressMatch && progress.length < 5) {
					progress.push(progressMatch[1].trim());
				}
			}

			// Check for open questions
			if (questionKeywords.some((kw) => content.includes(kw))) {
				const questionMatch = msg.content.match(
					/(?:should we|need to decide|how do we|what about)[:\s]+(.+?)(?:\?|$)/i,
				);
				if (questionMatch && questions.length < 5) {
					questions.push(`${questionMatch[1].trim()}?`);
				}
			}
		}

		// Build the summary
		let summary = `## Conversation Summary (Messages ${startMsg}-${endMsg})\n\n`;

		// Key Decisions section
		summary += `### Key Decisions:\n`;
		if (decisions.length > 0) {
			decisions.forEach((d) => {
				summary += `- ${d.charAt(0).toUpperCase() + d.slice(1)}\n`;
			});
		} else {
			summary += `- No specific decisions recorded yet\n`;
		}

		// Progress section
		summary += `\n### Progress:\n`;
		if (progress.length > 0) {
			progress.forEach((p) => {
				summary += `- ${p.charAt(0).toUpperCase() + p.slice(1)}\n`;
			});
		} else {
			summary += `- Conversation in progress\n`;
		}

		// Open Questions section
		summary += `\n### Open Questions:\n`;
		if (questions.length > 0) {
			questions.forEach((q) => {
				summary += `- ${q}\n`;
			});
		} else {
			summary += `- No open questions\n`;
		}

		return summary;
	}

	/**
	 * Store a summary in the database
	 *
	 * @param sessionId - Unique session identifier
	 * @param summary - The summary text to store
	 * @param messageRangeStart - Starting message number (default: 1)
	 * @param messageRangeEnd - Ending message number
	 *
	 * @example
	 * summaryManager.storeSummary('session-123', '## Summary\n- Decision 1', 1, 20);
	 */
	storeSummary(
		sessionId: string,
		summary: string,
		messageRangeStart: number = 1,
		messageRangeEnd: number,
	): void {
		const stmt = this.db.prepare(`
        INSERT INTO summaries (session_id, summary, message_range_start, message_range_end)
        VALUES (?, ?, ?, ?)
      `);

		stmt.run(sessionId, summary, messageRangeStart, messageRangeEnd);
		console.log(chalk.green(`[SummaryManager] Summary stored for session: ${sessionId}`));
	}

	/**
	 * Retrieve the most recent summary for a session
	 *
	 * @param sessionId - Unique session identifier
	 * @returns The summary string or empty string if not found
	 *
	 * @example
	 * const summary = summaryManager.getSummary('session-123');
	 */
	getSummary(sessionId: string): string {
		try {
			const stmt = this.db.prepare(`
        SELECT summary FROM summaries 
        WHERE session_id = ? 
        ORDER BY message_range_end DESC 
        LIMIT 1
      `);

			const result = stmt.get(sessionId) as { summary: string } | undefined;
			return result?.summary || "";
		} catch (error) {
			console.error(
				chalk.red(`[SummaryManager] Failed to get summary: ${(error as Error).message}`),
			);
			return "";
		}
	}

	/**
	 * Get all summaries for a session
	 *
	 * @param sessionId - Unique session identifier
	 * @returns Array of SummaryRecord objects
	 *
	 * @example
	 * const allSummaries = summaryManager.getAllSummaries('session-123');
	 */
	getAllSummaries(sessionId: string): SummaryRecord[] {
		try {
			const stmt = this.db.prepare(`
        SELECT id, session_id, summary, message_range_start, message_range_end, created_at
        FROM summaries 
        WHERE session_id = ? 
        ORDER BY message_range_start ASC
      `);

			return stmt.all(sessionId) as SummaryRecord[];
		} catch (error) {
			console.error(
				chalk.red(`[SummaryManager] Failed to get all summaries: ${(error as Error).message}`),
			);
			return [];
		}
	}

	/**
	 * Track token usage for a session and agent
	 *
	 * @param sessionId - Unique session identifier
	 * @param agent - Agent name (e.g., 'pm', 'dev', 'qa')
	 * @param tokens - Number of tokens used
	 *
	 * @example
	 * summaryManager.trackTokenUsage('session-123', 'pm', 1500);
	 */
	trackTokenUsage(sessionId: string, agent: string, tokens: number): void {
		try {
			const stmt = this.db.prepare(`
        INSERT INTO token_usage (session_id, agent, tokens_used)
        VALUES (?, ?, ?)
      `);

			stmt.run(sessionId, agent, tokens);
			console.log(chalk.cyan(`[SummaryManager] Tracked ${tokens} tokens for agent: ${agent}`));
		} catch (error) {
			console.error(
				chalk.red(`[SummaryManager] Failed to track token usage: ${(error as Error).message}`),
			);
			throw error;
		}
	}

	/**
	 * Get token usage statistics for a session
	 *
	 * @param sessionId - Unique session identifier
	 * @returns Array of TokenUsage records
	 *
	 * @example
	 * const usage = summaryManager.getTokenUsage('session-123');
	 */
	getTokenUsage(sessionId: string): TokenUsage[] {
		try {
			const stmt = this.db.prepare(`
        SELECT id, session_id, agent, tokens_used, timestamp
        FROM token_usage 
        WHERE session_id = ?
        ORDER BY timestamp DESC
      `);

			return stmt.all(sessionId) as TokenUsage[];
		} catch (error) {
			console.error(
				chalk.red(`[SummaryManager] Failed to get token usage: ${(error as Error).message}`),
			);
			return [];
		}
	}

	/**
	 * Get total token usage for a session
	 *
	 * @param sessionId - Unique session identifier
	 * @returns Total tokens used
	 *
	 * @example
	 * const total = summaryManager.getTotalTokenUsage('session-123');
	 */
	getTotalTokenUsage(sessionId: string): number {
		try {
			const stmt = this.db.prepare(`
        SELECT COALESCE(SUM(tokens_used), 0) as total
        FROM token_usage 
        WHERE session_id = ?
      `);

			const result = stmt.get(sessionId) as { total: number };
			return result?.total || 0;
		} catch (error) {
			console.error(
				chalk.red(`[SummaryManager] Failed to get total token usage: ${(error as Error).message}`),
			);
			return 0;
		}
	}

	/**
	 * Get token usage breakdown by agent for a session
	 *
	 * @param sessionId - Unique session identifier
	 * @returns Object with agent names as keys and total tokens as values
	 *
	 * @example
	 * const breakdown = summaryManager.getTokenUsageByAgent('session-123');
	 * // Returns: { pm: 1500, dev: 3000, qa: 800 }
	 */
	getTokenUsageByAgent(sessionId: string): Record<string, number> {
		try {
			const stmt = this.db.prepare(`
        SELECT agent, SUM(tokens_used) as total
        FROM token_usage 
        WHERE session_id = ?
        GROUP BY agent
      `);

			const results = stmt.all(sessionId) as { agent: string; total: number }[];
			const breakdown: Record<string, number> = {};

			for (const row of results) {
				breakdown[row.agent] = row.total;
			}

			return breakdown;
		} catch (error) {
			console.error(
				chalk.red(
					`[SummaryManager] Failed to get token usage by agent: ${(error as Error).message}`,
				),
			);
			return {};
		}
	}

	/**
	 * Process messages and generate summary if threshold is reached
	 *
	 * @param sessionId - Unique session identifier
	 * @param messages - Array of messages to process
	 * @returns Generated summary if threshold reached, null otherwise
	 *
	 * @example
	 * const summary = await summaryManager.processMessages('session-123', messages);
	 */
	processMessages(sessionId: string, messages: Message[]): string | null {
		if (this.shouldGenerateSummary(messages.length)) {
			const summary = this.generateSummary(messages);
			this.storeSummary(
				sessionId,
				summary,
				messages.length - this.messageThreshold + 1,
				messages.length,
			);
			return summary;
		}
		return null;
	}

	/**
	 * Get the current message threshold
	 *
	 * @returns Number of messages before summary is triggered
	 */
	getThreshold(): number {
		return this.messageThreshold;
	}

	/**
	 * Update the message threshold
	 *
	 * @param threshold - New threshold value
	 */
	setThreshold(threshold: number): void {
		if (threshold > 0) {
			this.messageThreshold = threshold;
			console.log(chalk.cyan(`[SummaryManager] Threshold updated to: ${threshold}`));
		}
	}

	/**
	 * Clear all data for a session
	 *
	 * @param sessionId - Session ID to clear
	 */
	clearSession(sessionId: string): void {
		try {
			this.db.prepare("DELETE FROM summaries WHERE session_id = ?").run(sessionId);
			this.db.prepare("DELETE FROM token_usage WHERE session_id = ?").run(sessionId);
			console.log(chalk.yellow(`[SummaryManager] Cleared data for session: ${sessionId}`));
		} catch (error) {
			console.error(
				chalk.red(`[SummaryManager] Failed to clear session: ${(error as Error).message}`),
			);
			throw error;
		}
	}

	/**
	 * Close database connection
	 */
	close(): void {
		this.db.close();
		console.log(chalk.green(`[SummaryManager] Database connection closed`));
	}
}

/**
 * Create a SummaryManager instance
 *
 * @param projectRoot - Root path of the project
 * @param config - Optional configuration options
 * @returns SummaryManager instance
 *
 * @example
 * const summaryManager = createSummaryManager('/path/to/project');
 */
export function createSummaryManager(
	projectRoot: string,
	config?: SummaryManagerConfig,
): SummaryManager {
	return new SummaryManager(projectRoot, config);
}

export default SummaryManager;
