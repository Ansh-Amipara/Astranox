import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5174/');
  await expect(page).toHaveTitle(/Astranox/i);
});

test('login page', async ({ page }) => {
  await page.goto('http://localhost:5174/login');
  await expect(page.locator('h2')).toContainText('Sign in to Astranox');
});
