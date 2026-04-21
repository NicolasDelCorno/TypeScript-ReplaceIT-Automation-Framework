import { HomePage } from '../pages/HomePage';

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');

describe('TestHomePage', () => {
  let home: HomePage;

  beforeEach(async () => {
    await browser.url(BASE_URL);
    home = new HomePage();
  });

  it('test_hero_heading_visible', async () => {
    expect(await home.getHeroHeading()).toBe('Algorithms to impact your business');
  });

  it('test_clients_section_visible', async () => {
    const el = await home.getClientsSection();
    expect(await el.isDisplayed()).toBe(true);
  });

  it('test_results_section_visible', async () => {
    const el = await home.getResultsSection();
    expect(await el.isDisplayed()).toBe(true);
  });

  it('test_engagement_section_visible', async () => {
    const el = await home.getEngagementSection();
    expect(await el.isDisplayed()).toBe(true);
  });

  it('test_view_services_cta_navigates', async () => {
    await home.clickViewServices();
    await home.waitForUrl(`${BASE_URL}/servicios`);
    expect(await browser.getUrl()).toBe(`${BASE_URL}/servicios`);
  });
});
