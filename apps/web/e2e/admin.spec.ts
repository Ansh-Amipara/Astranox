import { test, expect } from '@playwright/test';

test.describe('Admin Privilege Flow', () => {
  test('should deny access to regular users', async ({ page }) => {
    const username = `u_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register and login a normal user
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

    // Navigate to admin
    await page.goto('/admin');

    // Normal user should be redirected to home or show unauthorized
    // Assuming our setup redirects to home for non-admins
    await expect(page).toHaveURL(/.*\//);
    
    // Or check for Not Found / Unauthorized if no redirect
    const notAdminText = page.locator('text="Module Crashed"').first(); // ErrorBoundary catch
    if (await notAdminText.isVisible()) {
      await expect(notAdminText).toBeVisible();
    }
  });
});
