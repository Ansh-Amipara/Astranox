import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const password = 'Password123!';

  test('should register a new user', async ({ page }) => {
    const username = `u_${Date.now().toString().slice(-6)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    await page.goto('/register');
    
    await expect(page.locator('text="Register new coordinates"').first()).toBeVisible();

    await page.fill('input[type="text"]', username);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    await page.click('button:has-text("Establish Link")', { force: true });

    // Should redirect to login and show success message
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should log in an existing user', async ({ page }) => {
    // Note: since tests might run independently in parallel, we either need a seeded user
    // or we register one first. Given standard config, we'll register inline if needed,
    // but fullyParallel runs them separately. Let's just create one here.
    const uniqueUser = `lu_${Date.now().toString().slice(-6)}`;
    const password = 'Password123!';
    await page.goto('/register');
    await page.fill('input[type="text"]', uniqueUser);
    await page.fill('input[type="email"]', `${uniqueUser}@example.com`);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Establish Link")', { force: true });
    await expect(page).toHaveURL(/.*\/login/);

    // Now log in
    await page.fill('input[type="text"]', uniqueUser);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Initialize Session")', { force: true });

    // Should redirect to starter selection or home depending on state
    // Let's just wait for navbar to appear indicating logged in state
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page).not.toHaveURL(/.*\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="text"]', 'nonexistent_user_9999');
    await page.fill('input[type="password"]', 'WrongPassword!');
    await page.click('button:has-text("Initialize Session")', { force: true });

    // Should show error notification/toast or inline error
    await expect(page.locator('text=Invalid credentials').first()).toBeVisible();
  });
});
