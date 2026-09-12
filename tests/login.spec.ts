import { test, expect } from '@playwright/test';

test('customer can log in with valid credentials', async ({ page }) => {
  await page.goto('/auth/login');

  await page.locator('[data-test="email"]').fill(process.env.TEST_USER!);
  await page.locator('[data-test="password"]').fill(process.env.TEST_PASS!);
  await page.locator('[data-test="login-submit"]').click();

  await page.waitForURL(/\/account$/, { timeout: 15_000 });
  await expect(page.locator('[data-test="nav-menu"]')).toBeVisible();
});
