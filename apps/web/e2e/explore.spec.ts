import { test, expect } from '@playwright/test';

test.describe('Overworld 2D Exploration Flow', () => {
  test.beforeEach(async ({ page }) => {
    const username = `u_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register and login for fresh session
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

    // Select starter if prompted
    const starterSelector = page.locator('text=Bulbasaur');
    if (await starterSelector.isVisible({ timeout: 4000 }).catch(() => false)) {
      await starterSelector.first().click();
      const confirmBtn = await page.$('button:has-text("Confirm")');
      if (confirmBtn) {
        await confirmBtn.click();
      }
    }

    await expect(page.locator('text="ACTIVE SQUAD"')).toBeVisible();
  });

  test('should render 2D exploration canvas and interactive D-pad controls', async ({ page }) => {
    await page.goto('/explore');

    // Verify ErrorBoundary did not trigger
    await expect(page.locator('text=Module Crashed')).not.toBeVisible();

    // Verify exploration canvas is visible
    const canvas = page.locator('[data-testid="explore-canvas"]');
    await expect(canvas).toBeVisible();

    // Verify D-pad directional controls are visible
    await expect(page.locator('[data-testid="dpad-up"]')).toBeVisible();
    await expect(page.locator('[data-testid="dpad-down"]')).toBeVisible();
    await expect(page.locator('[data-testid="dpad-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="dpad-right"]')).toBeVisible();

    // Interact with D-pad controls
    await page.locator('[data-testid="dpad-down"]').click();

    // Confirm view did not crash after movement intent
    await expect(page.locator('text=Module Crashed')).not.toBeVisible();
  });
});
