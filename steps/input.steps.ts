import { createBdd } from 'playwright-bdd';
import { Input } from '../elements/input';

const { When } = createBdd();

When('I fill in the email field', async ({ page }) => {
  await new Input(page.locator('[data-test="email"]')).fill(process.env.TEST_USER!);
});

When('I fill in the password field', async ({ page }) => {
  await new Input(page.locator('[data-test="password"]')).fill(process.env.TEST_PASS!);
});
