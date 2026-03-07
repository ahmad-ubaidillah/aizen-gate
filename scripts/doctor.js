const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { KnowledgeGraph } = require('./kg-engine');

/**
 * Aizen-Gate Shield Diagnostics
 * Performs environment checks and protocol adherence verification.
 */
async function runDoctor(projectRoot) {
    console.log(chalk.red.bold('\n--- ⛩️ [Aizen] Shield Health Check ---\n'));

    const aizenDir = path.join(projectRoot, 'aizen-gate');
    const sharedDir = path.join(aizenDir, 'shared');
    const skillsDir = path.join(aizenDir, 'skills');

    const checks = [
        {
            name: 'Environment: Node.js',
            check: () => process.version
        },
        {
            name: 'Environment: Git',
            check: () => execSync('git --version').toString().trim()
        },
        {
            name: 'Workspace: Aizen Directory',
            check: () => fs.existsSync(aizenDir)
        },
        {
            name: 'Workspace: Shared Memory',
            check: () => fs.existsSync(path.join(sharedDir, 'memory.db')) || fs.existsSync(path.join(sharedDir, 'memory.sqlite'))
        },
        {
            name: 'Workspace: Shield Board',
            check: () => fs.existsSync(path.join(sharedDir, 'board.md'))
        },
        {
            name: 'Workspace: State Tracker',
            check: () => fs.existsSync(path.join(sharedDir, 'state.md'))
        },
        {
            name: 'Workspace: Aizen-Gate PRD',
            check: () => fs.existsSync(path.join(sharedDir, 'project.md'))
        },
        {
            name: 'Graph Integrity: Orphan Controls',
            check: async () => {
                const kg = new KnowledgeGraph(projectRoot);
                const allNodes = await kg.memory.search('', { limit: 1000 });
                
                const features = allNodes.filter(n => n.meta?.type === 'FEAT');
                const tasks = allNodes.filter(n => n.meta?.type === 'TASK');
                const implementsEdges = allNodes.filter(n => n.meta?.relation === 'IMPLEMENTS');

                const orphans = features.filter(f => !implementsEdges.some(e => e.meta?.target === f.id));
                const unlinkedTasks = tasks.filter(t => !implementsEdges.some(e => e.meta?.source === t.id));

                let report = [];
                if (orphans.length > 0) report.push(chalk.yellow(`${orphans.length} Orphan Features`));
                if (unlinkedTasks.length > 0) report.push(chalk.yellow(`${unlinkedTasks.length} Unlinked Tasks`));
                
                return report.length > 0 ? report.join(', ') : 'Healthy';
            }
        },
        {
            name: 'Capacity: Skill Hub Count',
            check: () => {
                const subdirs = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());
                return `${subdirs.length} categories active`;
            }
        },
        {
            name: 'Compliance: CLAUDE.md / AGENTS.md / GEMINI.md',
            check: () => {
                const claude = fs.existsSync(path.join(projectRoot, 'CLAUDE.md'));
                const agents = fs.existsSync(path.join(projectRoot, 'AGENTS.md'));
                const gemini = fs.existsSync(path.join(projectRoot, 'GEMINI.md'));
                return claude || agents || gemini ? 'Present' : chalk.yellow('Not found (Optional)');
            }
        }
    ];

    let healthy = true;
    for (const { name, check } of checks) {
        try {
            const result = await Promise.resolve(check());
            if (result === false) {
                console.log(`${chalk.red('✘')} ${name}: ${chalk.red('Bypassed/Missing')}`);
                healthy = false;
            } else {
                console.log(`${chalk.green('✔')} ${name}: ${chalk.cyan(result === true ? 'Present' : result)}`);
            }
        } catch (err) {
            console.log(`${chalk.red('✘')} ${name}: ${chalk.red('Error: ' + err.message)}`);
            healthy = false;
        }
    }

    if (healthy) {
        console.log(chalk.green.bold('\n[Aizen] Shield operational! Protocol adherence 100%. ⛩️\n'));
    } else {
        console.log(chalk.red.bold('\n[Aizen] Component failure detected. Run "npx aizen-gate install" to repair.\n'));
    }

    return { healthy };
}


module.exports = { runDoctor };
