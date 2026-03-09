#!/usr/bin/env node

/**
 * Aizen-Gate CLI Entry Point (npx aizen-gate install)
 */

import { installAizenGate } from "../src/install.js";

async function main() {
	const args = process.argv.slice(2);
	const command = args[0] || "init";
	const targetDir = args[1] || process.cwd();

	console.log(`[AZ] Running Aizen-Gate CLI: ${command}`);

	switch (command) {
		case "init": {
			const result = await installAizenGate(targetDir);
			if (result.success) {
				console.log(`[AZ] Successfully initialized Aizen-Gate for ${result.platform}.`);
				if (result.stack) {
					console.log(`[AZ] Tech stack identified: ${result.stack.languages.join(", ")}`);
				}
			} else {
				process.exit(1);
			}
			break;
		}
		case "help":
			console.log("Aizen-Gate CLI Commands:");
			console.log("  init [target-dir]  Initialize a new Aizen-Gate project");
			console.log("  help               Show this help message");
			break;
		default:
			console.log(`[AZ] Unknown command: ${command}`);
			process.exit(1);
	}
}

main().catch((error: any) => {
	console.error(`[AZ] Unexpected error: ${error.message}`);
	process.exit(1);
});
