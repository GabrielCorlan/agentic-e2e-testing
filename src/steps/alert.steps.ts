import { createBdd } from 'playwright-bdd';
import { Alert } from '../objects/alert';

const { Then } = createBdd();

Then('I should see the {string} alert with message {string}', async ({ page }, dataTestId: string, message: string) => {
  await new Alert(page.locator(`[data-test="${dataTestId}"]`)).expectVisibleWithText(message);
});
