import path from "node:path";
import { isCancel, select, text } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import { WorkPackage } from "../tasks/wp-model.js";

/**
 * Verifier: Handles User Acceptance Testing (UAT) and auto-diagnosis of failures.
 */
export async function runVerifier(projectRoot: string, featureName?: string): Promise<void> {
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
	const doneWps = wps.filter((w: any) => w.lane === "done" || w.lane === "review");

	if (doneWps.length === 0) {
		console.log(
			chalk.yellow(
				`[Aizen] No 'done' or 'review' Work Packages found in feature: ${activeFeature}.`,
			),
		);
		return;
	}

	console.log(`[Aizen] Feature: ${chalk.cyan(activeFeature)} (${doneWps.length} Deliverables)\n`);

	const results: any[] = [];

	for (const wp of doneWps) {
		console.log(chalk.blue.bold(`\n>> Deliverable: [${wp.id}] ${wp.title}`));
		console.log(chalk.gray("   Implementation artifacts are ready for verification.\n"));

		// Simulating AC extraction
		const acItems = wp.body.match(/- \[ \].*|- \[x\].*/g) || [
			"No specific AC found in WP content.",
		];
		console.log(chalk.white("   Acceptance Criteria:"));
		acItems.forEach((ac: string) => console.log(chalk.white(`   ${ac}`)));
		console.log("");

		const decision = await select({
			message: `Verify deliverable ${wp.id}:`,
			options: [
				{ label: "Pass ✅", value: "pass" },
				{ label: "Fail ❌ (Initiate Diagnosis)", value: "fail" },
				{ label: "Skip ⏭️", value: "skip" },
			],
		});

		if (isCancel(decision)) {
			results.push({ wpId: wp.id, status: "SKIPPED" });
			continue;
		}

		if (decision === "fail") {
			const issueDetail = await text({
				message: "Describe the discrepancy (Expected vs Actual):",
			});

			if (isCancel(issueDetail)) {
				results.push({ wpId: wp.id, status: "SKIPPED" });
				continue;
			}

			const detailStr = String(issueDetail);
			console.log(chalk.red(`\n[Aizen] 🤖 Spawning Debug Subagent for ${wp.id}...`));

			// XML Debug Task for Agent
			console.log(chalk.white(`\n<debug_task id="${wp.id}">`));
			console.log(chalk.white(`  <objective>Investigate failure in WP ${wp.id}</objective>`));
			console.log(chalk.white(`  <issue_summary>${detailStr}</issue_summary>`));
			console.log(
				chalk.white(
					`  <instructions>Read WP ${wp.filePath} and implementation artifacts. Generate a fix plan.</instructions>`,
				),
			);
			console.log(chalk.white("</debug_task>\n"));

			results.push({ wpId: wp.id, status: "FAILED", detail: detailStr });
		} else if (decision === "pass") {
			results.push({ wpId: wp.id, status: "PASSED" });
		} else {
			results.push({ wpId: wp.id, status: "SKIPPED" });
		}
	}

	// Generate Verification Report
	const reportPath = path.join(projectRoot, "aizen-gate", "shared", "verification-report.md");
	let reportContent = `# 📜 User Acceptance Verification Report\n\nGenerated: ${new Date().toISOString()}\nFeature: ${activeFeature}\n\n`;
	reportContent += "| WP ID | Status | Notes |\n|---|---|---|\n";
	results.forEach((r) => {
		const icon = r.status === "PASSED" ? "✅" : r.status === "FAILED" ? "❌" : "⏭️";
		reportContent += `| ${r.wpId} | ${icon} ${r.status} | ${r.detail || "-"} |\n`;
	});

	await fs.ensureDir(path.dirname(reportPath));
	await fs.writeFile(reportPath, reportContent);

	console.log(chalk.green(`\n✔ UAT complete. Report generated at: ${reportPath}`));
}
