import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  async getHeroHeading(): Promise<string> { return this.getH1(); }

  async getGallerySection(): Promise<WebdriverIO.Element> {
    const el = (await $("//h3[contains(.,'Gallery')]")) as unknown as WebdriverIO.Element;
    await el.waitForExist({ timeout: 10000 });
    await this.scrollTo("//h3[contains(.,'Gallery')]");
    await el.waitForDisplayed({ timeout: 5000 });
    return el;
  }
}
