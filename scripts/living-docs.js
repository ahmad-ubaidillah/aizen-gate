const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * LivingDocs: Manages Decisions, Pitfalls, and Patterns shared across phases.
 */
class LivingDocs {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.sharedDir = path.join(projectRoot, 'aizen-gate', 'shared');
    this.docs = {
      decisions: path.join(this.sharedDir, 'decisions.md'),
      pitfalls: path.join(this.sharedDir, 'pitfalls.md'),
      patterns: path.join(this.sharedDir, 'patterns.md')
    };
  }

  async ensureDocs() {
    await fs.ensureDir(this.sharedDir);
    for (const [key, filePath] of Object.entries(this.docs)) {
        if (!fs.existsSync(filePath)) {
            const title = key.charAt(0).toUpperCase() + key.slice(1);
            await fs.writeFile(filePath, `# 📜 Project ${title}\n*Accumulated cross-phase insights.*\n\n`);
        }
    }
  }

  /**
   * Appends an entry to a specific document.
   */
  async append(type, phase, content) {
    if (!this.docs[type]) throw new Error(`Invalid doc type: ${type}`);
    await this.ensureDocs();
    
    const entry = `
### [${phase}] - ${new Date().toISOString().split('T')[0]}
${content}
---
`;
    await fs.appendFile(this.docs[type], entry);
    console.log(chalk.gray(`[Aizen] Insight captured in ${type}.md`));
  }

  /**
   * Returns a combined context of all living docs.
   */
  async getContext() {
    await this.ensureDocs();
    let context = "\n## 📜 CROSS-PHASE INSIGHTS\n";
    for (const [key, filePath] of Object.entries(this.docs)) {
        const content = await fs.readFile(filePath, 'utf8');
        context += `\n### ${key}\n${content.split('\n').slice(4).join('\n')}\n`; // Skip header
    }
    return context;
  }
}

module.exports = { LivingDocs };
