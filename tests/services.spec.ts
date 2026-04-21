import { test, expect } from '../src/fixtures/web-fixtures';
import { ServicesPage, EXPECTED_SERVICES } from '../src/pages/ServicesPage';

test.describe('TestServicesPage', () => {
  let services: ServicesPage;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/servicios`, { waitUntil: 'networkidle' });
    services = new ServicesPage(page);
  });

  test('test_hero_heading_visible', async () => {
    expect(await services.getHeroHeading()).toBe('We create digital products');
  });

  test('test_all_service_cards_present', async () => {
    const headings = await services.getServiceHeadings();
    for (const service of EXPECTED_SERVICES) {
      expect(headings).toContain(service);
    }
  });

  test('test_service_card_count', async () => {
    const count = await services.getApplyNowLinks().count();
    expect(count).toBe(EXPECTED_SERVICES.length);
  });

  for (let index = 0; index < EXPECTED_SERVICES.length; index++) {
    test(`test_apply_now_navigates_to_contact[${index}]`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/servicios`, { waitUntil: 'networkidle' });
      const svc = new ServicesPage(page);
      await svc.clickApplyNow(index);
      await page.waitForURL(`${baseURL}/contacto`);
      expect(page.url()).toBe(`${baseURL}/contacto`);
    });
  }
});
