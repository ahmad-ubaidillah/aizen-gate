const { KnowledgeGraph } = require("./kg-engine");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const matter = require("gray-matter");

/**
 * [AZ] Knowledge Graph Scanner
 *
 * Scans the codebase, backlog, and specs to build/update the graph.
 */
class KGScanner {
	constructor(projectRoot) {
		this.projectRoot = projectRoot;
		this.kg = new KnowledgeGraph(projectRoot);
	}

	/**
	 * Main entry for building the graph.
	 */
	async build() {
		console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Building Knowledge Graph ---\n"));

		try {
			// 1. Scan Specs
			await this.scanSpecs();

			// 2. Scan Backlog
			await this.scanBacklog();

			// 3. Scan Codebase
			await this.scanCode();

			console.log(chalk.green.bold("\n✔ Knowledge Graph built successfully.\n"));
		} catch (err) {
			console.error(chalk.red(`[KG] Build failed: ${err.message}`));
			throw err;
		}
	}

	/**
	 * Scans spec/plan files for requirements.
	 */
	async scanSpecs() {
		const specPath = path.join(this.projectRoot, "spec.md");
		if (fs.existsSync(specPath)) {
			const content = await fs.readFile(specPath, "utf8");
			await this.kg.addNode("spec-master", "FEAT", content, { title: "Project Specification" });
		}
	}

	/**
	 * Scans backlog/tasks for Work Packages.
	 */
	async scanBacklog() {
		const backlogDir = path.join(this.projectRoot, "backlog", "tasks");
		if (!fs.existsSync(backlogDir)) return;

		const files = await fs.readdir(backlogDir);
		for (const file of files.filter((f) => f.endsWith(".md"))) {
			const filePath = path.join(backlogDir, file);
			const raw = await fs.readFile(filePath, "utf8");
			const { data, content } = matter(raw);
			const id = path.basename(file, ".md").split(" ")[0]; // AIZEN-016

			await this.kg.addNode(id, "TASK", content, { ...data, path: filePath });

			// Link Task -> Spec (IMPLEMENTS)
			await this.kg.addEdge(id, "spec-master", "IMPLEMENTS");

			// Link Task -> Task (DEPENDS_ON)
			if (data.dependencies && Array.isArray(data.dependencies)) {
				for (const dep of data.dependencies) {
					await this.kg.addEdge(id, dep, "DEPENDS_ON");
				}
			}
		}
	}

	/**
	 * Scans source code for files and functions.
	 */
	async scanCode() {
		const skipDirs = ["node_modules", ".git", "comparation", "design-system"];

		const walk = async (dir) => {
			const list = await fs.readdir(dir);
			for (const item of list) {
				if (skipDirs.includes(item)) continue;

				const fullPath = path.join(dir, item);
				const stat = await fs.stat(fullPath);

				if (stat.isDirectory()) {
					await walk(fullPath);
				} else if (item.endsWith(".js") || item.endsWith(".ts")) {
					const content = await fs.readFile(fullPath, "utf8");
					const relPath = path.relative(this.projectRoot, fullPath);

					// Add File Node
					await this.kg.addNode(relPath, "FILE", content, { path: relPath });

					// Simple Function Extractions
					const funcRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
					let match;
					while ((match = funcRegex.exec(content)) !== null) {
						const funcName = match[1];
						await this.kg.addNode(
							`${relPath}:${funcName}`,
							"FUNC",
							`Function ${funcName} in ${relPath}`,
							{
								file: relPath,
								name: funcName,
							},
						);
						await this.kg.addEdge(relPath, `${relPath}:${funcName}`, "DEFINES");
					}
				}
			}
		};

		await walk(this.projectRoot);
	}
}

module.exports = { KGScanner };
