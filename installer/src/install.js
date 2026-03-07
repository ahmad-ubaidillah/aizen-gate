const fs = require('fs-extra');
const path = require('path');
const { detectPlatform } = require('./detect-platform');
const { detectStack } = require('../../skill-creator/src/tech-detector');

/**
 * Aizen-Gate Core Installer (formerly za-install)
 * Handles file copying, environment setup, and Shield initialization.
 */
async function installAizenGate(targetDir, selectedPlatform = null) {
    try {
        const platform = selectedPlatform || detectPlatform();
        const stack = detectStack(targetDir);
        
        console.log(`[Aizen] Detected Platform: ${platform}`);
        console.log(`[Aizen] Detected Tech Stack: ${stack.languages.join(', ')}`);
        
        const aizenDir = path.join(targetDir, 'aizen-gate');
        
        // 1. Ensure target directory exists
        if (!fs.existsSync(aizenDir)) {
            console.log(`[Aizen] Initializing Aizen-Gate structure...`);
            fs.mkdirSync(aizenDir, { recursive: true });
        }
        
        // 2. Copy framework files
        const sourceDir = path.resolve(__dirname, '../../');
        
        // Skip installer and skill-creator files in the source-to-target copy
        const options = {
            filter: (src) => {
                const basename = path.basename(src);
                return !['installer', 'skill-creator', 'node_modules', '.git'].includes(basename);
            }
        };
        
        await fs.copy(sourceDir, aizenDir, options);
        console.log(`[Aizen] Shield files copied to: ${aizenDir}`);
        
        // 3. Initialize Shared State if not exists
        const sharedDir = path.join(aizenDir, 'shared');
        if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });

        const initFiles = [
            { path: 'board.md', template: 'board-template.md' },
            { path: 'state.md', template: 'state.md' },
            { path: 'project.md', template: 'project.md' },
            { path: 'research.md', template: 'research.md' }
        ];

        for (const file of initFiles) {
            const fullPath = path.join(sharedDir, file.path);
            if (!fs.existsSync(fullPath)) {
                console.log(`[Aizen] Initializing ${file.path}...`);
                const templatePath = path.join(aizenDir, 'templates', file.template);
                if (fs.existsSync(templatePath)) {
                    let content = fs.readFileSync(templatePath, 'utf8');
                    // Remove template frontmatter/headers if present
                    content = content.replace(/^---[\s\S]*?---\n/g, ''); 
                    content = content.replace(/^# .* Template\n/g, '');
                    fs.writeFileSync(fullPath, content.trim() + '\n');
                }
            }
        }
        
        const memoryPath = path.join(sharedDir, 'memory.md');
        if (fs.existsSync(memoryPath)) {
            console.log(`[Aizen] Customizing project memory...`);
            let memoryContent = fs.readFileSync(memoryPath, 'utf8');
            const stackStr = stack.languages.concat(stack.frameworks).join(', ');
            memoryContent = memoryContent.replace('{Detected/Selected Tech Stack}', stackStr);
            fs.writeFileSync(memoryPath, memoryContent);
        }

        // 4. Platform-Specific Injection
        console.log(`[Aizen] Injecting platform-specific Shield configurations for ${platform}...`);
        
        let slashCommandsText = '';
        try {
            const cmdsPath = path.join(aizenDir, 'templates/slash-commands/commands.json');
            if (fs.existsSync(cmdsPath)) {
                const cmds = JSON.parse(fs.readFileSync(cmdsPath, 'utf8'));
                for (const [key, val] of Object.entries(cmds)) {
                    slashCommandsText += `- \`/${key}\` -> ${val.description}\n  Prompt: ${val.prompt}\n`;
                }
            }
        } catch(e) { console.error('[Aizen] Failed to parse slash commands:', e.message); }

        const instructionPrefix = `\n\n### ⛩️ [Aizen] Aizen-Gate Integration
Use \`npx aizen-gate <command>\` to interact with the scrum team. 
Read the full manual at: \`${aizenDir}/AIZEN_GATE.md\`

**Slash Commands (IDE Native):**
${slashCommandsText}
`;

        // 1. Claude Code -> CLAUDE.md
        if (platform === 'claude-code' || platform === 'generic') {
            const claudePath = path.join(targetDir, 'CLAUDE.md');
            let content = fs.existsSync(claudePath) ? fs.readFileSync(claudePath, 'utf8') : '# Project Instructions\n';
            if (!content.includes('Aizen-Gate Integration')) {
                fs.writeFileSync(claudePath, content + instructionPrefix);
                console.log(`[Aizen] Updated CLAUDE.md`);
            }
        }

        // 2. Cursor -> .cursorrules
        if (platform === 'cursor') {
            const cursorPath = path.join(targetDir, '.cursorrules');
            fs.appendFileSync(cursorPath, instructionPrefix);
            console.log(`[Aizen] Updated .cursorrules`);
        }

        // 3. Gemini CLI / Antigravity -> GEMINI.md
        if (platform === 'antigravity' || platform === 'gemini') {
            const geminiPath = path.join(targetDir, 'GEMINI.md');
            fs.appendFileSync(geminiPath, instructionPrefix);
            console.log(`[Aizen] Updated GEMINI.md`);
        }

        // 4. GitHub Copilot -> .github/copilot-instructions.md
        if (platform === 'copilot') {
            const copilotDir = path.join(targetDir, '.github');
            if (!fs.existsSync(copilotDir)) fs.mkdirSync(copilotDir);
            const copilotPath = path.join(copilotDir, 'copilot-instructions.md');
            fs.appendFileSync(copilotPath, instructionPrefix);
            console.log(`[Aizen] Updated .github/copilot-instructions.md`);
        }

        // 5. Windsurf / Codex -> .windsurf/rules/
        if (platform === 'windsurf') {
            const windsurfDir = path.join(targetDir, '.windsurf', 'rules');
            if (!fs.existsSync(windsurfDir)) fs.mkdirSync(windsurfDir, { recursive: true });
            const windsurfPath = path.join(windsurfDir, 'rules.md');
            fs.appendFileSync(windsurfPath, instructionPrefix);
            console.log(`[Aizen] Updated .windsurf/rules/rules.md`);
        }

        // 6. Kiro / Kilo / OpenCode -> .kiro/ / .agents/
        if (platform === 'kiro' || platform === 'kilo') {
            const kiroDir = path.join(targetDir, `.${platform}`);
            if (!fs.existsSync(kiroDir)) fs.mkdirSync(kiroDir);
            const kiroPath = path.join(kiroDir, 'config.md');
            fs.appendFileSync(kiroPath, instructionPrefix);
            console.log(`[Aizen] Updated .${platform}/config.md`);
        }

        // Always update AGENTS.md for universal visibility
        const agentsPath = path.join(targetDir, 'AGENTS.md');
        if (!fs.existsSync(agentsPath) || !fs.readFileSync(agentsPath, 'utf8').includes('Shield Integration')) {
            fs.appendFileSync(agentsPath, instructionPrefix);
            console.log(`[Aizen] Updated AGENTS.md`);
        }

        console.log(`[Aizen] Shield installation complete! Use "npx aizen-gate start" to begin. ⛩️`);
        return { success: true, platform, stack };

    } catch (error) {
        console.error(`[Aizen] Shield failed to deploy: ${error.message}`);
        return { success: false, error: error.message };
    }
}


module.exports = { installAizenGate };
