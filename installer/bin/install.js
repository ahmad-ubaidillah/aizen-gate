#!/usr/bin/env node

const { installAizen-Gate } = require('../src/install');
const path = require('path');

/**
 * Aizen-Gate CLI Entry Point (npx superagent init)
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'init';
    const targetDir = args[1] || process.cwd();

    console.log(`[SA] Running Aizen-Gate CLI: ${command}`);

    switch (command) {
        case 'init':
            const { success, platform, stack } = await installAizen-Gate(targetDir);
            if (success) {
                console.log(`[SA] Successfully initialized Aizen-Gate for ${platform}.`);
                console.log(`[SA] Tech stack identified: ${stack.languages.join(', ')}`);
            } else {
                process.exit(1);
            }
            break;
        case 'help':
            console.log('Aizen-Gate CLI Commands:');
            console.log('  init [target-dir]  Initialize a new Aizen-Gate project');
            console.log('  help               Show this help message');
            break;
        default:
            console.log(`[SA] Unknown command: ${command}`);
            process.exit(1);
    }
}

main().catch(error => {
    console.error(`[SA] Unexpected error: ${error.message}`);
    process.exit(1);
});
