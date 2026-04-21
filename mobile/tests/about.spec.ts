import { AboutPage } from '../pages/AboutPage';

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');

describe('TestAboutPage', () => {
  let about: AboutPage;

  beforeEach(async () => {
    await browser.url(`${BASE_URL}/quienes-somos`);
    about = new AboutPage();
  });

  it('test_hero_heading_visible', async () => {
    expect(await about.getHeroHeading()).toBe('About us');
  });

  it('test_gallery_section_visible', async () => {
    const el = await about.getGallerySection();
    expect(await el.isDisplayed()).toBe(true);
  });
});
