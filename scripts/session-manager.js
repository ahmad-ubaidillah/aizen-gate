const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const matter = require('gray-matter');

/**
 * Aizen-Gate Session Manager
 * Handles pausing and resuming work sessions by persisting state.
 */
async function pauseSession(projectRoot, reason = 'User requested pause') {
    const sharedDir = path.join(projectRoot, 'aizen-gate', 'shared');
    const handoffPath = path.join(sharedDir, 'handoff.md');
    const statePath = path.join(sharedDir, 'state.md');
    const boardPath = path.join(sharedDir, 'board.md');

    console.log(chalk.yellow(`\n[Aizen] Pausing session: ${reason}`));

    // 1. Collect session state
    const now = new Date().toISOString();
    const handoffData = {
        paused_at: now,
        reason: reason,
        active_feature: null,
        active_wave: [],
        decisions_summary: '',
        pitfalls_to_avoid: ''
    };

    // Try to find active feature from specs dir
    const specsDir = path.join(projectRoot, 'aizen-gate', 'specs');
    if (fs.existsSync(specsDir)) {
        const dirs = await fs.readdir(specsDir);
        for (const dir of dirs) {
            const tasksDir = path.join(specsDir, dir, 'tasks');
            if (fs.existsSync(tasksDir)) {
                // Check for WPs in 'doing'
                const { WorkPackage } = require('./wp-model');
                const wps = await WorkPackage.loadAllWPs(path.join(specsDir, dir));
                const doingWps = wps.filter(w => w.lane === 'doing');
                if (doingWps.length > 0) {
                    handoffData.active_feature = dir;
                    handoffData.active_wave = doingWps.map(w => w.id);
                    break;
                }
            }
        }
    }

    // 2. Generate Handoff Document
    const handoffContent = `
# 🌀 Aizen-Gate Handoff Document

This document captures the current state of the architecture and development loop.
Refer to this when resuming the session.

## System Context
- **Active Feature:** ${handoffData.active_feature || 'None'}
- **Active Wave:** ${handoffData.active_wave.join(', ') || 'None'}

## Development Summary
The session was paused while working on the tasks listed above. 
Current implementation focus remains on satisfying the Work Package requirements.

## Blockers & Tensions
None identified at time of pause.

## Immediate Next Steps
1. Run \`npx aizen-gate resume\` to restore markers.
2. Review the active Work Packages in \`aizen-gate/specs/${handoffData.active_feature || '...'}/tasks/\`.
3. Resume the autonomous implement wave with \`npx aizen-gate auto\`.
`;

    const finalOutput = matter.stringify(handoffContent, handoffData);
    await fs.ensureDir(sharedDir);
    await fs.writeFile(handoffPath, finalOutput);

    // 3. Update state.md if it exists
    if (fs.existsSync(statePath)) {
        let stateContent = await fs.readFile(statePath, 'utf8');
        stateContent = stateContent.replace(/Stopped at: .*/, `Stopped at: ${reason} (Paused)`);
        stateContent = stateContent.replace(/Last session: .*/, `Last session: ${now}`);
        await fs.writeFile(statePath, stateContent);
    }

    console.log(chalk.green(`\n✔ Session paused safely. Summary in ${chalk.bold('aizen-gate/shared/handoff.md')}`));
}

async function resumeSession(projectRoot) {
    const handoffPath = path.join(projectRoot, 'aizen-gate', 'shared', 'handoff.md');

    if (!fs.existsSync(handoffPath)) {
        console.log(chalk.yellow('[Aizen] No handoff document found. Starting fresh session.'));
        return;
    }

    const fileContent = await fs.readFile(handoffPath, 'utf8');
    const { data } = matter(fileContent);

    console.log(chalk.blue.bold('\n--- ⛩️ Resuming Aizen-Gate Session ---\n'));
    console.log(`[Aizen] Paused at: ${chalk.cyan(data.paused_at)}`);
    console.log(`[Aizen] Reason: ${chalk.cyan(data.reason)}`);
    
    if (data.active_feature) {
        console.log(`[Aizen] Restoring Active Feature: ${chalk.bold(data.active_feature)}`);
        console.log(`[Aizen] Active Wave: ${chalk.yellow(data.active_wave.join(', '))}`);
    }

    // Cleanup handoff
    await fs.unlink(handoffPath);
    console.log(chalk.green(`\n✔ Handoff markers cleared. Happy coding!`));
}

module.exports = { pauseSession, resumeSession };
