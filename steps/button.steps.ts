import { createBdd } from 'playwright-bdd';
import { Button } from '../elements/button';

const { When } = createBdd();

When('I click the login button', async ({ page }) => {
  await new Button(page.locator('[data-test="login-submit"]')).click();
});
