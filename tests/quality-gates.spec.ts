import { test, expect } from '../src/fixtures/web-fixtures';

const PATHS = ['/', '/servicios', '/quienes-somos', '/contacto'] as const;

test.describe('TestQualityGates', () => {
  for (const urlPath of PATHS) {
    test(`test_no_severe_console_errors_on_load[${urlPath}]`, async ({ page, baseURL }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => {
        pageErrors.push(String(err));
      });

      await page.goto(`${baseURL}${urlPath}`, { waitUntil: 'networkidle' });
      await expect(page.locator('h1').first()).toBeVisible();

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('test_unknown_route_has_expected_behavior', async ({ page, baseURL }) => {
    const response = await page.goto(`${baseURL}/does-not-exist-qa`, { waitUntil: 'networkidle' });

    if (response && response.status() === 404) {
      const has404 = await page.locator('text=404').first().isVisible();
      const hasNotFound = await page.locator('text=Not Found').first().isVisible();
      expect(has404 || hasNotFound).toBe(true);
    } else {
      expect([`${baseURL}/`, `${baseURL}/does-not-exist-qa`]).toContain(page.url());
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });
});
