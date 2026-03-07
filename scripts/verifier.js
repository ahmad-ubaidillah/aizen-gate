const fs = require("fs-extra");
const path = require("node:path");
const chalk = require("chalk");
const { select, input } = require("@inquirer/prompts");
const { WorkPackage } = require("./wp-model");

/**
 * Verifier: Handles User Acceptance Testing (UAT) and auto-diagnosis of failures.
 */
async function runVerifier(projectRoot, featureName) {
	console.log(chalk.red.bold("\n--- ⛩️ [Aizen] Starting User Acceptance Testing (UAT) ---\n"));

	const specsDir = path.join(projectRoot, "aizen-gate", "specs");
	const featureDir = featureName ? path.join(specsDir, featureName) : null;

	let activeFeature = featureName;
	if (!featureDir || !fs.existsSync(featureDir)) {
		// Try to find the first feature with done WPs
		const dirs = await fs.readdir(specsDir);
		for (const dir of dirs) {
			const tasksDir = path.join(specsDir, dir, "tasks");
			if (fs.existsSync(tasksDir)) {
				activeFeature = dir;
				break;
			}
		}
	}

	if (!activeFeature) {
		console.log(chalk.yellow("[Aizen] No features found for verification."));
		return;
	}

	const featurePath = path.join(specsDir, activeFeature);
	const wps = await WorkPackage.loadAllWPs(featurePath);
	const doneWps = wps.filter((w) => w.lane === "done" || w.lane === "review");

	if (doneWps.length === 0) {
		console.log(
			chalk.yellow(
				`[Aizen] No 'done' or 'review' Work Packages found in feature: ${activeFeature}.`,
			),
		);
		return;
	}

	console.log(`[Aizen] Feature: ${chalk.cyan(activeFeature)} (${doneWps.length} Deliverables)\n`);

	const results = [];

	for (const wp of doneWps) {
		console.log(chalk.blue.bold(`\n>> Deliverable: [${wp.id}] ${wp.title}`));
		console.log(chalk.gray(`   Implementation artifacts are ready for verification.\n`));

		// Simulating AC extraction
		const acItems = wp.content.match(/- \[ \].*|- \[x\].*/g) || [
			"No specific AC found in WP content.",
		];
		console.log(chalk.white(`   Acceptance Criteria:`));
		acItems.forEach((ac) => console.log(chalk.white(`   ${ac}`)));
		console.log("");

		const decision = await select({
			message: `Verify deliverable ${wp.id}:`,
			choices: [
				{ name: "Pass ✅", value: "pass" },
				{ name: "Fail ❌ (Initiate Diagnosis)", value: "fail" },
				{ name: "Skip ⏭️", value: "skip" },
			],
		});

		if (decision === "fail") {
			const issueDetail = await input({
				message: "Describe the discrepancy (Expected vs Actual):",
			});
			console.log(chalk.red(`\n[Aizen] 🤖 Spawning Debug Subagent for ${wp.id}...`));

			// XML Debug Task for Agent
			console.log(chalk.white(`\n<debug_task id="${wp.id}">`));
			console.log(chalk.white(`  <objective>Investigate failure in WP ${wp.id}</objective>`));
			console.log(chalk.white(`  <issue_summary>${issueDetail}</issue_summary>`));
			console.log(
				chalk.white(
					`  <instructions>Read WP ${wp.filePath} and implementation artifacts. Generate a fix plan.</instructions>`,
				),
			);
			console.log(chalk.white(`</debug_task>\n`));

			results.push({ wpId: wp.id, status: "FAILED", detail: issueDetail });
		} else if (decision === "pass") {
			results.push({ wpId: wp.id, status: "PASSED" });
		} else {
			results.push({ wpId: wp.id, status: "SKIPPED" });
		}
	}

	// Generate Verification Report
	const reportPath = path.join(projectRoot, "aizen-gate", "shared", "verification-report.md");
	let reportContent = `# 📜 User Acceptance Verification Report\n\nGenerated: ${new Date().toISOString()}\nFeature: ${activeFeature}\n\n`;
	reportContent += `| WP ID | Status | Notes |\n|---|---|---|\n`;
	results.forEach((r) => {
		const icon = r.status === "PASSED" ? "✅" : r.status === "FAILED" ? "❌" : "⏭️";
		reportContent += `| ${r.wpId} | ${icon} ${r.status} | ${r.detail || "-"} |\n`;
	});

	await fs.ensureDir(path.dirname(reportPath));
	await fs.writeFile(reportPath, reportContent);

	console.log(chalk.green(`\n✔ UAT complete. Report generated at: ${reportPath}`));
}

module.exports = { runVerifier };
