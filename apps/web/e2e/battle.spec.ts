import { test, expect } from '@playwright/test';

test.describe('Battle Module Flow', () => {
  test.beforeEach(async ({ page }) => {
    const username = `u_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register and login for each test to ensure fresh state
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

  test('should load the arena/battle page without crashing', async ({ page }) => {
    // Navigate to a game route that is prone to errors, such as /arena
    await page.goto('/arena');

    // Verify ErrorBoundary did not trigger
    await expect(page.locator('text=Module Crashed')).not.toBeVisible();
    
    // Check if the page title or basic element is there
    await expect(page.locator('button:has-text("f")')).toBeVisible();
  });
});
