import { createBdd } from 'playwright-bdd';
import { Input } from '../elements/input';

const { When } = createBdd();

When('I fill in the {string} field with my email', async ({ page }, dataTestId: string) => {
  await new Input(page.locator(`[data-test="${dataTestId}"]`)).fill(process.env.TEST_USER!);
});

When('I fill in the {string} field with my password', async ({ page }, dataTestId: string) => {
  await new Input(page.locator(`[data-test="${dataTestId}"]`)).fill(process.env.TEST_PASS!);
});
