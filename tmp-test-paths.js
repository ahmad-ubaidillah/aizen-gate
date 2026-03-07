const { ContextEngine } = require("./src/memory/context-engine");
const engine = new ContextEngine(process.cwd());
console.log("Shared Dir:", engine.sharedDir);
const fs = require("fs-extra");
console.log("Exists:", fs.existsSync(engine.sharedDir));
