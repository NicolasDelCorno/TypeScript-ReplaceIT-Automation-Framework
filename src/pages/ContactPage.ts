import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  static readonly SUCCESS_BANNER_TEXT = 'Thank you! Your details have been sent successfully';

  constructor(page: Page) { super(page); }

  async getHeroHeading(): Promise<string> {
    return (await this.page.locator('h1').first().innerText()).trim();
  }

  getNameField(): Locator {
    return this.page.locator("input[name='nombreyapellido']");
  }

  getEmailField(): Locator {
    return this.page.locator("input[name='email']");
  }

  getReasonField(): Locator {
    return this.page.locator("input[name='motivo']");
  }

  getSendButton(): Locator {
    return this.page.locator('button', { hasText: 'Send' });
  }

  getContactEmailLink(): Locator {
    return this.page.locator("a[href='mailto:hello@replace.com.ar']");
  }

  getPhoneLink(): Locator {
    return this.page.locator("a[href='tel:+542235064735']");
  }

  async fillForm(opts: { name?: string; email?: string; reason?: string }): Promise<void> {
    if (opts.name)   await this.getNameField().fill(opts.name);
    if (opts.email)  await this.getEmailField().fill(opts.email);
    if (opts.reason) await this.getReasonField().fill(opts.reason);
  }

  async submitForm(): Promise<void> {
    await this.getSendButton().click();
  }

  getSuccessBanner(): Locator {
    return this.page.getByText(ContactPage.SUCCESS_BANNER_TEXT, { exact: false }).first();
  }

  async waitForSuccessBanner(timeoutMs = 15000): Promise<void> {
    await this.getSuccessBanner().waitFor({ state: 'visible', timeout: timeoutMs });
  }
}
