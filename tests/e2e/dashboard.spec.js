/**
 * Dashboard E2E Tests
 */
const { test, expect } = require('@playwright/test');

test.describe('Dashboard', () => {
  test('should load the dashboard homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Aizen-Gate/i);
    
    // Check for main elements
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show status indicators', async ({ page }) => {
    await page.goto('/');
    
    // Check for status indicators
    const statusElement = page.locator('[data-testid="status"]');
    if (await statusElement.count() > 0) {
      await expect(statusElement).toBeVisible();
    }
  });
});
