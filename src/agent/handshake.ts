import fsPromises from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";

/**
 * [Phase 10] Agent Handshake & Resource Negotiation
 * Ensures agents collaborate fairly on shared resources.
 */
export class AgentHandshake {
	private lockDir: string;

	constructor(projectRoot: string = process.cwd()) {
		this.lockDir = path.join(projectRoot, "aizen-gate", ".locks");
	}

	private async ensureDir() {
		try {
			await fsPromises.mkdir(this.lockDir, { recursive: true });
		} catch {}
	}

	/**
	 * Attempts to acquire a lock for a shared resource.
	 */
	async negotiate(resourceName: string, agentId: string): Promise<boolean> {
		await this.ensureDir();
		const lockFile = path.join(this.lockDir, `${resourceName}.lock`);

		try {
			// Check if lock exists and is recent (within 30s)
			const stats = await fsPromises.stat(lockFile).catch(() => null);
			if (stats && Date.now() - stats.mtimeMs < 30000) {
				console.log(
					chalk.yellow(
						`[Handshake] Resource "${resourceName}" is currently held by another agent.`,
					),
				);
				return false;
			}

			// Acquire lock
			await fsPromises.writeFile(
				lockFile,
				JSON.stringify({
					agentId,
					acquiredAt: new Date().toISOString(),
				}),
			);

			console.log(
				chalk.green(`[Handshake] @${agentId} successfully negotiated access to "${resourceName}".`),
			);
			return true;
		} catch (_err) {
			return false;
		}
	}

	/**
	 * Releases a held lock.
	 */
	async release(resourceName: string) {
		const lockFile = path.join(this.lockDir, `${resourceName}.lock`);
		await fsPromises.unlink(lockFile).catch(() => {});
	}
}

export const agentHandshake = new AgentHandshake();
