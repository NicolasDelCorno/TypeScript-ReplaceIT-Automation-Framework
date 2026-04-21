import { test, expect } from '../src/fixtures/web-fixtures';
import { BasePage } from '../src/pages/BasePage';

const SOCIAL_KEYS = ['instagram', 'facebook', 'linkedin'] as const;

test.describe('TestFooter', () => {
  let base: BasePage;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!, { waitUntil: 'networkidle' });
    base = new BasePage(page);
  });

  test('test_privacy_policy_link_works', async ({ page }) => {
    const link = page.locator("footer a[href='#priv']").first();
    await expect(link).toBeVisible();
    expect(await link.getAttribute('href')).toBe('#priv');
    await base.clickPrivacyPolicy();
  });

  test('test_cookie_policy_link_works', async ({ page }) => {
    const link = page.locator("footer a[href='#cookies']").first();
    await expect(link).toBeVisible();
    expect(await link.getAttribute('href')).toBe('#cookies');
    await base.clickCookiePolicy();
  });

  test('test_terms_and_conditions_link_works', async ({ page }) => {
    const link = page.locator("footer a[href='#term']").first();
    await expect(link).toBeVisible();
    expect(await link.getAttribute('href')).toBe('#term');
    await base.clickTermsAndConditions();
  });

  for (const key of SOCIAL_KEYS) {
    test(`test_social_links_present_in_footer[${key}]`, async ({ page }) => {
      const href = BasePage.SOCIAL_LINKS[key];
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const link = page.locator(`footer a[href='${href}']`).first();
      await expect(link).toBeVisible();
    });
  }
});
