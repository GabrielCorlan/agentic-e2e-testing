import { Locator, Page, expect } from '@playwright/test';
import { Link } from './link';

/** Wraps actions available on the `<app-header>` component. */
export class AppHeader {
  constructor(private readonly page: Page) {}

  private get signInLink(): Link {
    return new Link(this.page.locator('[data-test="nav-sign-in"]'));
  }

  private get userMenu(): Locator {
    return this.page.locator('[data-test="nav-menu"]');
  }

  async goToSignIn(): Promise<void> {
    await this.signInLink.click();
  }

  async expectUserMenuVisible(): Promise<void> {
    await expect(this.userMenu).toBeVisible({ timeout: 15_000 });
  }
}
