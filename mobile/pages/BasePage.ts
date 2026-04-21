export class BasePage {
  static readonly SOCIAL_LINKS: Record<string, string> = {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    linkedin: 'https://www.linkedin.com/company/replaceit/',
  };

  async waitForUrl(url: string, timeout = 10000): Promise<void> {
    await browser.waitUntil(
      async () => (await browser.getUrl()) === url,
      { timeout, timeoutMsg: `URL never became ${url}` }
    );
  }

  currentUrl(): Promise<string> {
    return browser.getUrl();
  }

  async getH1(): Promise<string> {
    const el = (await $('h1')) as unknown as WebdriverIO.Element;
    await el.waitForDisplayed({ timeout: 10000 });
    const text = await el.getText();
    if (!text) {
      const inner = await browser.execute((e: unknown) => (e as HTMLElement).innerText ?? '', el);
      return (inner as string) ?? '';
    }
    return text.trim();
  }

  async scrollTo(selector: string): Promise<void> {
    const el = (await $(selector)) as unknown as WebdriverIO.Element;
    await browser.execute((e: unknown) => {
      (e as HTMLElement).scrollIntoView({ block: 'center', behavior: 'instant' });
    }, el);
    await browser.waitUntil(
      async () => browser.execute((e: unknown) => {
        const r = (e as HTMLElement).getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      }, el) as Promise<boolean>,
      { timeout: 5000 }
    );
  }

  async jsClick(selector: string): Promise<void> {
    const el = (await $(selector)) as unknown as WebdriverIO.Element;
    await browser.execute((e: unknown) => (e as HTMLElement).click(), el);
  }

  async scrollToBottom(): Promise<void> {
    let totalHeight = (await browser.execute(() => document.body.scrollHeight)) as number;
    const step = 400;
    let pos = 0;
    while (pos < totalHeight) {
      pos += step;
      await browser.execute((y: number) => window.scrollTo(0, y), pos);
      await browser.pause(300);
      totalHeight = (await browser.execute(() => document.body.scrollHeight)) as number;
    }
  }

  async getFooterLink(href: string): Promise<WebdriverIO.Element> {
    await this.scrollToBottom();
    return (await $(`footer a[href='${href}']`)) as unknown as WebdriverIO.Element;
  }

  async clickPrivacyPolicy(): Promise<void> {
    await this.scrollToBottom();
    await this.jsClick("a[href='#priv']");
  }

  async clickCookiePolicy(): Promise<void> {
    await this.scrollToBottom();
    await this.jsClick("a[href='#cookies']");
  }

  async clickTermsAndConditions(): Promise<void> {
    await this.scrollToBottom();
    await this.jsClick("a[href='#term']");
  }

  private async openNavMenu(): Promise<void> {
    const selectors = [
      "button[aria-label='Open menu']",
      "button[aria-label='Toggle menu']",
      "button[aria-label='menu']",
      "button[aria-label='Menu']",
      'button.hamburger',
      '.menu-toggle',
      '[class*="hamburger"]',
      '[class*="burger"]',
      'header button',
    ];
    for (const sel of selectors) {
      try {
        const els = (await $$(sel)) as unknown as WebdriverIO.Element[];
        for (const btn of els) {
          if (await btn.isDisplayed()) {
            await browser.execute((e: unknown) => (e as HTMLElement).click(), btn);
            await browser.pause(500);
            return;
          }
        }
      } catch { /* try next selector */ }
    }
  }

  private async clickNavLink(href: string): Promise<void> {
    await this.openNavMenu();
    const link = (await $(`header a[href='${href}']`)) as unknown as WebdriverIO.Element;
    await link.waitForExist({ timeout: 10000 });
    await browser.execute((e: unknown) => (e as HTMLElement).click(), link);
  }

  async clickNavHome():     Promise<void> { await this.clickNavLink('/'); }
  async clickNavServices(): Promise<void> { await this.clickNavLink('/servicios'); }
  async clickNavAbout():    Promise<void> { await this.clickNavLink('/quienes-somos'); }
  async clickNavContact():  Promise<void> { await this.clickNavLink('/contacto'); }

  async clickLogo(): Promise<void> {
    const link = (await $("header a[href='/']")) as unknown as WebdriverIO.Element;
    await link.waitForExist({ timeout: 10000 });
    await browser.execute((e: unknown) => (e as HTMLElement).click(), link);
  }
}
