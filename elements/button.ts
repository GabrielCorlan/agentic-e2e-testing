import { Locator } from '@playwright/test';

/** Wraps actions available on a `<button>` (or button-like `<input type="submit">`) element. */
export class Button {
  constructor(private readonly locator: Locator) {}

  async click(): Promise<void> {
    await this.locator.click();
  }
}
