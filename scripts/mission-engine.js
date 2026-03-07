const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class MissionEngine {
  constructor(projectDir) {
    this.projectDir = projectDir;
    this.missionsDir = path.join(projectDir, 'aizen-gate/missions');
    this.configFile = path.join(projectDir, 'aizen-gate/shared/config.json');
  }

  init() {
    if (!fs.existsSync(this.missionsDir)) {
      fs.mkdirSync(this.missionsDir, { recursive: true });
    }
    
    // Define the baseline framework missions
    const devMission = {
      id: "software-dev",
      name: "Software Development",
      description: "Standard Spec-Driven Development Pipeline",
      phases: ["specify", "plan", "tasks", "implement", "review", "merge"],
      artifacts: {
        spec: "spec.md",
        plan: "plan.md",
        task: "WP*.md"
      }
    };
    
    const docsMission = {
      id: "documentation",
      name: "Documentation & Technical Writing",
      description: "Pipeline optimized for creating and updating project documentation.",
      phases: ["audit", "outline", "draft", "peer-review", "publish"],
      artifacts: {
        spec: "outline.md",
        plan: "style-guide.md",
        task: "DOC*.md"
      }
    };

    const researchMission = {
      id: "research",
      name: "R&D Prototype Exploration",
      description: "Fast-feedback loops for proving out new libraries or architectures.",
      phases: ["hypothesis", "sandbox", "benchmark", "report"],
      artifacts: {
        spec: "hypothesis.md",
        plan: "architecture-spike.md",
        task: "EXP*.md"
      }
    };

    fs.writeFileSync(path.join(this.missionsDir, 'software-dev.json'), JSON.stringify(devMission, null, 2));
    fs.writeFileSync(path.join(this.missionsDir, 'documentation.json'), JSON.stringify(docsMission, null, 2));
    fs.writeFileSync(path.join(this.missionsDir, 'research.json'), JSON.stringify(researchMission, null, 2));
  }

  getCurrentMission() {
    if (fs.existsSync(this.configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
        return config.mission || 'software-dev';
      } catch(e) {}
    }
    return 'software-dev'; 
  }

  switchMission(missionId) {
    this.init(); // Ensure files exist

    const missionFile = path.join(this.missionsDir, `${missionId}.json`);
    if (!fs.existsSync(missionFile)) {
      throw new Error(`Mission schema '${missionId}' not found.`);
    }

    let config = {};
    if (fs.existsSync(this.configFile)) {
      try {
        config = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
      } catch(e) {}
    }

    config.mission = missionId;
    
    const sharedDir = path.dirname(this.configFile);
    if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    
    const missionData = JSON.parse(fs.readFileSync(missionFile, 'utf-8'));
    console.log(chalk.green.bold(`\n🚀 Mission Identity Switched: ${missionData.name}`));
    console.log(chalk.italic(`"${missionData.description}"`));
    console.log(chalk.gray(`Active Pipeline: ${missionData.phases.join(' → ')}`));
    
    return missionData;
  }
}

module.exports = { MissionEngine };
