#!/usr/bin/env node

/**
 * Aizen-Gate CLI - Entry Point (v2.0)
 * 
 * Powered by multi-agent scrum, delivered by commander.
 * 
 * Commands:
 * 1. install - Install Aizen-Gate and detect tech stack.
 * 2. start - Start a new sprint session.
 * 3. status - View the scrum board and project memory.
 * 4. doctor - Workspace health and protocol audit.
 * 5. map - Architectural codebase mapping.
 * 6. docs - Generate internal/external documentation.
 * 7. auto - Autonomous implementation wave loop.
 * 8. dashboard - Launch the real-time Kanban UI.
 * 9. specify - Discovery interview for new features.
 * 10. research - Parallel architectural research phase.
 * 11. plan - Technical planning & Architectural debate.
 * 12. tasks - WPs decomposition with dependency analysis.
 * 13. implement - Manual focused execution of a WP.
 * 14. review - QA quality gate review.
 * 15. merge - Final branch merging and cleanup.
 * 16. fix - Rapid bug fixing (Quick Mode).
 * 17. archive - Context compression & memory distillation.
 * 18. skill - Marketplace: search, install, publish.
 * 19. benchmark - Protocol compliance check.
 * 20. pause/resume - Session persistence.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { select, confirm, input } = require('@inquirer/prompts');
const path = require('path');
const fs = require('fs-extra');

// Core Service Imports
const { installSuperagent } = require('../installer/src/install');
const { runAutoLoop } = require('../scripts/auto-loop');
const { runDoctor } = require('../scripts/doctor');
const { pauseSession, resumeSession } = require('../scripts/session-manager');
const { mapCodebase } = require('../scripts/mapper');
const { validatePlan } = require('../scripts/quality-gate');
const { generateDocs } = require('../scripts/docs');
const { runBenchmark } = require('../scripts/benchmark');
const { compressContext } = require('../scripts/compress');
const { DashboardServer } = require('../dashboard/server');
const { SkillHub } = require('../scripts/skill-hub');
const { DebateEngine } = require('../scripts/debate-engine');

const program = new Command();

program
  .name('aizen-gate')
  .description('The Ultimate AI-Orchestration & Specification Shield')
  .version('2.0.0');

// 1. Install
program
  .command('install')
  .description('Install Aizen-Gate into the current project workspace')
  .option('-y, --yes', 'Skip interactive prompts and use defaults')
  .action(async (options) => {
    console.log(chalk.red.bold('\n--- ⛩️ [Aizen] Installation ---\n'));
    // In our mock/dev context, we use the local installer source
    const result = await installSuperagent(process.cwd(), options.yes ? 'antigravity' : null);

    if (result.success) {
      console.log(chalk.green.bold('\n✔ Aizen-Gate successfully installed!'));
      console.log(`Detected Stack: ${chalk.cyan(result.stack.languages.join(', '))}`);
      console.log(`Manual: ${chalk.bold('aizen-gate/AIZEN_GATE.md')}`);
    } else {
      console.log(chalk.red.bold(`\n✖ Installation failed: ${result.error}`));
    }
  });

// 2. Lifecycle Commands
program
  .command('start')
  .description('Begin a new development session/sprint')
  .action(async () => {
    console.log(chalk.red.bold('\n--- ⛩️ [Aizen] Session Started ---\n'));
    console.log(chalk.yellow(`[Aizen] Loading personas for grooming. Try 'npx aizen-gate specify'.`));
  });

program
  .command('status')
  .description('Check the current status of the scrum board')
  .action(async () => {
    const boardPath = path.join(process.cwd(), 'aizen-gate/shared/board.md');
    if (fs.existsSync(boardPath)) {
      console.log(chalk.red.bold('\n--- ⛩️ Current Aizen Board ---\n'));
      const board = await fs.readFile(boardPath, 'utf8');
      console.log(board);
    } else {
      console.log(chalk.red('[Aizen] Board not found. Run "npx aizen-gate install" first.'));
    }
  });

program
  .command('doctor')
  .description('Run a health check on the workspace protocol')
  .action(async () => await runDoctor(process.cwd()));

program
  .command('map')
  .description('Map the codebase architecture to memory')
  .action(async () => await mapCodebase(process.cwd()));

program
  .command('docs')
  .description('Generate specifications and architecture documentation')
  .action(async () => await generateDocs(process.cwd()));

// 3. Automation & Dash
program
  .command('auto')
  .description('Trigger the autonomous implementation wave loop')
  .action(async () => await runAutoLoop(process.cwd()));

program
  .command('dashboard')
  .description('Launch the live Kanban dashboard server')
  .option('-p, --port <number>', 'Port to run the dashboard on', '6420')
  .action(async (options) => {
    const server = new DashboardServer(process.cwd(), parseInt(options.port));
    server.start();
  });

// 4. Spec-Driven Pipeline (Phase 1-4)
program
  .command('specify')
  .description('Adopt [PM] persona to interview user and create feature spec.md')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-specify Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-specify.md and start discovery."`));
  });

program
  .command('research')
  .description('Conduct parallel research phase for architectural validation')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-research Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-research.md and begin research."`));
  });

program
  .command('plan')
  .description('Generate technical architecture plan.md with [ARCH] debate')
  .option('-f, --feature <slug>', 'Specify the feature to plan')
  .action(async (options) => {
    if (options.feature) {
      const featureDir = path.join(process.cwd(), 'aizen-gate', 'specs', options.feature);
      if (fs.existsSync(featureDir)) {
          const engine = new DebateEngine(featureDir);
          console.log(chalk.red(`\n--- ⛩️ [Aizen] Initializing Architecture Debate for ${options.feature} ---\n`));
          console.log(chalk.gray(`Invoke agent: "Use scripts/debate-engine.js to record ARCH vs DEV proposals."`));
          return;
      }
    }
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-plan Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-plan.md and generate plan."`));
  });

program
  .command('tasks')
  .description('Break down a feature plan into Work Packages (WPs)')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-tasks Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-tasks.md and create WP files."`));
  });

// 5. Execution Pipeline (Phase 5-7)
program
  .command('implement')
  .description('Implement a specific Work Package manually')
  .argument('[wpId]', 'ID of the Work Package to implement')
  .action(async (wpId) => {
    console.log(chalk.red(`\n--- ⛩️ [Aizen] Launching az-implement Playbook for ${wpId || 'next available'} ---\n`));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-implement.md and implement."`));
  });

program
  .command('review')
  .description('Perform QA review on a completed Work Package')
  .argument('[wpId]', 'ID of the Work Package to review')
  .action(async (wpId) => {
    console.log(chalk.red(`\n--- ⛩️ [Aizen] Launching az-review Playbook for ${wpId || 'next'} ---\n`));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-review.md and perform review."`));
  });

program
  .command('merge')
  .description('Merge approved feature branches and cleanup worktrees')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-merge Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-merge.md and start consensus sequence."`));
  });

program
  .command('fix')
  .description('Quick Mode: Fix a single bug bypassing full pipeline')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-fix Playbook (Quick Mode) ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-fix.md and apply fix directly."`));
  });

// 6. Maintenance & Skills
program
  .command('archive')
  .description('Compress token context and distill knowledge into memory')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Starting context archival distillation ---\n'));
    await compressContext(process.cwd());
  });

program
  .command('benchmark')
  .description('Audit the workspace for protocol compliance and state health')
  .action(async () => await runBenchmark(process.cwd()));

program
  .command('pause')
  .description('Safely pause the current session and persist state')
  .argument('[reason]', 'Optional reason for pausing')
  .action(async (reason) => await pauseSession(process.cwd(), reason));

program
  .command('resume')
  .description('Resume a previously paused session')
  .action(async () => await resumeSession(process.cwd()));

// 7. Skill Marketplace
const skillCmd = program.command('skill').description('Manage and install agent skills from the library');

skillCmd
  .command('search')
  .description('Search the Antigravity 1.2k+ skill library')
  .argument('<query>', 'Keywords to search')
  .action(async (query) => {
    const hub = new SkillHub(process.cwd());
    const results = await hub.search(query);
    console.log(chalk.blue(`\n--- [SA] Marketplace Search: "${query}" ---\n`));
    if (results.length === 0) console.log(chalk.gray('No matches found.'));
    results.forEach(s => {
      console.log(`${chalk.bold.cyan(s.id || s.name)} | ${chalk.gray(s.category || 'misc')}`);
      console.log(`${s.description}\n`);
    });
  });

skillCmd
  .command('install')
  .description('Install a skill from the marketplace')
  .argument('<id>', 'Skill ID to install')
  .action(async (id) => {
    const hub = new SkillHub(process.cwd());
    try {
      const res = await hub.install(id);
      console.log(chalk.green(`\n✔ Installed skill "${res.name}" into ${res.path}`));
    } catch (e) {
      console.error(chalk.red(`\n✖ Installation failed: ${e.message}`));
    }
  });

skillCmd
  .command('publish')
  .description('Prepare a local skill for community submission')
  .argument('<name>', 'Local skill name')
  .action(async (name) => {
    const hub = new SkillHub(process.cwd());
    await hub.publish(name);
  });

// Catch-all: Routing to command playbooks
program
  .arguments('<unrecognized>')
  .action(async (cmd) => {
    const builtIn = ['install', 'start', 'status', 'doctor', 'map', 'docs', 'auto', 'dashboard', 'specify', 'research', 'plan', 'tasks', 'implement', 'review', 'merge', 'fix', 'archive', 'benchmark', 'pause', 'resume', 'skill', 'help'];
    if (builtIn.includes(cmd)) return;

    const mkPath = path.join(process.cwd(), 'aizen-gate', 'commands', `sa-${cmd}.md`);
    const azPath = path.join(process.cwd(), 'aizen-gate', 'commands', `az-${cmd}.md`);
    const saPath = path.join(process.cwd(), 'aizen-gate', 'commands', `${cmd}.md`);
    
    const playbookPath = fs.existsSync(azPath) ? azPath : (fs.existsSync(mkPath) ? mkPath : (fs.existsSync(saPath) ? saPath : null));

    if (playbookPath) {
        console.log(chalk.red(`\n⛩️ [Aizen] Routing to playbook: ${chalk.bold(cmd)}`));
        console.log(chalk.gray(`Invoke: "Follow playbook at ${playbookPath}"`));
    } else {
        console.log(chalk.red(`Error: Unknown command "${cmd}".`));
        program.help();
    }
  });

program.parse(process.argv);
