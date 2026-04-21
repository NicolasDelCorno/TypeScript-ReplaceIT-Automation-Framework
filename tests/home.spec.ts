import { test, expect } from '../src/fixtures/web-fixtures';
import { HomePage } from '../src/pages/HomePage';

test.describe('TestHomePage', () => {
  let home: HomePage;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!, { waitUntil: 'networkidle' });
    home = new HomePage(page);
  });

  test('test_hero_heading_visible', async () => {
    expect(await home.getHeroHeading()).toBe('Algorithms to impact your business');
  });

  test('test_clients_section_visible', async () => {
    await expect(home.getClientsSection()).toBeVisible();
  });

  test('test_results_section_visible', async () => {
    await expect(home.getResultsSection()).toBeVisible();
  });

  test('test_engagement_section_visible', async () => {
    await expect(home.getEngagementSection()).toBeVisible();
  });

  test('test_view_services_cta_navigates', async ({ page, baseURL }) => {
    await home.clickViewServices();
    await page.waitForURL(`${baseURL}/servicios`);
    expect(page.url()).toBe(`${baseURL}/servicios`);
  });
});
