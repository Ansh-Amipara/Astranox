import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test.beforeEach(async ({ page }) => {
    const username = `u_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register and login for each test
    await page.goto('/register');
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Establish Link")', { force: true });
    await expect(page).toHaveURL(/.*\/login/);

    await page.fill('input[type="text"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Initialize Session")', { force: true });
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Select a starter
    await page.waitForSelector('text=Dratini');
    await page.locator('text=Dratini').first().click();
    
    // Confirm the selection if there is a dialog
    const confirmBtn = await page.$('button:has-text("Confirm")');
    if (confirmBtn) {
      await confirmBtn.click();
    }
    
    // Wait for redirect to home
    await expect(page.locator('text="ACTIVE SQUAD"')).toBeVisible();
  });

  test('should load the marketplace and allow viewing listings', async ({ page }) => {
    await page.goto('/marketplace');

    // Wait for the GTS header or Tabs
    await expect(page.locator('h1:has-text("Trade Exchange")')).toBeVisible();

    // Check if tabs are present
    await expect(page.locator('text="browse"')).toBeVisible();
    await expect(page.locator('text="my listings"')).toBeVisible();

    // The 'Create Listing' button should be visible
    await expect(page.locator('button:has-text("Create Listing")')).toBeVisible();
  });

  test('should open the create listing modal', async ({ page }) => {
    await page.goto('/marketplace');

    // Click Create Listing
    await page.click('text="Create Listing"');

    // The modal should appear (requires a pokemon to be selected)
    // Wait for the dialog to appear
    await expect(page.locator('h1:has-text("Create Trade Listing")')).toBeVisible();
    await expect(page.locator('h2:has-text("1. Select")')).toBeVisible();
  });
});
