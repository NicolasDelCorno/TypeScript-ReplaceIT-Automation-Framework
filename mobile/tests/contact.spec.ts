import { ContactPage } from '../pages/ContactPage';

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');

describe('TestContactPage', () => {
  let contact: ContactPage;

  beforeEach(async () => {
    await browser.url(`${BASE_URL}/contacto`);
    contact = new ContactPage();
  });

  it('test_hero_heading_visible', async () => {
    expect(await contact.getHeroHeading()).toBe('Get in touch with us');
  });

  it('test_form_fields_present', async () => {
    expect(await (await contact.getNameField()).isDisplayed()).toBe(true);
    expect(await (await contact.getEmailField()).isDisplayed()).toBe(true);
    expect(await (await contact.getReasonField()).isDisplayed()).toBe(true);
  });

  it('test_send_button_present', async () => {
    expect(await (await contact.getSendButton()).isDisplayed()).toBe(true);
  });

  it('test_contact_email_link_present', async () => {
    expect(await (await contact.getContactEmailLink()).isDisplayed()).toBe(true);
  });

  it('test_phone_link_present', async () => {
    expect(await (await contact.getPhoneLink()).isDisplayed()).toBe(true);
  });

  it('test_submit_empty_form_stays_on_page', async () => {
    await contact.submitForm();
    expect(await browser.getUrl()).toBe(`${BASE_URL}/contacto`);
    const nameField = await contact.getNameField();
    expect(await contact.elementCheckValidity(nameField)).toBe(false);
    const emailField = await contact.getEmailField();
    expect(await contact.elementCheckValidity(emailField)).toBe(false);
    const reasonField = await contact.getReasonField();
    expect(await contact.elementCheckValidity(reasonField)).toBe(false);
  });

  it('test_submit_with_invalid_email', async () => {
    await contact.fillForm({ name: 'Test User', email: 'not-an-email', reason: 'Testing' });
    await contact.submitForm();
    expect(await browser.getUrl()).toBe(`${BASE_URL}/contacto`);
    const emailField = await contact.getEmailField();
    expect(await contact.elementCheckValidity(emailField)).toBe(false);
  });

  it('test_submit_valid_form', async () => {
    await contact.fillForm({
      name: 'Test User',
      email: 'test@example.com',
      reason: 'Automated test submission',
    });
    await contact.submitForm();
    const banner = await contact.getSuccessBanner();
    expect(await banner.isDisplayed()).toBe(true);
  });
});
