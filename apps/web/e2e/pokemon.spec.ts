import { test, expect } from '@playwright/test';

test.describe('Pokemon Management Flow', () => {
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
    
    // 4. Select a starter
    // Wait for the starters to load (cards should be visible)
    await page.waitForSelector('text=Bulbasaur');
    
    // Click the first starter available
    await page.locator('text=Bulbasaur').first().click();
    
    // Confirm the selection if there is a dialog
    const confirmBtn = await page.$('button:has-text("Confirm")');
    if (confirmBtn) {
      await confirmBtn.click();
    }
    
    // 5. Verify redirection to home/dashboard
    await expect(page.locator('text="ACTIVE SQUAD"')).toBeVisible();
    
    // Ensure starter selection page is no longer visible and navigation is present
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('should load the PC / Party page and display party pokemon', async ({ page }) => {
    await page.goto('/pokemon');

    // Check if the page title or basic element is there
    await expect(page.locator('h1:has-text("My Pok")')).toBeVisible();

    // The starter pokemon should be in the party
    // Assuming we have a card or list item for the pokemon
    await expect(page.locator('div:has-text("Lv.")').first()).toBeVisible();
  });
});
