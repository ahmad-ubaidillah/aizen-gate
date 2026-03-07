const chalk = require('chalk');

/**
 * [RTK] Output Filter Engine
 * 
 * Intercepts tool/command output and applies 6 semantic compression strategies.
 * High-performance, heuristic-based, zero extra LLM cost.
 */
class OutputFilter {
  constructor(options = {}) {
    this.options = {
      level: 'balanced', // 'minimal' | 'balanced' | 'aggressive'
      ...options
    };
  }

  /**
   * Main entry point for filtering tool output.
   */
  filter(rawText, commandType) {
    if (!rawText || this.options.level === 'minimal') return rawText;

    switch (commandType) {
      case 'git_status': return this.filterGitStatus(rawText);
      case 'git_diff': return this.filterGitDiff(rawText);
      case 'git_log': return this.filterGitLog(rawText);
      case 'ls_la': return this.filterLsLa(rawText);
      case 'npm_test': return this.filterTestOutput(rawText);
      case 'cat': return this.filterCatOutput(rawText);
      case 'json': return this.filterJSON(rawText);
      case 'logs': return this.filterLogs(rawText);
      default: return this.filterGeneric(rawText);
    }
  }

  /**
   * Strategy: Stats Extraction for Git Status.
   */
  filterGitStatus(text) {
    const lines = text.split('\n');
    let staged = 0, modified = 0, untracked = 0;
    
    lines.forEach(l => {
      if (l.match(/^(M|A|D|R|C|U)\s/)) staged++;
      else if (l.includes('modified:')) modified++;
      else if (l.includes('untracked') || l.match(/^\??\s/)) untracked++;
    });

    if (staged + modified + untracked === 0) return "Working tree clean ✓";
    
    return `Git Status: ${staged} staged, ${modified} modified, ${untracked} untracked. [RTK Compact Stats]`;
  }

  /**
   * Strategy: Tree Compression for Ls -la.
   */
  filterLsLa(text) {
    const lines = text.split('\n').filter(l => l.trim() && !l.includes('total '));
    if (lines.length > 20) {
      const top = lines.slice(0, 10);
      const bottom = lines.slice(-5);
      return [...top, `... [${lines.length - 15} files hidden via RTK Tree Compression] ...`, ...bottom].join('\n');
    }
    return text;
  }

  /**
   * Strategy: Error-Only for Test Outputs.
   */
  filterTestOutput(text) {
    // Only keep lines with 'FAIL', 'Error:', or summary stats
    const lines = text.split('\n');
    const filtered = lines.filter(l => 
      l.includes('FAIL') || 
      l.includes('Error:') || 
      l.includes('failed') || 
      l.includes('PASS') || 
      l.match(/Tests:\s+\d+/i)
    );
    
    if (filtered.length === 0) return "Tests passed (details omitted) ✓";
    return filtered.join('\n');
  }

  /**
   * Strategy: Code Signature Extraction (Cat / Read).
   */
  filterCatOutput(text) {
    if (this.options.level === 'aggressive') {
      // Keep only function/class signatures, strip bodies
      return text.replace(/\{[\s\S]*?\n\}/g, '{ ... [Body stripped by RTK] }');
    }
    // Minimal: Strip comments
    return text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').trim();
  }

  /**
   * Strategy: Deduplication for Logs.
   */
  filterLogs(text) {
    const lines = text.split('\n');
    const counts = new Map();
    const result = [];

    lines.forEach(l => {
      const entry = l.trim();
      if (!entry) return;
      counts.set(entry, (counts.get(entry) || 0) + 1);
    });

    counts.forEach((count, line) => {
      result.push(count > 1 ? `${line} [×${count}]` : line);
    });

    return result.join('\n');
  }

  /**
   * Strategy: Structure-Only (JSON schema extraction).
   */
  filterJSON(text) {
    try {
      const data = JSON.parse(text);
      // Recursively extract keys and types
      const getSchema = (obj) => {
        if (Array.isArray(obj)) return obj.length > 0 ? [getSchema(obj[0])] : [];
        if (obj !== null && typeof obj === 'object') {
          const schema = {};
          Object.keys(obj).forEach(k => {
            schema[k] = getSchema(obj[k]);
          });
          return schema;
        }
        return typeof obj;
      };
      return JSON.stringify(getSchema(data), null, 2) + "\n[RTK Schema-Only Extraction]";
    } catch {
      return text;
    }
  }

  /**
   * Fallback: Truncate long irrelevant noise.
   */
  filterGeneric(text) {
    if (text.length > 2000) {
      return text.slice(0, 500) + `\n\n... [RTK Generic Truncation: ${text.length - 1000} chars removed] ...\n\n` + text.slice(-500);
    }
    return text;
  }
}

module.exports = { OutputFilter };
