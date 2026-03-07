const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Aizen-Gate Shield Evaluation & Benchmark (v2.0)
 * Performs a deep audit of the workspace to ensure the agent team is 
 * adhering to the Aizen-Gate Shield protocols.
 */
async function runBenchmark(projectRoot) {
    console.log(chalk.magenta.bold('\n--- ⛩️ [Shield] Agent Benchmark & Compliance Evaluation ---\n'));
    
    const saDir = path.join(projectRoot, 'aizen-gate');
    const specsDir = path.join(saDir, 'specs');
    const sharedDir = path.join(saDir, 'shared');
    
    let totalChecks = 0;
    let passedChecks = 0;

    const assertCondition = (name, condition, severity = 'high') => {
        totalChecks++;
        if (condition) {
            console.log(chalk.green(`✔ PASS | [${severity.toUpperCase()}] ${name}`));
            passedChecks++;
        } else {
            const color = severity === 'high' ? chalk.red : chalk.yellow;
            console.log(color(`✖ FAIL | [${severity.toUpperCase()}] ${name}`));
        }
    };

    try {
        // 1. Structural File Integrity
        assertCondition('Project contains Aizen-Gate core directory', fs.existsSync(saDir));
        assertCondition('Project contains shared/constitution.md', fs.existsSync(path.join(sharedDir, 'constitution.md')));
        assertCondition('Project contains shared/state.md', fs.existsSync(path.join(sharedDir, 'state.md')));

        // 2. Shield Pipeline Compliance
        if (fs.existsSync(specsDir)) {
          const features = fs.readdirSync(specsDir).filter(f => fs.statSync(path.join(specsDir, f)).isDirectory());
          assertCondition('Has at least one active feature spec', features.length > 0, 'medium');

          for (const feature of features) {
            const fDir = path.join(specsDir, feature);
            assertCondition(`Feature [${feature}] has spec.md`, fs.existsSync(path.join(fDir, 'spec.md')));
            
            const planPath = path.join(fDir, 'plan.md');
            if (fs.existsSync(planPath)) {
              const plan = fs.readFileSync(planPath, 'utf8');
              const hasArchitectureTags = plan.includes('<architecture>') && plan.includes('</architecture>');
              assertCondition(`Feature [${feature}] uses Aizen-Tags (XML) in plan.md`, hasArchitectureTags);
            } else {
              assertCondition(`Feature [${feature}] has plan.md (Pending Plan Mode)`, false, 'medium');
            }

            const tasksDir = path.join(fDir, 'tasks');
            if (fs.existsSync(tasksDir)) {
              const wps = fs.readdirSync(tasksDir).filter(t => t.endsWith('.md'));
              assertCondition(`Feature [${feature}] has decomposed Work Packages`, wps.length > 0);
              
              if (wps.length > 0) {
                const headWP = fs.readFileSync(path.join(tasksDir, wps[0]), 'utf8');
                const hasTaskTags = headWP.includes('<task>') && headWP.includes('</task>');
                assertCondition(`Feature [${feature}] WPs use Aizen-Tags (XML) task prompts`, hasTaskTags);
              }
            }
          }
        }

        // 3. Environment Integrity
        assertCondition('Isolated worktrees directory initialized (.worktrees/)', fs.existsSync(path.join(projectRoot, '.worktrees')), 'medium');
        assertCondition('Aizen-Pulse Server config exists', fs.existsSync(path.join(saDir, 'dashboard', 'server.js')), 'low');

        // 4. Score Calculation
        console.log(chalk.red('\n--- ⛩️ [Shield] FINAL SCORECARD ---'));
        const percentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
        const scoreColor = percentage >= 90 ? chalk.green.bold : (percentage >= 70 ? chalk.yellow.bold : chalk.red.bold);
        
        console.log(`Shield Compliance: ${scoreColor(`${percentage}%`)} (${passedChecks}/${totalChecks} constraints met)\n`);
        
        if (percentage < 80) {
            console.log(chalk.red('[CRITICAL] Quality Gate Violation. Agent behavior is deviating from Aizen-Gate Shield protocols.'));
            console.log(`Recommendation: Re-run ${chalk.bold('npx aizen-gate install')} or run ${chalk.bold('npx aizen-gate doctor')} to repair.`);
        } else if (percentage < 100) {
            console.log(chalk.yellow('[NOTICE] Protocol Coherence Degradation. Minor protocol gaps detected.'));
        } else {
            console.log(chalk.green('[EXCELLENT] Agents are performing at Aizen-Gate ELITE level. Zero protocol leakage. ⛩️'));
        }

        return { success: true, score: percentage };

    } catch (err) {
        console.error(chalk.red(`\n[Shield] Benchmark failed to run: ${err.message}`));
        return { success: false, error: err.message };
    }
}


module.exports = { runBenchmark };
