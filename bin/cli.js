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
 * 21. tokens - Token usage and savings report.
 * 22. kg - Knowledge Graph build and query.
 * 23. docs - Living Documentation (decisions, patterns, pitfalls).
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { select, confirm, input } = require('@inquirer/prompts');
const path = require('path');
const fs = require('fs-extra');

// Core Service Imports are now lazy-loaded inside action handlers to prevent early module initialization conflicts.

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
    const { installAizenGate } = require('../installer/src/install');
    console.log(chalk.red.bold('\n--- ⛩️ [AZ] Installation ---\n'));
    // In our mock/dev context, we use the local installer source
    const result = await installAizenGate(process.cwd(), options.yes ? 'antigravity' : null);

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
  .action(async () => {
    const { runDoctor } = require('../scripts/doctor');
    await runDoctor(process.cwd());
  });

program
  .command('map')
  .description('Map the codebase architecture to memory')
  .action(async () => {
    const { mapCodebase } = require('../scripts/mapper');
    await mapCodebase(process.cwd());
  });

// 3. Documentation Suite
const docsCmd = program
  .command('docs')
  .description('Documentation suite (generate, view, capture)');

docsCmd
  .command('generate')
  .description('Generate specifications and architecture documentation')
  .action(async () => {
    const { generateDocs } = require('../scripts/docs');
    await generateDocs(process.cwd());
  });

docsCmd
  .command('view')
  .description('View Living Documentation (decisions, patterns, pitfalls)')
  .action(async () => {
    const projectRoot = process.cwd();
    const { LivingDocs } = require('../scripts/living-docs');
    const docs = new LivingDocs(projectRoot);
    const context = await docs.getContext();
    console.log(chalk.red.bold('\n--- 📜 [AZ] Living Documentation ---\n'));
    console.log(context);
  });

docsCmd
  .command('capture')
  .description('Capture semantic insights from Knowledge Graph')
  .action(async () => {
    const { captureInsights } = require('../scripts/capture-insights');
    await captureInsights(process.cwd());
  });

// 3. Automation & Dash
program
  .command('auto')
  .description('Trigger the autonomous implementation wave loop')
  .action(async () => {
    const { runAutoLoop } = require('../scripts/auto-loop');
    await runAutoLoop(process.cwd());
  });

program
  .command('mcp')
  .description('Launch the Aizen-Gate MCP Server via stdio for AI integration')
  .action(() => {
    require('../scripts/mcp-server');
  });

program
  .command('dashboard')
  .description('Launch the live Kanban dashboard server')
  .option('-p, --port <number>', 'Port to run the dashboard on', '6420')
  .action(async (options) => {
    const { DashboardServer } = require('../dashboard/server');
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
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-plan Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-plan.md and generate an architectural plan."`));
  });

program
  .command('tasks')
  .description('Break down a feature plan into Backlog tasks')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-tasks Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-tasks.md and create md tasks in backlog/tasks using aizen-gate task create."`));
  });

const taskCmd = program
  .command('task')
  .description('Interactive Markdown Task CLI CRUD Operations');

taskCmd
  .command('create')
  .description('Create a new backlog task')
  .argument('<title>', 'Task title')
  .option('-p, --priority <level>', 'Task priority (high/medium/low)', 'medium')
  .option('-s, --status <status>', 'Initial status')
  .option('-a, --assignee <user>', 'Assign the task')
  .option('-l, --labels <labels>', 'Comma separated labels')
  .option('-d, --description <desc>', 'Task description text')
  .option('--no-dod-defaults', 'Skip appending DoD defaults')
  .action(async (title, options) => {
    const { TaskCLI } = require('../scripts/task-cli');
    const cli = new TaskCLI(process.cwd());
    await cli.create(title, options);
  });

taskCmd
  .command('list')
  .description('List all tasks')
  .action(async () => {
    const { TaskCLI } = require('../scripts/task-cli');
    const cli = new TaskCLI(process.cwd());
    await cli.list();
  });

taskCmd
  .command('edit')
  .description('Edit an existing task')
  .argument('<id>', 'Task ID to edit')
  .option('-p, --priority <level>', 'Update priority')
  .option('-s, --status <status>', 'Update status')
  .option('-a, --assignee <user>', 'Update assignee')
  .action(async (id, options) => {
    const { TaskCLI } = require('../scripts/task-cli');
    const cli = new TaskCLI(process.cwd());
    await cli.edit(id, options);
  });

