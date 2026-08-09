import { test, expect } from '@playwright/test';

test.describe('Infinity Tower Flow', () => {
  test.beforeEach(async ({ page }) => {
    const username = `u_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register and login
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
    await page.waitForSelector('text=Bulbasaur');
    await page.locator('text=Bulbasaur').first().click();
    
    // Confirm the selection if there is a dialog
    const confirmBtn = await page.$('button:has-text("Confirm")');
    if (confirmBtn) {
      await confirmBtn.click();
    }
    
    // Wait for redirect to home
    await expect(page.locator('text="ACTIVE SQUAD"')).toBeVisible();
  });

  test('should load the Infinity Tower gateway', async ({ page }) => {
    await page.goto('/tower');

    // Check if the page title or basic element is there
    await expect(page.locator('h1:has-text("Infinity Tower")')).toBeVisible();
    
    // Check for start or enter button (might be disabled if no pokemon)
    await expect(page.locator('h2:has-text("Floor")')).toBeVisible();
  });
});
