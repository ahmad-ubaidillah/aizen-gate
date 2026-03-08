/**
 * CLI E2E Tests
 */
const { test, expect } = require('@playwright/test');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

test.describe('CLI Commands', () => {
  test('should run status command', async () => {
    const { stdout, stderr } = await execAsync('node ./bin/cli.js status', {
      cwd: process.cwd(),
    });
    
    expect(stdout).toBeTruthy();
  });

  test('should show help', async () => {
    const { stdout, stderr } = await execAsync('node ./bin/cli.js --help', {
      cwd: process.cwd(),
    });
    
    expect(stdout).toContain('Usage');
  });

  test('should list available commands', async () => {
    const { stdout, stderr } = await execAsync('node ./bin/cli.js help', {
      cwd: process.cwd(),
    });
    
    expect(stdout).toContain('Commands');
  });
});
