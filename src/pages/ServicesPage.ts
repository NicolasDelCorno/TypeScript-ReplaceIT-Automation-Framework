import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export const EXPECTED_SERVICES = [
  'Autonomous AI Agents',
  'Chatbots with RAG',
  'Computer Vision',
  'Process Automation',
  'Generative AI',
  'Document Processing',
  'Recommendation Systems',
  'NLP & Sentiment Analysis',
] as const;

export class ServicesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async getHeroHeading(): Promise<string> {
    return (await this.page.locator('h1').first().innerText()).trim();
  }

  async getServiceHeadings(): Promise<string[]> {
    const cards = await this.page.locator('h3').all();
    return Promise.all(cards.map(async (h) => (await h.innerText()).trim()));
  }

  getApplyNowLinks(): Locator {
    return this.page.locator("a[href='/contacto']").filter({ hasText: 'Apply now' });
  }

  async clickApplyNow(index = 0): Promise<void> {
    await this.getApplyNowLinks().nth(index).click();
  }
}
