import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import { MemoryStore } from "./memory-store.js";

export async function ingestDocument(projectRoot: string, targetPath: string): Promise<void> {
	if (!fs.existsSync(targetPath)) {
		console.log(chalk.red(`[Aizen] File not found: ${targetPath}`));
		return;
	}

	const ext = path.extname(targetPath).toLowerCase();

	if (ext === ".md" || ext === ".txt") {
		const content = await fs.readFile(targetPath, "utf8");
		console.log(chalk.yellow(`[Aizen] Ingesting ${targetPath}...`));

		// Chunk by paragraphs for better memory ingestion
		const chunks = content.split(/\n\s*\n/).filter((c) => c.trim().length > 20);

		const store = new MemoryStore(projectRoot);
		const spaceId = path.basename(projectRoot);

		let ingested = 0;
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const uri = `agent://${spaceId}/ingest/${path.basename(targetPath).replace(/[^a-zA-Z0-9]/g, "_")}_${i}`;
			await store.storeMemory(
				uri,
				`[Source: ${path.basename(targetPath)}] ${chunk.trim().slice(0, 1000)}`,
			);
			ingested++;
		}

		console.log(
			chalk.green(`✔ Ingested ${ingested} memory chunks from ${path.basename(targetPath)}`),
		);
	} else {
		console.log(
			chalk.red(`[Aizen] Unsupported chunk format: ${ext}. Currently supports .md and .txt.`),
		);
	}
}
