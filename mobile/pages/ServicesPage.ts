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

    const viewportHeight = (await browser.execute(() => window.innerHeight)) as number;
    const waitForScrollSettle = async (targetY: number): Promise<void> => {
      // iOS Safari doesn't always land on the exact scrollY requested (rubber banding,
      // dynamic toolbars). Consider the scroll "settled" if we're close enough or if
      // the scroll position stabilizes.
      let lastY: number | null = null;
      let stableTicks = 0;
      await browser.waitUntil(
        async () => {
          const y = (await browser.execute(() => window.scrollY)) as number;
          if (lastY !== null && Math.abs(y - lastY) < 2) stableTicks++;
          else stableTicks = 0;
          lastY = y;
          return Math.abs(y - targetY) < 32 || stableTicks >= 3;
        },
        { timeout: 8000, interval: 120 }
      );
    };

    const scrollToY = async (y: number): Promise<void> => {
      await browser.execute((yy: number) => window.scrollTo(0, yy), y);
      await waitForScrollSettle(y);
      await browser.pause(150);
    };

    const getTotalHeight = async (): Promise<number> =>
      (await browser.execute(
        () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      )) as number;

    let totalHeight = (await browser.execute(
      () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    )) as number;
    // Use large steps initially, then smaller steps near bottom to ensure the
    // last card becomes fully visible (important for iOS lazy-render triggers).
    const coarseStep = Math.max(320, Math.floor(viewportHeight * 0.75));
    const fineStep = 120;
    let pos = 0;
    let noNewCount = 0;
    let prevHeadingCount = 0;

    // Scroll until we've likely reached the bottom; avoid early breaks as
    // service cards can lazy-render after a few scrolls.
    while (pos <= totalHeight + 2 * coarseStep) {
      await scrollToY(pos);

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

      if (headings.size === prevHeadingCount) noNewCount++;
      else noNewCount = 0;
      prevHeadingCount = headings.size;
      const nearBottomNow = pos >= Math.max(0, totalHeight - 2 * viewportHeight);
      pos += nearBottomNow ? fineStep : coarseStep;
      totalHeight = await getTotalHeight();

      const nearBottom = pos >= Math.max(0, totalHeight - viewportHeight);
      if (nearBottom) {
        // Nudge a few times around the bottom to trigger lazy-render / IO callbacks.
        // This is intentionally small to avoid iOS "rubber band" overscroll.
        await scrollToY(Math.max(0, totalHeight - viewportHeight));
        await browser.execute((dy: number) => window.scrollBy(0, dy), fineStep);
        await browser.pause(150);
        await browser.execute((dy: number) => window.scrollBy(0, dy), -fineStep);
        await browser.pause(150);
        totalHeight = await getTotalHeight();
      }

      if (nearBottom && noNewCount >= 6) break;
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
    const viewportHeight = (await browser.execute(() => window.innerHeight)) as number;
    const waitForScrollSettle = async (targetY: number): Promise<void> => {
      let lastY: number | null = null;
      let stableTicks = 0;
      await browser.waitUntil(
        async () => {
          const y = (await browser.execute(() => window.scrollY)) as number;
          if (lastY !== null && Math.abs(y - lastY) < 2) stableTicks++;
          else stableTicks = 0;
          lastY = y;
          return Math.abs(y - targetY) < 32 || stableTicks >= 3;
        },
        { timeout: 8000, interval: 120 }
      );
    };

    const scrollToY = async (y: number): Promise<void> => {
      await browser.execute((yy: number) => window.scrollTo(0, yy), y);
      await waitForScrollSettle(y);
      await browser.pause(150);
    };

    const getTotalHeight = async (): Promise<number> =>
      (await browser.execute(
        () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      )) as number;

    let totalHeight = await getTotalHeight();
    const coarseStep = Math.max(320, Math.floor(viewportHeight * 0.75));
    const fineStep = 120;
    let pos = 0;
    let count = 0;

    while (pos <= totalHeight + 2 * coarseStep) {
      await scrollToY(pos);

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

      const nearBottomNow = pos >= Math.max(0, totalHeight - 2 * viewportHeight);
      pos += nearBottomNow ? fineStep : coarseStep;
      totalHeight = await getTotalHeight();
    }

    throw new Error(`Apply now link at index ${index} not found`);
  }
}
