import { BasePage } from './BasePage';

export const EXPECTED_SERVICES_IOS = [
  'Autonomous AI Agents',
  'Chatbots with RAG',
  'Computer Vision',
  'Process Automation',
  'Generative AI',
  'Document Processing',
  'Recommendation Systems',
  'NLP & Sentiment Analysis',
] as const;

export const EXPECTED_SERVICES_ANDROID = [
  'Chatbots with RAG',
  'Autonomous AI Agents',
  'Computer Vision',
  'Process Automation',
  'Generative AI',
  'NLP & Sentiment Analysis',
  'Recommendation Systems',
  'Document Processing',
] as const;

export class ServicesPage extends BasePage {
  async getHeroHeading(): Promise<string> { return this.getH1(); }

  private async collectAllHeadingsAndLinks(): Promise<{
    headings: Set<string>;
    links: WebdriverIO.Element[];
  }> {
    const headings = new Set<string>();
    const links: WebdriverIO.Element[] = [];
    const seenLinkKeys = new Set<string>();

    let totalHeight = (await browser.execute(
      () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    )) as number;
    const step = 400;
    let pos = 0;
    let noNewCount = 0;
    let prevHeadingCount = 0;

    while (pos <= totalHeight + 2 * step) {
      await browser.execute((y: number) => window.scrollTo(0, y), pos);
      await browser.pause(300);

      const h3s = (await $$('h3')) as unknown as WebdriverIO.Element[];
      for (const el of h3s) {
        const txt = (await el.getText()).trim();
        if (txt) headings.add(txt);
      }

      const applyLinks = (await $$("a[href='/contacto']")) as unknown as WebdriverIO.Element[];
      for (const el of applyLinks) {
        const text = await el.getText();
        if (text.includes('Apply now')) {
          const key = (await browser.execute((e: unknown) => {
            let p = (e as HTMLElement).parentElement;
            while (p) {
              const h3 = p.querySelector('h3');
              if (h3) return h3.textContent?.trim() ?? null;
              p = p.parentElement;
            }
            return null;
          }, el)) as string | null;
          if (key && !seenLinkKeys.has(key)) {
            seenLinkKeys.add(key);
            links.push(el);
          }
        }
      }

      if (headings.size === prevHeadingCount) {
        noNewCount++;
        if (noNewCount >= 3) break;
      } else {
        noNewCount = 0;
      }
      prevHeadingCount = headings.size;
      pos += step;
      totalHeight = (await browser.execute(
        () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      )) as number;
    }

    return { headings, links };
  }

  async getServiceHeadings(): Promise<string[]> {
    const { headings } = await this.collectAllHeadingsAndLinks();
    return Array.from(headings);
  }

  async getApplyNowLinks(): Promise<WebdriverIO.Element[]> {
    const { links } = await this.collectAllHeadingsAndLinks();
    return links;
  }

  async clickApplyNow(index = 0): Promise<void> {
    let totalHeight = (await browser.execute(
      () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    )) as number;
    const step = 400;
    let pos = 0;
    let count = 0;

    while (pos <= totalHeight + 2 * step) {
      await browser.execute((y: number) => window.scrollTo(0, y), pos);
      await browser.pause(300);

      const applyLinks = (await $$("a[href='/contacto']")) as unknown as WebdriverIO.Element[];
      for (const el of applyLinks) {
        const text = await el.getText();
        if (text.includes('Apply now')) {
          if (count === index) {
            await browser.execute((e: unknown) => (e as HTMLElement).click(), el);
            return;
          }
          count++;
        }
      }

      pos += step;
      totalHeight = (await browser.execute(
        () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      )) as number;
    }

    throw new Error(`Apply now link at index ${index} not found`);
  }
}
