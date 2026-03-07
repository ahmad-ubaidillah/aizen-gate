const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { TokenBudget } = require('./token-budget');
const { OutputFilter } = require('./output-filter');
const { MemoryStore } = require('./memory-store');

/**
 * [AZ] ContextEngine (v2.0)
 * 
 * Orchestrates budget enforcement, output filtering, and semantic memory 
 * into a high-efficiency context assembly pipeline.
 */
class ContextEngine {
    constructor(projectRoot, limits = {}) {
        this.projectRoot = projectRoot;
        this.budget = new TokenBudget(projectRoot, limits);
        this.filter = new OutputFilter();
        this.memory = new MemoryStore(projectRoot);
    }

    /**
     * Estimated token count using budget system heuristic.
     */
    estimateTokens(text) {
        return this.budget.estimate(text);
    }

    /**
     * Wraps result with XML tags and applies OutputFilter if it's tool output.
     */
    processToolOutput(commandType, rawOutput) {
      const filtered = this.filter.filter(rawOutput, commandType);
      return `<tool_output type="${commandType}">\n${filtered}\n</tool_output>`;
    }

    /**
     * Structure instructions with positional optimization (criticial bits at start and end).
     */
    formatXMLPrompt(wp, context) {
        // [Positional Optimization] Critical instructions at the top and bottom 
        // to leverage LLM attention bias.
        const header = `<task_execution wp_id="${wp.id}">\n<instruction>IMPORTANT: ${wp.title}</instruction>`;
        
        const semanticContext = this.memory.getFormattedMemory(wp.title);

        return `
${header}

${semanticContext}

<context_artifacts>
${context}
</context_artifacts>

<requirements_spec>
${wp.content}
</requirements_spec>

<constraints>
- Use project coding standards (Biome/Bun).
- Ensure 100% test coverage.
- [AZ-SAFE] Avoid breaking changes.
</constraints>

<reminder_instruction>
Execute WP ${wp.id} now following the above context and constraints.
</reminder_instruction>
</task_execution>
`;
    }

    /**
     * Assembles a fresh context for a specific WP with priority-based trimming.
     */
    async assembleWPContext(featureDir, wp) {
        let components = [];
        
        // 1. Load Specs (Priority: Mid)
        const specPath = path.join(featureDir, 'spec.md');
        if (fs.existsSync(specPath)) {
            const spec = await fs.readFile(specPath, 'utf8');
            components.push({ name: 'spec', content: spec, priority: 5 });
        }

        // 2. Load Plan (Priority: High)
        const planPath = path.join(featureDir, 'plan.md');
        if (fs.existsSync(planPath)) {
            const plan = await fs.readFile(planPath, 'utf8');
            components.push({ name: 'plan', content: plan, priority: 8 });
        }

        // 3. Current State / Research (Priority: Low)
        const researchPath = path.join(featureDir, 'research.md');
        if (fs.existsSync(researchPath)) {
            const research = await fs.readFile(researchPath, 'utf8');
            components.push({ name: 'research', content: research, priority: 3 });
        }

        // 4. SORT BY PRIORITY AND ASSEMBLE (Trimming if needed)
        // This ensures the Plan and Task description are preserved while Specs/Research are trimmed first.
        let finalContext = "";
        for (const comp of components.sort((a,b) => b.priority - a.priority)) {
          const processed = await this.budget.enforce(comp.name, comp.content);
          finalContext += `\n<artifact name="${comp.name}">\n${processed}\n</artifact>`;
        }

        return finalContext;
    }
}

module.exports = { ContextEngine };
