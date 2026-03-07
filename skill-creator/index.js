const { scrapeUrl } = require('./src/scraper');
const { generateSkillPrompt } = require('./src/skill-generator');
const { detectStack } = require('./src/tech-detector');
const { mapCodebase } = require('./src/map-codebase');
const fs = require('fs');
const path = require('path');

/**
 * Aizen-Gate Skill Creator Entry Point
 */
async function createSkill(url, outputPath) {
    try {
        const scrapedData = await scrapeUrl(url);
        const prompt = generateSkillPrompt(scrapedData);
        
        console.log(`[SA] Skill prompt generated for: ${url}`);
        const draftPath = outputPath.replace('.md', '.draft.md');
        fs.writeFileSync(draftPath, prompt);
        
        return { success: true, draftPath };
    } catch (error) {
        console.error(`[SA] Skill creation failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// CLI usage (internal trial)
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'map') {
        const root = args[1] || process.cwd();
        const mapPath = mapCodebase(root);
        console.log(`[SA] Map generated: ${mapPath}`);
    } else if (command === 'create') {
        const url = args[1];
        const outputPath = args[2] || path.join(__dirname, '../skills/custom/new-skill.md');
        if (!url) {
            console.log('Usage: node index.js create <url> [output-path]');
            process.exit(1);
        }
        createSkill(url, outputPath);
    } else {
        console.log('Usage:');
        console.log('  node index.js map [project-root]    - Generate project.md');
        console.log('  node index.js create <url> [output]  - Scrape and create skill');
        process.exit(1);
    }
}

module.exports = { createSkill, detectStack, mapCodebase };
