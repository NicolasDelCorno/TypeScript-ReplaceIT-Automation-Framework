import { BasePage } from '../pages/BasePage';

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const SOCIAL_KEYS = ['instagram', 'facebook', 'linkedin'] as const;

describe('TestFooter', () => {
  let base: BasePage;

  beforeEach(async () => {
    await browser.url(BASE_URL);
    base = new BasePage();
  });

  it('test_privacy_policy_link_works', async () => {
    const link = await base.getFooterLink('#priv');
    expect(await link.isDisplayed()).toBe(true);
    expect(await link.getAttribute('href')).toBe('#priv');
    await base.clickPrivacyPolicy();
  });

  it('test_cookie_policy_link_works', async () => {
    const link = await base.getFooterLink('#cookies');
    expect(await link.isDisplayed()).toBe(true);
    expect(await link.getAttribute('href')).toBe('#cookies');
    await base.clickCookiePolicy();
  });

  it('test_terms_and_conditions_link_works', async () => {
    const link = await base.getFooterLink('#term');
    expect(await link.isDisplayed()).toBe(true);
    expect(await link.getAttribute('href')).toBe('#term');
    await base.clickTermsAndConditions();
  });

  for (const key of SOCIAL_KEYS) {
    it(`test_social_links_present_in_footer[${key}]`, async () => {
      const href = BasePage.SOCIAL_LINKS[key];
      const link = await base.getFooterLink(href);
      expect(await link.isDisplayed()).toBe(true);
    });
  }
});
