const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { MemoryBridge } = require('./memory-bridge');

/**
 * Aizen-Gate Context Token Distillation 
 * Moves old "Done" tasks out of board.md and trims redundant state.md lines
 * to drastically reduce API token context payloads.
 */
async function compressContext(projectRoot) {
    console.log(chalk.yellow.bold('\n--- [OPS] Compressing Tokens & Distilling Memory ---\n'));

    const memory = new MemoryBridge(path.basename(projectRoot));
    const sharedDir = path.join(projectRoot, 'aizen-gate', 'shared');
    const boardPath = path.join(sharedDir, 'board.md');
    const archiveDir = path.join(sharedDir, 'archive');
    const archivePath = path.join(archiveDir, 'board-history.md');
    const statePath = path.join(sharedDir, 'state.md');

    try {
        await fs.ensureDir(archiveDir);
        let archiveContent = fs.existsSync(archivePath) ? fs.readFileSync(archivePath, 'utf8') : '# Board History Archive\n\n| ID | Task | Completed By | Date | Review Result |\n|:---|:---|:---|:---|:---|\n';

        if (fs.existsSync(boardPath)) {
            const boardData = fs.readFileSync(boardPath, 'utf8');
            const lines = boardData.split('\n');
            let newLines = [];
            let inCompletedSection = false;
            let strippedTasks = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('## Completed Tasks')) {
                    inCompletedSection = true;
                    newLines.push(line);
                    continue;
                }
                
                if (inCompletedSection && line.startsWith('## ')) {
                    inCompletedSection = false; 
                }

                if (inCompletedSection && line.startsWith('|') && !line.includes('| ID |') && !line.includes('|:--')) {
                    // Extract completed row and push to archive/memory
                    archiveContent += `${line}\n`;
                    strippedTasks++;
                    
                    // SIFTING: Distill significant tasks into Long-Term Memory
                    const taskParts = line.split('|').map(p => p.trim()).filter(Boolean);
                    if (taskParts.length >= 2) {
                        const taskId = taskParts[0];
                        const taskDesc = taskParts[1];
                        await memory.storeDecision(`Completed Task: ${taskDesc}`, ['history', taskId]);
                    }
                } else {
                    newLines.push(line);
                }
            }
            
            if (strippedTasks > 0) {
                fs.writeFileSync(boardPath, newLines.join('\n'));
                fs.writeFileSync(archivePath, archiveContent);
                console.log(chalk.green(`✔ Archived ${strippedTasks} completed tasks out of active context.`));
            } else {
                console.log(chalk.gray(`No new completed tasks to archive.`));
            }
        }

        if (fs.existsSync(statePath)) {
            let stateData = fs.readFileSync(statePath, 'utf8');
            const lines = stateData.split('\n');
            if (lines.length > 50) {
                const header = lines.slice(0, 10);
                const footer = lines.slice(-20);
                const compressed = [...header, '\n... [Older contextual memory compressed via za-compress] ...\n', ...footer].join('\n');
                fs.writeFileSync(statePath, compressed);
                console.log(chalk.green(`✔ Compressed state.md to save active Token Window memory.`));
            } else {
                console.log(chalk.gray(`state.md is already well within context limits.`));
            }
        }

        console.log(chalk.white(`\n[OPS] Agent context is now highly optimized for cheaper LLM execution.`));
        return { success: true };

    } catch (err) {
        console.error(chalk.red(`\n[OPS] Compression failed: ${err.message}`));
        return { success: false, error: err.message };
    }
}

module.exports = { compressContext };
