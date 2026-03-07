const fs = require('fs');
const path = require('path');

/**
 * AI Platform Detector
 * Identifies which AI assistant platform the user is likely using.
 */
function detectPlatform() {
    // 1. Check for Claude Code
    if (process.env.CLAUDE_CODE_VERSION || fs.existsSync(path.join(process.cwd(), '.claudecode'))) {
        return 'claude-code';
    }

    // 2. Check for Cursor
    if (process.env.CURSOR_VERSION || fs.existsSync(path.join(process.cwd(), '.cursor'))) {
        return 'cursor';
    }

    // 3. Check for Antigravity (Gemini)
    if (process.env.GEMINI_HOME || fs.existsSync(path.join(process.cwd(), '.gemini'))) {
        return 'antigravity';
    }

    // 4. Check for GitHub Copilot
    if (process.env.GITHUB_COPILOT_CMD || fs.existsSync(path.join(process.cwd(), '.github/copilot-instructions.md'))) {
        return 'copilot';
    }

    // 5. Default to Generic
    return 'generic';
}

module.exports = { detectPlatform };
