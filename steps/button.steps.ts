import { createBdd } from 'playwright-bdd';
import { Button } from '../elements/button';

const { When } = createBdd();

When('I click the {string} button', async ({ page }, dataTestId: string) => {
  await new Button(page.locator(`[data-test="${dataTestId}"]`)).click();
});
