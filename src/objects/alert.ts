import { Locator, expect } from '@playwright/test';

/** Wraps assertions available on an alert/message `<div>` element. */
export class Alert {
  constructor(private readonly locator: Locator) {}

  async expectVisibleWithText(text: string): Promise<void> {
    await expect(this.locator).toBeVisible({ timeout: 15_000 });
    await expect(this.locator).toContainText(text);
  }
}
