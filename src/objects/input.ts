import { Locator } from '@playwright/test';

/** Wraps actions available on an `<input>` element. */
export class Input {
  constructor(private readonly locator: Locator) {}

  async fill(value: string): Promise<void> {
    await this.locator.fill(value);
  }

  async getValue(): Promise<string> {
    return this.locator.inputValue();
  }
}
