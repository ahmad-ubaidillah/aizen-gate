const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { WorkPackage } = require('./wp-model');
const { DependencyGraph } = require('./dependency-graph');
const { WorktreeManager } = require('./worktree-manager');
const { DashboardServer } = require('../dashboard/server');

/**
 * Aizen-Gate Autonomous Shield (formerly za-auto)
 * The engine that powers the parallel implementation wave.
 */
async function runAutoLoop(projectRoot) {
    console.log(chalk.red.bold('\n--- ⛩️ [Aizen] Entering Autonomous Loop (Parallel Mode) ---\n'));

    const specsDir = path.join(projectRoot, 'aizen-gate', 'specs');
    if (!fs.existsSync(specsDir)) {
        console.log(chalk.red('[Aizen] No specs found. Run "npx aizen-gate specify" to start.'));
        return;
    }

    try {
        // Find the active feature (for simplicity, we take the first directory with tasks)
        const dirs = await fs.readdir(specsDir);
        let activeFeature = null;
        for (const dir of dirs) {
            if ((await fs.stat(path.join(specsDir, dir))).isDirectory() && fs.existsSync(path.join(specsDir, dir, 'tasks'))) {
                activeFeature = dir;
                break;
            }
        }

        if (!activeFeature) {
            console.log(chalk.yellow('[Aizen] No active features with Work Packages found.'));
            return { success: true, finished: true };
        }

        console.log(`[Aizen] Scanning feature: ${chalk.cyan(activeFeature)}`);
        
        const featureDir = path.join(specsDir, activeFeature);
        const wps = await WorkPackage.loadAllWPs(featureDir);
        
        if (wps.length === 0) {
            console.log(chalk.yellow('[Aizen] No Work Packages defined.'));
            return { success: true, finished: true };
        }

        const graph = new DependencyGraph(featureDir);
        await graph.build();
        
        // Find all "done" WPs
        const doneIds = wps.filter(w => w.lane === 'done').map(w => w.id);
        
        // Find executable WPs (planned + all deps are in done)
        const plannedWps = wps.filter(w => w.lane === 'planned');
        const executableWave = plannedWps.filter(wp => {
            const deps = graph.graph[wp.id] || [];
            return deps.every(depId => doneIds.includes(depId));
        });

        if (executableWave.length === 0) {
            const blocked = plannedWps.length > 0;
            if (blocked) {
                console.log(chalk.yellow(`[Aizen] ${plannedWps.length} pending WPs are BLOCKED by dependencies.`));
            } else {
                console.log(chalk.green('[Aizen] No pending tasks found. Shield state COMPLETE! ⛩️'));
            }
            return { success: true, finished: true };
        }

        console.log(`[Aizen] 🌊 Parallel Wave Identified: ${executableWave.map(w => w.id).join(', ')}`);
        
        const wtManager = new WorktreeManager(projectRoot);
        
        // Output instructions for parallel execution
        for (const wp of executableWave) {
            console.log(chalk.cyan(`\n>> Dispatching ${wp.id}: ${wp.title}`));
            
            // Move WP to Doing
            await wp.setLane('doing');
            
            let baseWp = null;
            if (wp.dependencies && wp.dependencies.length > 0) {
                baseWp = wp.dependencies[0]; 
            }
            
            try {
                const wtPath = wtManager.createWorktree(activeFeature, wp.id, baseWp);
                console.log(`   [Aizen] Worktree: ${wtPath}`);
                
                // XML Structured Prompt for the Subagent
                console.log(chalk.white(`\n<subagent_task wp_id="${wp.id}">`));
                console.log(chalk.white(`  <instruction>Implement ${wp.id} in isolated worktree ${wtPath}</instruction>`));
                console.log(chalk.white(`  <wp_content>\n${wp.content}\n  </wp_content>`));
                console.log(chalk.white(`</subagent_task>\n`));

            } catch(e) {
                console.log(chalk.red(`   [Aizen] Could not bootstrap ${wp.id}: ${e.message}`));
            }
        }
        
        console.log(chalk.yellow(`\n[Aizen] Shield loop active. Subagents, please consume the tasks above.`));
        return { success: true, wave: executableWave };


    } catch (error) {
        console.error(chalk.red(`\n[Aizen] Shield error: ${error.message}`));
        return { success: false, error: error.message };
    }
}


module.exports = { runAutoLoop };
