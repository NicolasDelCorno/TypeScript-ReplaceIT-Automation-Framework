import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) { super(page); }

  async getHeroHeading(): Promise<string> {
    return (await this.page.locator('h1').first().innerText()).trim();
  }

  getResultsSection(): Locator {
    return this.page.locator('h2', { hasText: 'Our Results' });
  }

  getEngagementSection(): Locator {
    return this.page.locator('h2', { hasText: 'Engagement Models' });
  }

  getClientsSection(): Locator {
    return this.page.locator('h3', { hasText: 'Clients' });
  }

  async clickViewServices(): Promise<void> {
    await this.page.locator("a[href='/servicios']", { hasText: 'View services' }).click();
  }
}
