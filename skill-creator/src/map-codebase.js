const fs = require('fs');
const path = require('path');
const { detectStack } = require('./tech-detector');

/**
 * Aizen-Gate Codebase Mapper
 * Generates a project.md file based on the detected tech stack and project structure.
 */
function mapCodebase(projectRoot) {
    const stack = detectStack(projectRoot);
    const sharedDir = path.join(projectRoot, 'aizen-gate', 'shared');
    const projectMdPath = path.join(sharedDir, 'project.md');

    if (!fs.existsSync(sharedDir)) {
        fs.mkdirSync(sharedDir, { recursive: true });
    }

    const content = `---
name: Project Map
description: Automatically generated project architecture and stack report.
generatedAt: ${new Date().toISOString()}
---

# 🗺️ Project Map: ${path.basename(projectRoot)}

## 1. Tech Stack Overview

- **Languages**: ${stack.languages.join(', ') || 'Unknown'}
- **Frameworks**: ${stack.frameworks.join(', ') || 'None'}
- **Databases**: ${stack.databases.join(', ') || 'None'}
- **Libraries/Integrations**: ${stack.libraries.join(', ') || 'None'}
- **Tools**: ${stack.tools.join(', ') || 'None'}

## 2. Project Architecture (Detected Structure)

### Directory Structure (Top Level)
\`\`\`text
${fs.readdirSync(projectRoot, { withFileTypes: true })
    .filter(dirent => !dirent.name.startsWith('.') && dirent.name !== 'node_modules')
    .map(dirent => `${dirent.isDirectory() ? '📂 ' : '📄 '}${dirent.name}`)
    .join('\n')}
\`\`\`

## 3. Core Modules & Entry Points

${fs.existsSync(path.join(projectRoot, 'src')) ? '- **Sources**: Detected /src directory. Primary logic resides here.' : '- **Sources**: Flat structure or non-standard /src location.'}
${fs.existsSync(path.join(projectRoot, 'public')) ? '- **Public**: Detected static assets in /public.' : ''}
${fs.existsSync(path.join(projectRoot, 'tests')) || fs.existsSync(path.join(projectRoot, '__tests__')) ? '- **Tests**: Detected test suite location.' : '- **Tests**: No standard test directory found.'}

## 4. Patterns & Conventions

- **State Management**: ${stack.libraries.includes('Redux') || stack.libraries.includes('Zustand') ? 'Detected' : 'Not explicitly detected.'}
- **API Surface**: ${stack.frameworks.includes('Express') || stack.frameworks.includes('Next.js') ? 'Web API' : 'CLI or Library'}
- **Quality Gates**: ${fs.existsSync(path.join(projectRoot, '.eslintrc')) ? 'ESLint detected.' : 'No standard linting config found.'}

---

**[SA] Map generated.** This report is now the Source of Truth for the project's DNA.
`;

    fs.writeFileSync(projectMdPath, content);
    return projectMdPath;
}

module.exports = { mapCodebase };
