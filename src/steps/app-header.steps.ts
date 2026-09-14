import { createBdd } from 'playwright-bdd';
import { AppHeader } from '../objects/app-header';

const { Given, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
  await page.goto('/');
  await new AppHeader(page).goToSignIn();
});

Then('I should be redirected to my account page', async ({ page }) => {
  await page.waitForURL(/\/account$/, { timeout: 15_000 });
});

Then('I should see the account menu for the logged-in user', async ({ page }) => {
  await new AppHeader(page).expectUserMenuVisible();
});
