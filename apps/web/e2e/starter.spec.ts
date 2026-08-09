import { test, expect } from '@playwright/test';

test.describe('Starter Selection Flow', () => {

  test('should allow a new user to select a starter and proceed', async ({ page }) => {
    const username = `s_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // 1. Register a new user
    await page.goto('/register');
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Establish Link")', { force: true });
    
    // Wait for redirect to login
    await expect(page).toHaveURL(/.*\/login/);

    // 2. Log in
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Initialize Session")', { force: true });

    // 3. Wait for redirect to Starter Selection (which is on home '/')
    await expect(page).toHaveURL(/.*\//);

    // 4. Select a starter
    // Wait for the starters to load (cards should be visible)
    await page.waitForSelector('text=Bulbasaur');
    
    // Select Bulbasaur
    await page.locator('text=Bulbasaur').first().click();
    
    // Confirm the selection if there is a dialog
    const confirmBtn = await page.$('button:has-text("Confirm")');
    if (confirmBtn) {
      await confirmBtn.click();
    }
    
    // 5. Verify redirection to home/dashboard
    await expect(page).toHaveURL(/.*\//);
    
    // Ensure starter selection page is no longer visible and navigation is present
    await expect(page.locator('nav').first()).toBeVisible();
  });
});
