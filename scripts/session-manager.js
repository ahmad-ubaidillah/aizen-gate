const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Aizen-Gate Session Manager
 * Handles pausing and resuming work sessions by persisting state.
 */
async function pauseSession(projectRoot, reason = 'User requested pause') {
    const statePath = path.join(projectRoot, 'aizen-gate/shared/state.md');
    const boardPath = path.join(projectRoot, 'aizen-gate/shared/board.md');

    if (!fs.existsSync(statePath)) {
        console.log(chalk.red('[SA] state.md not found. Cannot pause.'));
        return;
    }

    console.log(chalk.yellow(`\n[SA] Pausing session: ${reason}`));

    // 1. Identify active tasks
    const boardContent = fs.readFileSync(boardPath, 'utf8');
    const activeTasksMatch = boardContent.match(/\|\s+(T-\d+)\s+\|\s+([^|]+)\s+\|\s+🚧 In Progress/g);
    const activeTasks = activeTasksMatch ? activeTasksMatch.map(m => m.match(/T-\d+/)[0]) : [];

    // 2. Write to state.md
    let stateContent = fs.readFileSync(statePath, 'utf8');
    const now = new Date().toISOString();
    
    stateContent = stateContent.replace(/Stopped at: .*/, `Stopped at: ${reason} (Tasks: ${activeTasks.join(', ') || 'None'})`);
    stateContent = stateContent.replace(/Last session: .*/, `Last session: ${now}`);
    
    fs.writeFileSync(statePath, stateContent);

    // 3. Create a Resume file (Instructional)
    const resumePath = path.join(projectRoot, 'aizen-gate/shared/continue-here.md');
    const resumeContent = `# Resume Work Instructions\n\n**Paused at:** ${now}\n**Reason:** ${reason}\n\n### Steps to Resume:\n1. Run \`npx aizen-gate resume\`\n2. Check \`aizen-gate/shared/board.md\` for tasks marked '🚧 In Progress'.\n3. Continue implementing according to the active PLAYBOOK.\n`;
    
    fs.writeFileSync(resumePath, resumeContent);

    console.log(chalk.green(`\n[SA] Session persisted. Read ${chalk.bold('aizen-gate/shared/continue-here.md')} when you return.`));
}

async function resumeSession(projectRoot) {
    const statePath = path.join(projectRoot, 'aizen-gate/shared/state.md');
    const resumePath = path.join(projectRoot, 'aizen-gate/shared/continue-here.md');

    if (!fs.existsSync(statePath)) {
        console.log(chalk.red('[SA] state.md not found. Cannot resume.'));
        return;
    }

    console.log(chalk.blue.bold('\n--- [SA] Resuming Aizen-Gate Session ---\n'));

    // 1. Read state
    const stateContent = fs.readFileSync(statePath, 'utf8');
    const lastStopped = stateContent.match(/Stopped at: (.*)/);
    
    if (lastStopped) {
        console.log(`[SA] Last activity was: ${chalk.cyan(lastStopped[1])}`);
    }

    // 2. Clean up resume file
    if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
        console.log(`[SA] Cleaned up temporary resume markers.`);
    }

    console.log(chalk.green(`[SA] Ready. Run ${chalk.bold('npx aizen-gate status')} or ${chalk.bold('npx aizen-gate auto')} to pick up work.`));
}

module.exports = { pauseSession, resumeSession };
