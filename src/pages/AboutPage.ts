import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  constructor(page: Page) { super(page); }

  async getHeroHeading(): Promise<string> {
    return (await this.page.locator('h1').first().innerText()).trim();
  }

  getGallerySection(): Locator {
    return this.page.locator('h3', { hasText: 'Gallery' });
  }
}
