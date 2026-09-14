import { Locator } from '@playwright/test';

/** Wraps actions available on an `<a>` element. */
export class Link {
  constructor(private readonly locator: Locator) {}

  async click(): Promise<void> {
    await this.locator.click();
  }

  async getHref(): Promise<string | null> {
    return this.locator.getAttribute('href');
  }
}
