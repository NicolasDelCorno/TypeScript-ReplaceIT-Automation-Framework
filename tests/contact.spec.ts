import { test, expect } from '../src/fixtures/web-fixtures';
import { ContactPage } from '../src/pages/ContactPage';

test.describe('TestContactPage', () => {
  let contact: ContactPage;

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/contacto`, { waitUntil: 'networkidle' });
    contact = new ContactPage(page);
  });

  test('test_hero_heading_visible', async () => {
    expect(await contact.getHeroHeading()).toBe('Get in touch with us');
  });

  test('test_form_fields_present', async () => {
    await expect(contact.getNameField()).toBeVisible();
    await expect(contact.getEmailField()).toBeVisible();
    await expect(contact.getReasonField()).toBeVisible();
  });

  test('test_send_button_present', async () => {
    await expect(contact.getSendButton()).toBeVisible();
  });

  test('test_contact_email_link_present', async () => {
    await expect(contact.getContactEmailLink()).toBeVisible();
  });

  test('test_phone_link_present', async () => {
    await expect(contact.getPhoneLink()).toBeVisible();
  });

  test('test_submit_empty_form_stays_on_page', async ({ page, baseURL }) => {
    await contact.submitForm();
    expect(page.url()).toBe(`${baseURL}/contacto`);
    expect(await contact.getNameField().evaluate(
      (el: HTMLInputElement) => el.matches(':invalid')
    )).toBe(true);
    expect(await contact.getEmailField().evaluate(
      (el: HTMLInputElement) => el.matches(':invalid')
    )).toBe(true);
    expect(await contact.getReasonField().evaluate(
      (el: HTMLInputElement) => el.matches(':invalid')
    )).toBe(true);
  });

  test('test_submit_with_invalid_email', async ({ page, baseURL }) => {
    await contact.fillForm({ name: 'Test User', email: 'not-an-email', reason: 'Testing' });
    await contact.submitForm();
    expect(page.url()).toBe(`${baseURL}/contacto`);
    expect(await contact.getEmailField().evaluate(
      (el: HTMLInputElement) => el.matches(':invalid')
    )).toBe(true);
  });

  test('test_submit_valid_form', async ({ page, baseURL }) => {
    await contact.fillForm({
      name: 'Test User',
      email: 'test@example.com',
      reason: 'Automated test submission',
    });
    await contact.submitForm();
    expect(page.url()).toContain(`${baseURL}/contacto`);
    await contact.waitForSuccessBanner();
    await expect(contact.getSuccessBanner()).toBeVisible();
  });
});
