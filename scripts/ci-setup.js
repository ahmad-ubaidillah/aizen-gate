const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");

/**
 * Aizen-Gate CI/CD Integrator
 * Scaffolds an automated GitHub Action that enforces QA Benchmarks on Pull Requests
 * to prevent Rogue AI Agents from committing corrupted scope.
 */
async function setupCI(projectRoot) {
	console.log(chalk.blue.bold("\n--- [OPS] Initializing Aizen-Gate CI/CD Guardian ---\n"));

	const githubDir = path.join(projectRoot, ".github", "workflows");
	const ciFilePath = path.join(githubDir, "az-compliance.yml");

	const yamlContent = `name: Aizen-Gate AI Compliance
on:
  pull_request:
    paths:
      - 'aizen-gate/shared/**'
      - 'src/**'

jobs:
  agent-compliance-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Dependencies
        run: npm ci

      - name: Run Global Aizen-Gate Benchmark
        run: npx aizen-gate benchmark
        
      # If the AI corrupted the board.md layout or missed dependencies,
      # the benchmark script throws process.exit(1) implicitly via CLI failure.
      - name: AI Guardrail Status
        if: failure()
        run: echo "❌ AI AGENT FAILED TO FOLLOW SUPERAGENT PROTOCOL. PR REJECTED." && exit 1
`;

	try {
		await fs.ensureDir(githubDir);

		if (fs.existsSync(ciFilePath)) {
			console.log(
				chalk.yellow(
					`[Notice] ${ciFilePath} already exists. Skipping overwrite to prevent unmerging custom CI logic.`,
				),
			);
		} else {
			await fs.writeFile(ciFilePath, yamlContent);
			console.log(chalk.green(`✔ Successfully injected CI Guardian: ${ciFilePath}`));
			console.log(
				chalk.white(
					`\nWhat this does:\nWhenever an AI agent pushes a Pull Request, GitHub Actions will spin up a container and run \`npx aizen-gate benchmark\`.\nIf the agent broke any Markdown scaffolding, the CI pipeline will instantly fail and block the merge until the AI fixes its code context.`,
				),
			);
		}

		return { success: true, path: ciFilePath };
	} catch (err) {
		console.error(chalk.red(`\n[OPS] CI Setup failed: ${err.message}`));
		return { success: false, error: err.message };
	}
}

module.exports = { setupCI };
