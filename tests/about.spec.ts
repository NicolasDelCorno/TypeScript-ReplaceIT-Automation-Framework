import { test, expect } from '../src/fixtures/web-fixtures';
import { AboutPage } from '../src/pages/AboutPage';

test.describe('TestAboutPage', () => {
  let about: AboutPage;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/quienes-somos`, { waitUntil: 'networkidle' });
    about = new AboutPage(page);
  });

  test('test_hero_heading_visible', async () => {
    expect(await about.getHeroHeading()).toBe('About us');
  });

  test('test_gallery_section_visible', async () => {
    await expect(about.getGallerySection()).toBeVisible();
  });
});