taskCmd
  .command('search')
  .description('Fuzzy search across task content and AC')
  .argument('<query>', 'Search string')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-a, --assignee <assignee>', 'Filter by assignee')
  .action(async (query, options) => {
    const { TaskSearch } = require('../scripts/task-search');
    const search = new TaskSearch(process.cwd());
    await search.display(query, options);
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
  .command('verify')
  .description('Perform User Acceptance Testing (UAT) on a completed feature')
  .option('-f, --feature <slug>', 'Specify the feature to verify')
  .action(async (options) => {
    const { runVerifier } = require('../scripts/verifier');
    await runVerifier(process.cwd(), options.feature);
  });

program
  .command('merge')
  .description('Merge approved feature branches and cleanup worktrees')
  .action(async () => {
    console.log(chalk.red('\n--- ⛩️ [Aizen] Launching az-merge Playbook ---\n'));
    console.log(chalk.gray(`Invoke agent: "Read aizen-gate/commands/za-merge.md and start consensus sequence."`));
  });

program
  .command('export')
  .description('Export the current Kanban board to a versioned snapshot')
  .action(async () => {
    const { exportBoard } = require('../scripts/board-export');
    await exportBoard(process.cwd());
  });

program
  .command('ingest')
  .description('Ingest a text or markdown document into the Aizen-Gate Memory Store')
  .argument('<path>', 'File path to ingest')
  .action(async (targetPath) => {
    const { ingestDocument } = require('../scripts/ingest');
    await ingestDocument(process.cwd(), targetPath);
  });

program
  .command('quick')
  .description('Quick Mode: Implement a small feature or fix bypassing full pipeline')
  .argument('<description>', 'Task description for the quick flow')
  .action(async (description) => {
    const { runQuickFlow } = require('../scripts/quick-flow');
    await runQuickFlow(process.cwd(), description);
  });

program
  .command('fix')
  .description('Quick Mode: Fix a single bug bypassing full pipeline')
  .argument('<description>', 'Bug description for the quick fix')
  .action(async (description) => {
    const { runQuickFlow } = require('../scripts/quick-flow');
    await runQuickFlow(process.cwd(), `Fix: ${description}`);
  });

// 6. Maintenance & Skills
program
  .command('archive')
  .description('Compress token context and distill knowledge into memory')
  .action(async () => {
    const { compressContext } = require('../scripts/compress');
    console.log(chalk.red('\n--- ⛩️ [AZ] Starting context archival distillation ---\n'));
    await compressContext(process.cwd());
  });

program
  .command('benchmark')
  .description('Audit the workspace for protocol compliance and state health')
  .action(async () => {
    const { runBenchmark } = require('../scripts/benchmark');
    await runBenchmark(process.cwd());
  });

program
  .command('pause')
  .description('Safely pause the current session and persist state')
  .argument('[reason]', 'Optional reason for pausing')
  .action(async (reason) => {
    const { pauseSession } = require('../scripts/session-manager');
    await pauseSession(process.cwd(), reason);
  });

program
  .command('resume')
  .description('Resume a previously paused session')
  .action(async () => {
    const { resumeSession } = require('../scripts/session-manager');
    await resumeSession(process.cwd());
  });

program
  .command('tokens')
  .description('View token usage analysis and savings report')
  .action(async () => {
    const { TokenBudget } = require('../scripts/token-budget');
    const budget = new TokenBudget(process.cwd());
    const report = await budget.getReport();
    
    console.log(chalk.red.bold('\n--- ⛩️ [AZ] Token Efficiency Report ---\n'));
    if (typeof report === 'string') {
      console.log(chalk.yellow(report));
    } else {
      console.log(`${chalk.bold('Total Tokens:')} ${report.total_tokens.toLocaleString()}`);
      console.log(`${chalk.bold('Input Tokens:')} ${report.input_tokens.toLocaleString()} (${((report.input_tokens/report.total_tokens)*100).toFixed(1)}%)`);
      console.log(`${chalk.bold('Output Tokens:')} ${report.output_tokens.toLocaleString()} (${((report.output_tokens/report.total_tokens)*100).toFixed(1)}%)`);
      
      console.log('\n' + chalk.bold('Phase Breakdown:'));
      Object.entries(report.phase_breakdown).forEach(([phase, tokens]) => {
        console.log(`- ${chalk.cyan(phase.padEnd(12))}: ${tokens.toLocaleString()} tokens`);
      });

      console.log(`\n${chalk.green.bold('✔ Projecting ~45% savings via RTK + Mem0 optimization.')}`);
      console.log(chalk.gray(`Last Updated: ${new Date(report.last_updated).toLocaleString()}`));
    }
    console.log('');
  });

program
  .command('kg')
  .description('Manage project Knowledge Graph (build, query, trace)')
  .argument('[command]', 'build, query, trace', 'query')
  .argument('[param]', 'The query text or node ID')
  .action(async (cmd, param) => {
    const projectRoot = process.cwd();
    
    if (cmd === 'build') {
      const { KGScanner } = require('../scripts/kg-scanner');
      const scanner = new KGScanner(projectRoot);
      await scanner.build();
    } else if (cmd === 'query') {
      if (!param) return console.log(chalk.red('❌ Query text required.'));
      const { KnowledgeGraph } = require('../scripts/kg-engine');
      const kg = new KnowledgeGraph(projectRoot);
      const results = await kg.query(param);
      
      console.log(chalk.red.bold('\n--- 🧠 [AZ] Knowledge Search Results ---\n'));
      results.forEach((r, i) => {
        console.log(`${i+1}. [${chalk.cyan(r.meta?.type || 'NODE')}] ${chalk.bold(r.id)}`);
        console.log(chalk.gray(`   Score: ${r.score.toFixed(4)} | Tags: ${r.tags?.join(', ')}`));
        console.log(chalk.white(`   "${r.content.slice(0, 160).replace(/\n/g, ' ')}${r.content.length > 160 ? '...' : ''}"`));
        console.log('');
      });
    } else if (cmd === 'trace') {
      if (!param) return console.log(chalk.red('❌ Node ID required.'));
      const { KnowledgeGraph } = require('../scripts/kg-engine');
      const kg = new KnowledgeGraph(projectRoot);
      const trace = await kg.getTrace(param);
      
      console.log(chalk.red.bold(`\n--- 🔗 [AZ] Graph Trace for "${param}" ---\n`));
      trace.forEach((t, i) => {
        console.log(`${i+1}. [${chalk.cyan(t.type)}] ${t.id} -- Score: ${t.score.toFixed(4)}`);
        console.log(chalk.white(`   ${t.content.slice(0, 120)}...`));
      });
    } else {
      console.log(chalk.red(`❌ Unknown command: ${cmd}. Use build, query, or trace.`));
    }
    console.log('');
  });

program
  .command('constitution')
  .description('Define project principles and code standards via interactive interview')
  .action(async () => {
    const { runConstitution } = require('../scripts/constitution');
    await runConstitution(process.cwd());
  });

program
  .command('analyze')
  .description('Verify cross-artifact consistency between spec, plan, and tasks')
  .option('-f, --feature <slug>', 'Specify the feature to analyze')
  .action(async (options) => {
    const { runAnalyzer } = require('../scripts/analyzer');
    await runAnalyzer(process.cwd(), options.feature);
  });

program
  .command('clean')
  .description('Archive finished tasks/WPs and optimize workspace storage')
  .action(async () => {
    const { archiveTasks } = require('../scripts/archive-tasks');
    await archiveTasks(process.cwd());
  });

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

skillCmd
  .command('create')
  .description('Bootstrap a new custom skill locally')
  .argument('<name>', 'Name of the custom skill')
  .action(async (name) => {
    const skillDir = path.join(process.cwd(), 'aizen-gate', 'skills', 'custom', name);
    const skillFile = path.join(skillDir, 'SKILL.md');
    await fs.ensureDir(skillDir);
    const content = `# ${name} [Skill]\n- **Role:** [DEV]\n- **Description:** Enter description here.\n\n## 🛠️ Instructions\n1. Step one\n2. Step two\n\n## ⛩️ Phase Breakdown\nPhase logic here.\n`;
    await fs.writeFile(skillFile, content);
    console.log(chalk.green(`\n✔ Custom skill "${name}" bootstrapped at ${skillFile}`));
  });

// Catch-all: Routing to command playbooks
program
  .arguments('<unrecognized>')
  .action(async (cmd) => {
    const builtIn = ['install', 'start', 'status', 'doctor', 'map', 'docs', 'auto', 'dashboard', 'specify', 'research', 'plan', 'tasks', 'implement', 'review', 'merge', 'fix', 'archive', 'skill', 'benchmark', 'pause', 'resume', 'tokens', 'kg', 'constitution', 'analyze', 'clean', 'help'];
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
