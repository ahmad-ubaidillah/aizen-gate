const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const { MemoryStore } = require("./memory-store");

async function ingestDocument(projectRoot, targetPath) {
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

		let ingested = 0;
		for (const chunk of chunks) {
			await store.add(`[Source: ${path.basename(targetPath)}] ${chunk.trim().slice(0, 1000)}`);
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

module.exports = { ingestDocument };
