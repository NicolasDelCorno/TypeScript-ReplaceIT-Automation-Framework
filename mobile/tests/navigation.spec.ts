import { BasePage } from '../pages/BasePage';

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const PATHS = ['/', '/servicios', '/quienes-somos', '/contacto'];

describe('TestNavigation', () => {
  it('test_nav_home_link', async () => {
    const base = new BasePage();
    await browser.url(`${BASE_URL}/servicios`);
    await base.clickNavHome();
    await base.waitForUrl(`${BASE_URL}/`);
    expect(await browser.getUrl()).toBe(`${BASE_URL}/`);
  });

  it('test_nav_services_link', async () => {
    const base = new BasePage();
    await browser.url(BASE_URL);
    await base.clickNavServices();
    await base.waitForUrl(`${BASE_URL}/servicios`);
    expect(await browser.getUrl()).toBe(`${BASE_URL}/servicios`);
  });

  it('test_nav_about_link', async () => {
    const base = new BasePage();
    await browser.url(BASE_URL);
    await base.clickNavAbout();
    await base.waitForUrl(`${BASE_URL}/quienes-somos`);
    expect(await browser.getUrl()).toBe(`${BASE_URL}/quienes-somos`);
  });

  it('test_nav_contact_link', async () => {
    const base = new BasePage();
    await browser.url(BASE_URL);
    await base.clickNavContact();
    await base.waitForUrl(`${BASE_URL}/contacto`);
    expect(await browser.getUrl()).toBe(`${BASE_URL}/contacto`);
  });

  it('test_logo_navigates_home', async () => {
    const base = new BasePage();
    await browser.url(`${BASE_URL}/quienes-somos`);
    await base.clickLogo();
    await base.waitForUrl(`${BASE_URL}/`);
    expect(await browser.getUrl()).toBe(`${BASE_URL}/`);
  });

  for (const urlPath of PATHS) {
    it(`test_all_pages_load[${urlPath}]`, async () => {
      const expected = `${BASE_URL}${urlPath}`;
      await browser.url(expected);
      expect(await browser.getUrl()).toBe(expected);
      const h1 = await $('h1');
      await h1.waitForDisplayed({ timeout: 10000 });
      expect(await h1.isDisplayed()).toBe(true);
    });
  }
});
