import path from "node:path";
import chalk from "chalk";
import fs from "fs-extra";
import { Chunker } from "./chunker.js";
import { MemoryStore } from "./memory-store.js";

export async function ingestDocument(projectRoot: string, targetPath: string): Promise<void> {
	if (!fs.existsSync(targetPath)) {
		console.log(chalk.red(`[Aizen] File not found: ${targetPath}`));
		return;
	}

	const ext = path.extname(targetPath).toLowerCase();
	const isCode = [".ts", ".js", ".go", ".py", ".rs", ".c", ".cpp"].includes(ext);
	const isText = [".md", ".txt"].includes(ext);

	if (isCode || isText) {
		const content = await fs.readFile(targetPath, "utf8");
		console.log(
			chalk.yellow(`[Aizen] Ingesting ${targetPath} (mode: ${isCode ? "code" : "text"})...`),
		);

		const chunks = Chunker.chunk(content, isCode ? "code" : "text");

		const store = new MemoryStore(projectRoot);
		const spaceId = path.basename(projectRoot);

		let ingested = 0;
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const uri = `agent://${spaceId}/ingest/${path.basename(targetPath).replace(/[^a-zA-Z0-9]/g, "_")}_${i}`;
			await store.storeMemory(
				uri,
				chunk.trim(),
				isCode ? 7.0 : 5.0, // Code chunks get slightly higher importance
			);
			ingested++;
		}

		console.log(
			chalk.green(`✔ Ingested ${ingested} contextual chunks from ${path.basename(targetPath)}`),
		);
	} else {
		console.log(
			chalk.red(`[Aizen] Unsupported format: ${ext}. Currently supports code and text/markdown.`),
		);
	}
}
