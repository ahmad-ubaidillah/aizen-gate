const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs-extra');
const { WorkPackage } = require('../scripts/wp-model');

class DashboardServer {
  constructor(projectDir, port = 6420) {
    this.projectDir = projectDir;
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.watchers = {};
    
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(express.json());

    this.setupRoutes();
    this.setupWebSockets();
  }

  setupRoutes() {
    this.app.get('/api/features', async (req, res) => {
      const specsDir = path.join(this.projectDir, 'aizen-gate', 'specs');
      if (!fs.existsSync(specsDir)) return res.json([]);
      const dirs = await fs.readdir(specsDir);
      const validFeatures = [];
      for (const dir of dirs) {
        if ((await fs.stat(path.join(specsDir, dir))).isDirectory()) {
          validFeatures.push(dir);
        }
      }
      res.json(validFeatures);
    });

    this.app.get('/api/wps/:featureId', async (req, res) => {
      const featureDir = path.join(this.projectDir, 'aizen-gate', 'specs', req.params.featureId);
      try {
        const wps = await WorkPackage.loadAllWPs(featureDir);
        res.json(wps);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    this.app.post('/api/wps/:featureId/:wpId/move', async (req, res) => {
      const { lane } = req.body;
      const wpPath = path.join(this.projectDir, 'aizen-gate', 'specs', req.params.featureId, 'tasks', `${req.params.wpId}.md`);
      try {
        const wp = await WorkPackage.loadFromFile(wpPath);
        const oldLane = wp.lane;
        await wp.setLane(lane);
        res.json({ success: true, wp });
        this.broadcastUpdate(req.params.featureId, `${wp.id} moved from ${oldLane} to ${lane}`);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  }

  setupWebSockets() {
    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'subscribe') {
            ws.featureId = data.featureId;
            this.watchFeature(data.featureId);
            this.broadcastUpdate(data.featureId, `New client connected to ${data.featureId}`);
          }
        } catch(e) {
          console.error('[Dashboard] Error processing WS message:', e);
        }
      });
    });
  }

  watchFeature(featureId) {
    if (this.watchers[featureId]) return;

    const tasksDir = path.join(this.projectDir, 'aizen-gate', 'specs', featureId, 'tasks');
    if (!fs.existsSync(tasksDir)) return;

    let timeout = null;
    this.watchers[featureId] = fs.watch(tasksDir, (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.broadcastUpdate(featureId, `File change detected: ${filename}`);
        }, 100);
      }
    });
  }

  async broadcastUpdate(featureId, eventMessage = null) {
    const featureDir = path.join(this.projectDir, 'aizen-gate', 'specs', featureId);
    let payload = { type: 'update', data: [], event: eventMessage };
    if (fs.existsSync(featureDir)) {
      try {
        const wps = await WorkPackage.loadAllWPs(featureDir);
        payload.data = wps;
      } catch(e) {
        console.error('[Dashboard] Failed to read WPs:', e.message);
      }
    }
    
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.featureId === featureId) {
        client.send(JSON.stringify(payload));
      }
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`\n[SA] 🚀 Dashboard Server running at http://localhost:${this.port}`);
    });
  }
}

module.exports = { DashboardServer };
