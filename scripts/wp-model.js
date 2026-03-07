const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

class WorkPackage {
  constructor(data, originalContent, filePath) {
    this.id = data.id || 'WP00';
    this.title = data.title || 'Untitled WP';
    this.lane = data.lane || 'planned';
    this.dependencies = data.dependencies || [];
    this.assignedAgent = data.assignedAgent || null;
    this.content = originalContent || '';
    this.filePath = filePath || null;
  }

  static async loadFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parsed = matter(fileContent);
    return new WorkPackage(parsed.data, parsed.content, filePath);
  }

  async save() {
    if (!this.filePath) {
      throw new Error("Cannot save WP without a file path.");
    }
    const frontmatter = {
      id: this.id,
      title: this.title,
      lane: this.lane,
      dependencies: this.dependencies,
      assignedAgent: this.assignedAgent,
    };
    
    // matter.stringify takes the string content and frontmatter object
    const updatedContent = matter.stringify(this.content, frontmatter);
    await fs.writeFile(this.filePath, updatedContent, 'utf8');
  }

  static async loadAllWPs(featureDir) {
    const tasksDir = path.join(featureDir, 'tasks');
    if (!fs.existsSync(tasksDir)) return [];

    const files = await fs.readdir(tasksDir);
    const mdFiles = files.filter(f => f.startsWith('WP') && f.endsWith('.md'));

    const wps = [];
    for (const file of mdFiles) {
      const fullPath = path.join(tasksDir, file);
      const wp = await WorkPackage.loadFromFile(fullPath);
      wps.push(wp);
    }
    return wps;
  }

  async setLane(newLane) {
    const validLanes = ['planned', 'doing', 'review', 'done'];
    if (!validLanes.includes(newLane)) {
      throw new Error(`Invalid lane: ${newLane}`);
    }
    this.lane = newLane;
    await this.save();
  }
}

module.exports = { WorkPackage };
