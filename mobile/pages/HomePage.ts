import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async getHeroHeading(): Promise<string> { return this.getH1(); }

  async getClientsSection(): Promise<WebdriverIO.Element> {
    const el = (await $("//h3[contains(.,'Clients')]")) as unknown as WebdriverIO.Element;
    await el.waitForExist({ timeout: 10000 });
    await this.scrollTo("//h3[contains(.,'Clients')]");
    await el.waitForDisplayed({ timeout: 5000 });
    return el;
  }

  async getResultsSection(): Promise<WebdriverIO.Element> {
    const el = (await $("//h2[contains(.,'Our Results')]")) as unknown as WebdriverIO.Element;
    await el.waitForExist({ timeout: 10000 });
    await this.scrollTo("//h2[contains(.,'Our Results')]");
    await el.waitForDisplayed({ timeout: 5000 });
    return el;
  }

  async getEngagementSection(): Promise<WebdriverIO.Element> {
    const el = (await $("//h2[contains(.,'Engagement Models')]")) as unknown as WebdriverIO.Element;
    await el.waitForExist({ timeout: 10000 });
    await this.scrollTo("//h2[contains(.,'Engagement Models')]");
    await el.waitForDisplayed({ timeout: 5000 });
    return el;
  }

  async clickViewServices(): Promise<void> {
    const selector = "//a[@href='/servicios' and contains(.,'View services')]";
    await this.scrollTo(selector);
    const el = (await $(selector)) as unknown as WebdriverIO.Element;
    await browser.execute((e: unknown) => (e as HTMLElement).click(), el);
  }
}
