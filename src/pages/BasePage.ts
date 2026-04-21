import type { Page, Locator } from '@playwright/test';

export class BasePage {
  static readonly NAV_LINKS: Record<string, string> = {
    home: '/',
    services: '/servicios',
    about: '/quienes-somos',
    contact: '/contacto',
  };

  static readonly SOCIAL_LINKS: Record<string, string> = {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    linkedin: 'https://www.linkedin.com/company/replaceit/',
  };

  constructor(protected readonly page: Page) {}

  async clickNavHome(): Promise<void> {
    await this.page.locator("nav a[href='/']").first().click();
  }

  async clickNavServices(): Promise<void> {
    await this.page.getByRole('banner').getByRole('link', { name: 'Services' }).click();
  }

  async clickNavAbout(): Promise<void> {
    await this.page.getByRole('banner').getByRole('link', { name: 'About Us' }).click();
  }

  async clickNavContact(): Promise<void> {
    await this.page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true }).click();
  }

  async clickLogo(): Promise<void> {
    await this.page.locator("header a[href='/']").first().click();
  }

  getFooterLink(href: string): Locator {
    return this.page.locator(`footer a[href='${href}']`);
  }

  async clickPrivacyPolicy(): Promise<void> {
    const link = this.page.locator("footer a[href='#priv']").first();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await link.scrollIntoViewIfNeeded();
    await link.click({ force: true });
  }

  async clickCookiePolicy(): Promise<void> {
    const link = this.page.locator("footer a[href='#cookies']").first();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await link.scrollIntoViewIfNeeded();
    await link.click({ force: true });
  }

  async clickTermsAndConditions(): Promise<void> {
    const link = this.page.locator("footer a[href='#term']").first();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await link.scrollIntoViewIfNeeded();
    await link.click({ force: true });
  }

  currentUrl(): string {
    return this.page.url();
  }

  async getH1(): Promise<string> {
    return (await this.page.locator('h1').first().innerText()).trim();
  }
}
