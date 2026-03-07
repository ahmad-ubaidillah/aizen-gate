const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Aizen-Gate Model Debate Engine (v2.0)
 * Facilitates the "Architect vs Developer" debate crucial for the za-plan phase.
 */
class DebateEngine {
  constructor(featureDir) {
    this.featureDir = featureDir;
    this.debateLogPath = path.join(featureDir, 'debate_log.md');
    this.proposals = [];
    this.critiques = [];
  }

  /**
   * Add an initial proposal from the [ARCH] persona.
   */
  async addProposal(agentName, content) {
    this.proposals.push({ agentName, content, timestamp: new Date().toISOString() });
    await this.persist();
  }

  /**
   * Add a Socratic critique from the [DEV] persona.
   */
  async addCritique(agentName, content, targetProposalIndex = 0) {
    this.critiques.push({ agentName, content, targetProposalIndex, timestamp: new Date().toISOString() });
    await this.persist();
  }

  /**
   * Synthesize the consensus into the final plan.md XML block.
   */
  async synthesize(consensusContent) {
    console.log(chalk.blue.bold('\n--- [SA] Synthesizing Model Debate Consensus ---\n'));
    
    const finalDecision = `
<architecture_consensus>
  <summary>Synthesized from ${this.proposals.length} proposals and ${this.critiques.length} critiques.</summary>
  <decisions>
    ${consensusContent}
  </decisions>
</architecture_consensus>
    `;

    // Write to plan.md if it exists, otherwise return the string
    const planPath = path.join(this.featureDir, 'plan.md');
    if (fs.existsSync(planPath)) {
      let plan = await fs.readFile(planPath, 'utf8');
      if (plan.includes('## Architecture Consensus')) {
        plan = plan.replace(/## Architecture Consensus[\s\S]*$/, `## Architecture Consensus\n\n${finalDecision}`);
      } else {
        plan += `\n\n## Architecture Consensus\n\n${finalDecision}`;
      }
      await fs.writeFile(planPath, plan);
      console.log(chalk.green(`✔ Consensus synthesized into plan.md`));
    }

    return finalDecision;
  }

  /**
   * Persist the ongoing debate to a markdown file for visibility.
   */
  async persist() {
    let log = `# Debate Log: ${path.basename(this.featureDir)}\n\n`;
    
    log += `## Proposals\n\n`;
    this.proposals.forEach((p, i) => {
      log += `### ${i+1}. ${p.agentName} (${p.timestamp})\n${p.content}\n\n`;
    });

    log += `## Critiques & Socratic Pushback\n\n`;
    this.critiques.forEach((c, i) => {
      log += `### ${i+1}. ${c.agentName} RE Proposal ${c.targetProposalIndex+1}\n${c.content}\n\n`;
    });

    await fs.writeFile(this.debateLogPath, log);
    console.log(chalk.gray(`[SA] Debate log updated: ${this.debateLogPath}`));
  }
}

module.exports = { DebateEngine };
