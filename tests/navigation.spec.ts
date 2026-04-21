import { test, expect } from '../src/fixtures/web-fixtures';
import { BasePage } from '../src/pages/BasePage';

const PATHS = ['/', '/servicios', '/quienes-somos', '/contacto'];

test.describe('TestNavigation', () => {
  test('test_nav_home_link', async ({ page, baseURL }) => {
    const base = new BasePage(page);
    await page.goto(`${baseURL}/servicios`, { waitUntil: 'networkidle' });
    await base.clickNavHome();
    await page.waitForURL(`${baseURL}/`);
    expect(page.url()).toBe(`${baseURL}/`);
  });

  test('test_nav_services_link', async ({ page, baseURL }) => {
    const base = new BasePage(page);
    await page.goto(baseURL!, { waitUntil: 'networkidle' });
    await base.clickNavServices();
    await page.waitForURL(`${baseURL}/servicios`);
    expect(page.url()).toBe(`${baseURL}/servicios`);
  });

  test('test_nav_about_link', async ({ page, baseURL }) => {
    const base = new BasePage(page);
    await page.goto(baseURL!, { waitUntil: 'networkidle' });
    await base.clickNavAbout();
    await page.waitForURL(`${baseURL}/quienes-somos`);
    expect(page.url()).toBe(`${baseURL}/quienes-somos`);
  });

  test('test_nav_contact_link', async ({ page, baseURL }) => {
    const base = new BasePage(page);
    await page.goto(baseURL!, { waitUntil: 'networkidle' });
    await base.clickNavContact();
    await page.waitForURL(`${baseURL}/contacto`);
    expect(page.url()).toBe(`${baseURL}/contacto`);
  });

  test('test_logo_navigates_home', async ({ page, baseURL }) => {
    const base = new BasePage(page);
    await page.goto(`${baseURL}/quienes-somos`, { waitUntil: 'networkidle' });
    await base.clickLogo();
    await page.waitForURL(`${baseURL}/`);
    expect(page.url()).toBe(`${baseURL}/`);
  });

  for (const urlPath of PATHS) {
    test(`test_all_pages_load[${urlPath}]`, async ({ page, baseURL }) => {
      const expected = `${baseURL}${urlPath}`;
      await page.goto(expected, { waitUntil: 'networkidle' });
      expect(page.url()).toBe(expected);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});
