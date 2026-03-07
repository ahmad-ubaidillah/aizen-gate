const { installAizenGate } = require("../../installer/src/install");

/**
 * Compatibility wrapper for the new Core Installer.
 * @param {string} projectRoot 
 * @param {object} options 
 */
async function runInstall(projectRoot, options = {}) {
	console.log(`[AZ] Running CLI Install Task...`);
	return await installAizenGate(projectRoot);
}

module.exports = { runInstall };
