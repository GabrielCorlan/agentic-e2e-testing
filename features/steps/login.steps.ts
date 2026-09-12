import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
  await page.goto('/auth/login');
});

When('I log in with valid credentials', async ({ page }) => {
  await page.locator('[data-test="email"]').fill(process.env.TEST_USER!);
  await page.locator('[data-test="password"]').fill(process.env.TEST_PASS!);
  await page.locator('[data-test="login-submit"]').click();
});

Then('I should be redirected to my account page', async ({ page }) => {
  await page.waitForURL(/\/account$/, { timeout: 15_000 });
});

Then('I should see the account menu for the logged-in user', async ({ page }) => {
  await expect(page.locator('[data-test="nav-menu"]')).toBeVisible();
});
