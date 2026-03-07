const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { WorkPackage } = require('./wp-model');

/**
 * Analyzer: Detects drift between Spec, Plan, and Tasks.
 */
async function runAnalyzer(projectRoot, featureName) {
    console.log(chalk.red.bold('\n--- ⛩️ [Aizen] Cross-Artifact Consistency Analysis ---\n'));

    const specsDir = path.join(projectRoot, 'aizen-gate', 'specs');
    let activeFeature = featureName;
    
    if (!activeFeature) {
        const dirs = await fs.readdir(specsDir);
        activeFeature = dirs.find(d => fs.statSync(path.join(specsDir, d)).isDirectory());
    }

    if (!activeFeature) {
        console.log(chalk.yellow('[Aizen] No features found for analysis.'));
        return;
    }

    const featurePath = path.join(specsDir, activeFeature);
    const specPath = path.join(featurePath, 'spec.md');
    const planPath = path.join(featurePath, 'plan.md');
    
    const wps = await WorkPackage.loadAllWPs(featurePath);

    console.log(`[Aizen] Analyzing: ${chalk.cyan(activeFeature)}`);

    const gaps = [];

    // 1. SPEC vs PLAN
    if (fs.existsSync(specPath) && fs.existsSync(planPath)) {
        const spec = await fs.readFile(specPath, 'utf8');
        const plan = await fs.readFile(planPath, 'utf8');

        // Extract AC from Spec
        const specAc = spec.match(/- \[ \].*|- \[x\].*/g) || [];
        // Check if Plan addresses them
        specAc.forEach(ac => {
            const cleanAc = ac.replace(/\[.\]/, '').trim();
            if (!plan.includes(cleanAc)) {
                gaps.push({ type: 'DRIFT', msg: `Spec AC "${cleanAc}" is not explicitly addressed in plan.md` });
            }
        });
    }

    // 2. PLAN vs TASKS (WPs)
    if (fs.existsSync(planPath)) {
        const plan = await fs.readFile(planPath, 'utf8');
        
        // Extract planned tasks
        const plannedTasks = plan.match(/- \[ \].*/g) || [];
        plannedTasks.forEach(task => {
            const cleanTask = task.replace(/\[.\]/, '').trim();
            if (!wps.some(wp => wp.title.includes(cleanTask) || wp.content.includes(cleanTask))) {
                gaps.push({ type: 'ORPHAN', msg: `Planned task "${cleanTask}" has no corresponding Work Package (WP)` });
            }
        });
    }

    // 3. SCOPE CREEP (WPs without trace in Spec/Plan)
    wps.forEach(wp => {
        // Logic for scope creep detection (placeholder)
    });

    // Output Report
    if (gaps.length === 0) {
        console.log(chalk.green('\n✔ Analysis Complete: No drift or gaps detected between artifacts.'));
    } else {
        console.log(chalk.red(`\n✘ Found ${gaps.length} consistency issues:`));
        gaps.forEach(g => {
            const color = g.type === 'ORPHAN' ? chalk.yellow : chalk.red;
            console.log(` - ${color(`[${g.type}]`)} ${g.msg}`);
        });
    }

    const reportPath = path.join(projectRoot, 'aizen-gate', 'shared', 'analysis-report.md');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeFile(reportPath, `# Artifact Consistency Report\n\nFeature: ${activeFeature}\n\n${gaps.map(g => `- **${g.type}**: ${g.msg}`).join('\n') || 'No issues found.'}`);
}

module.exports = { runAnalyzer };
