const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { select, input, confirm } = require('@inquirer/prompts');

/**
 * Constitution: Interactive interview to set project DNA.
 */
async function runConstitution(projectRoot) {
    console.log(chalk.red.bold('\n--- ⛩️ [Aizen] Defining Project Constitution ---\n'));

    const constitutionPath = path.join(projectRoot, 'aizen-gate', 'shared', 'constitution.md');
    
    // Default values / existing if present
    let current = {};
    if (fs.existsSync(constitutionPath)) {
        console.log(chalk.yellow('[Aizen] Existing constitution found. Let\'s review/update it.'));
        // In a real scenario, we'd parse it back
    }

    const language = await input({ message: 'Primary Language?', default: 'TypeScript' });
    const framework = await input({ message: 'Primary Framework?', default: 'Next.js' });
    const qualityPriority = await select({
        message: 'Quality Priority?',
        choices: [
            { name: 'Stability (Test-driven, formal)', value: 'high' },
            { name: 'Velocity (Rapid iterations)', value: 'medium' },
            { name: 'Experimental (Proof-of-concept)', value: 'low' }
        ]
    });

    const standards = await input({ message: 'Linting/Coding Standard?', default: 'Biome/ESLint' });
    const testStack = await input({ message: 'Testing Stack?', default: 'Vitest' });

    const content = `
# 🌀 Aizen-Gate Project Constitution
*Generated: ${new Date().toISOString()}*

## 🏛️ Core Architectural DNA
- **Language:** ${language}
- **Framework:** ${framework}
- **Quality Mode:** ${qualityPriority}
- **Standards:** ${standards}
- **Testing:** ${testStack}

## ⚓ Principles
1. **Consistency:** All components must follow the established ${framework} patterns.
2. **Quality:** Maintain high coverage with ${testStack}.
3. **Traceability:** Documentation and code must stay in sync.
4. **Security:** No hardcoded secrets. Use .env placeholders.

## 🛡️ Governance
- Agents must refuse any architecture that violates these mandates.
- All Work Packages must be verified against this constitution before merge.
`;

    await fs.ensureDir(path.dirname(constitutionPath));
    await fs.writeFile(constitutionPath, content);

    console.log(chalk.green(`\n✔ Project Constitution saved to ${constitutionPath}`));
}

module.exports = { runConstitution };
