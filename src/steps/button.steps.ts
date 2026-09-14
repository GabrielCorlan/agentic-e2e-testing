import { createBdd } from 'playwright-bdd';
import { Button } from '../objects/button';

const { When } = createBdd();

When('I click the {string} button', async ({ page }, dataTestId: string) => {
  await new Button(page.locator(`[data-test="${dataTestId}"]`)).click();
});
