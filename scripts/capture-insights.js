const { KnowledgeGraph } = require('./kg-engine');
const { LivingDocs } = require('./living-docs');
const chalk = require('chalk');

/**
 * [AZ] Insight Capture
 * 
 * Analyzes the Graph and current state to populate Living Docs.
 */
async function captureInsights(projectRoot) {
  console.log(chalk.red.bold('\n--- 📜 [AZ] Capturing Living Insights ---\n'));

  const kg = new KnowledgeGraph(projectRoot);
  const docs = new LivingDocs(projectRoot);

  try {
    // 1. Identify "Hot" Files (most defined functions)
    const allNodes = await kg.memory.search('', { limit: 1000 });
    const fileNodes = allNodes.filter(n => n.meta?.type === 'FILE');
    const definesEdges = allNodes.filter(n => n.meta?.relation === 'DEFINES');

    const fileComplexity = fileNodes.map(f => ({
      id: f.id,
      count: definesEdges.filter(e => e.meta?.source === f.id).length
    })).sort((a, b) => b.count - a.count);

    if (fileComplexity.length > 0) {
      const topFile = fileComplexity[0];
      await docs.append('patterns', 'ANALYSIS', `**Complexity Peak**: \`${topFile.id}\` contains ${topFile.count} defined components. Consider modularizing if this grows.`);
    }

    // 2. Identify Orphan Tasks
    const tasks = allNodes.filter(n => n.meta?.type === 'TASK');
    const implementsEdges = allNodes.filter(n => n.meta?.relation === 'IMPLEMENTS');
    const orphans = tasks.filter(t => !implementsEdges.some(e => e.meta?.source === t.id));

    if (orphans.length > 0) {
      await docs.append('pitfalls', 'QA', `**Loose Ends**: ${orphans.length} tasks (e.g., \`${orphans[0].id}\`) are currently unlinked to any specification feature. Align them to avoid technical debt.`);
    }

    // 3. System Architecture Snapshot
    await docs.append('decisions', 'SYSTEM', `**Graph Baseline**: Knowledge Graph currently tracking ${allNodes.length} nodes across 5 dimensions (Semantic, Procedural, Episodic, Emotional, Reflective).`);

    console.log(chalk.green.bold('\n✔ Living Docs updated based on Graph Analysis.\n'));
  } catch (err) {
    console.error(chalk.red(`[Insights] Failed: ${err.message}`));
  }
}

module.exports = { captureInsights };
