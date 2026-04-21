import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  static readonly SUCCESS_BANNER_KEYWORD = 'Thank you';

  async getHeroHeading(): Promise<string> { return this.getH1(); }

  private async scrollAndConfirm(selector: string): Promise<WebdriverIO.Element> {
    const el = (await $(selector)) as unknown as WebdriverIO.Element;
    await el.waitForExist({ timeout: 10000 });
    await this.scrollTo(selector);
    await el.waitForDisplayed({ timeout: 5000 });
    return el;
  }

  async getNameField():        Promise<WebdriverIO.Element> { return this.scrollAndConfirm("input[name='nombreyapellido']"); }
  async getEmailField():       Promise<WebdriverIO.Element> { return this.scrollAndConfirm("input[name='email']"); }
  async getReasonField():      Promise<WebdriverIO.Element> { return this.scrollAndConfirm("input[name='motivo']"); }
  async getSendButton():       Promise<WebdriverIO.Element> { return this.scrollAndConfirm("//button[contains(.,'Send')]"); }
  async getContactEmailLink(): Promise<WebdriverIO.Element> { return this.scrollAndConfirm("a[href='mailto:hello@replace.com.ar']"); }
  async getPhoneLink():        Promise<WebdriverIO.Element> { return this.scrollAndConfirm("a[href='tel:+542235064735']"); }

  async fillForm(opts: { name?: string; email?: string; reason?: string }): Promise<void> {
    if (opts.name) {
      const f = await this.getNameField();
      await f.clearValue();
      await f.setValue(opts.name);
    }
    if (opts.email) {
      const f = await this.getEmailField();
      await f.clearValue();
      await f.setValue(opts.email);
    }
    if (opts.reason) {
      const f = await this.getReasonField();
      await f.clearValue();
      await f.setValue(opts.reason);
    }
  }

  async submitForm(): Promise<void> {
    const btn = await this.getSendButton();
    await browser.execute((e: unknown) => (e as HTMLElement).click(), btn);
  }

  async getSuccessBanner(): Promise<WebdriverIO.Element> {
    const selector = `//*[contains(normalize-space(),'${ContactPage.SUCCESS_BANNER_KEYWORD}')]`;
    await browser.waitUntil(
      async () => (await $$(selector)).length > 0,
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: `Success banner not found: ${selector}`,
      }
    );
    const el = (await $(selector)) as unknown as WebdriverIO.Element;
    await this.scrollTo(selector);
    await el.waitForDisplayed({ timeout: 20000 });
    return el;
  }

  async elementCheckValidity(el: WebdriverIO.Element): Promise<boolean> {
    return (await browser.execute((e: unknown) => (e as HTMLInputElement).checkValidity(), el)) as boolean;
  }
}
