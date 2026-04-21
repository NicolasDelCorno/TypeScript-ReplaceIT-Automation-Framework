import { ServicesPage, EXPECTED_SERVICES_ANDROID, EXPECTED_SERVICES_IOS } from '../pages/ServicesPage';

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const PLATFORM = (process.env.PLATFORM ?? 'ios').toLowerCase();
const EXPECTED_SERVICES = PLATFORM === 'android' ? EXPECTED_SERVICES_ANDROID : EXPECTED_SERVICES_IOS;

function normalizeLabel(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

describe('TestServicesPage', () => {
  let services: ServicesPage;

  beforeEach(async () => {
    await browser.url(`${BASE_URL}/servicios`);
    services = new ServicesPage();
  });

  it('test_hero_heading_visible', async () => {
    expect(await services.getHeroHeading()).toBe('We create digital products');
  });

  it('test_all_service_cards_present', async () => {
    const headings = await services.getServiceHeadings();
    const normalizedHeadings = headings.map(normalizeLabel);
    for (const service of EXPECTED_SERVICES) {
      expect(normalizedHeadings).toContain(normalizeLabel(service));
    }
  });

  it('test_service_card_count', async () => {
    const links = await services.getApplyNowLinks();
    expect(links.length).toBe(EXPECTED_SERVICES.length);
  });

  for (let index = 0; index < EXPECTED_SERVICES.length; index++) {
    it(`test_apply_now_navigates_to_contact[${index}]`, async () => {
      await browser.url(`${BASE_URL}/servicios`);
      const svc = new ServicesPage();
      await svc.clickApplyNow(index);
      await svc.waitForUrl(`${BASE_URL}/contacto`);
      expect(await browser.getUrl()).toBe(`${BASE_URL}/contacto`);
    });
  }
});
