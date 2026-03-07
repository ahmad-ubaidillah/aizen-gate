const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Aizen-Gate Quality Gate
 * Validates implementation plans against a set of 7-dimension rules.
 */
async function validatePlan(planPath) {
	console.log(chalk.blue.bold(`\n--- [SA] Athena Quality Gate: Validating Plan ---\n`));

	if (!fs.existsSync(planPath)) {
		console.log(chalk.red(`[SA] Error: Plan file not found at ${planPath}`));
		return { success: false };
	}

	const content = fs.readFileSync(planPath, "utf8");
	const issues = [];

	// Dimension 1: Coverage (AC satisfaction)
	if (!content.includes("Acceptance Criteria") && !content.includes("## AC")) {
		issues.push("Missing Acceptance Criteria (AC).");
	}

	// Dimension 2: Testing (TDD focus)
	if (!content.toLowerCase().includes("test") && !content.toLowerCase().includes("tdd")) {
		issues.push("No testing strategy found in the plan.");
	}

	// Dimension 3: Atomicity
	const taskCount = (content.match(/^- \[ \]/gm) || []).length;
	if (taskCount > 10) {
		issues.push(`Plan is too large (${taskCount} tasks). Recommend splitting into multiple plans.`);
	} else if (taskCount === 0) {
		issues.push("No tasks identified in the plan.");
	}

	// Dimension 4: Security
	if (!content.toLowerCase().includes("security") && !content.toLowerCase().includes("auth")) {
		// Warning only
		console.log(chalk.yellow("[SA] Observation: No explicit security considerations found."));
	}

	// Dimension 5: Performance
	if (!content.toLowerCase().includes("performance") && !content.toLowerCase().includes("big o")) {
		console.log(chalk.yellow("[SA] Observation: No explicit performance considerations found."));
	}

	// Dimension 6: Tech Stack Alignment
	if (!content.includes("tech stack") && !content.includes("Stack")) {
		issues.push("Tech stack or tools not explicitly mentioned.");
	}

	// Dimension 7: Verification
	if (!content.includes("Verification") && !content.includes("Success Criteria")) {
		issues.push("Missing verification steps or success criteria.");
	}

	if (issues.length === 0) {
		console.log(chalk.green.bold("✔ Plan PASSED all quality gates! Ready for execution."));
		return { success: true };
	} else {
		console.log(chalk.red.bold("✘ Plan REJECTED. Please address the following issues:"));
		issues.forEach((issue) => console.log(` - ${issue}`));
		return { success: false, issues };
	}
}

module.exports = { validatePlan };
