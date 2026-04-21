import { test as base, expect } from '@playwright/test';
import type { TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = 'reports/screenshots/web';

export const TC_MAP: Record<string, string> = {
  // 1. Navigation
  'navigation.spec.ts > TestNavigation > test_nav_home_link':                       'TC1-1',
  'navigation.spec.ts > TestNavigation > test_nav_services_link':                   'TC1-2',
  'navigation.spec.ts > TestNavigation > test_nav_about_link':                      'TC1-3',
  'navigation.spec.ts > TestNavigation > test_nav_contact_link':                    'TC1-4',
  'navigation.spec.ts > TestNavigation > test_logo_navigates_home':                 'TC1-5',
  'navigation.spec.ts > TestNavigation > test_all_pages_load[/]':                   'TC1-6',
  'navigation.spec.ts > TestNavigation > test_all_pages_load[/servicios]':          'TC1-7',
  'navigation.spec.ts > TestNavigation > test_all_pages_load[/quienes-somos]':      'TC1-8',
  'navigation.spec.ts > TestNavigation > test_all_pages_load[/contacto]':           'TC1-9',
  // 2. Home
  'home.spec.ts > TestHomePage > test_hero_heading_visible':                         'TC2-1',
  'home.spec.ts > TestHomePage > test_clients_section_visible':                      'TC2-2',
  'home.spec.ts > TestHomePage > test_results_section_visible':                      'TC2-3',
  'home.spec.ts > TestHomePage > test_engagement_section_visible':                   'TC2-4',
  'home.spec.ts > TestHomePage > test_view_services_cta_navigates':                  'TC2-5',
  // 3. Services
  'services.spec.ts > TestServicesPage > test_hero_heading_visible':                 'TC3-1',
  'services.spec.ts > TestServicesPage > test_all_service_cards_present':            'TC3-2',
  'services.spec.ts > TestServicesPage > test_service_card_count':                   'TC3-3',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[0]':   'TC3-4',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[1]':   'TC3-5',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[2]':   'TC3-6',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[3]':   'TC3-7',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[4]':   'TC3-8',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[5]':   'TC3-9',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[6]':   'TC3-10',
  'services.spec.ts > TestServicesPage > test_apply_now_navigates_to_contact[7]':   'TC3-11',
  // 4. About
  'about.spec.ts > TestAboutPage > test_hero_heading_visible':                       'TC4-1',
  'about.spec.ts > TestAboutPage > test_gallery_section_visible':                    'TC4-2',
  // 5. Contact
  'contact.spec.ts > TestContactPage > test_hero_heading_visible':                   'TC5-1',
  'contact.spec.ts > TestContactPage > test_form_fields_present':                    'TC5-2',
  'contact.spec.ts > TestContactPage > test_send_button_present':                    'TC5-3',
  'contact.spec.ts > TestContactPage > test_contact_email_link_present':             'TC5-4',
  'contact.spec.ts > TestContactPage > test_phone_link_present':                     'TC5-5',
  'contact.spec.ts > TestContactPage > test_submit_empty_form_stays_on_page':        'TC5-6',
  'contact.spec.ts > TestContactPage > test_submit_with_invalid_email':              'TC5-7',
  'contact.spec.ts > TestContactPage > test_submit_valid_form':                      'TC5-8',
  // 6. Footer
  'footer.spec.ts > TestFooter > test_privacy_policy_link_works':                    'TC6-1',
  'footer.spec.ts > TestFooter > test_cookie_policy_link_works':                     'TC6-2',
  'footer.spec.ts > TestFooter > test_terms_and_conditions_link_works':              'TC6-3',
  'footer.spec.ts > TestFooter > test_social_links_present_in_footer[instagram]':   'TC6-4',
  'footer.spec.ts > TestFooter > test_social_links_present_in_footer[facebook]':    'TC6-5',
  'footer.spec.ts > TestFooter > test_social_links_present_in_footer[linkedin]':    'TC6-6',
  // 7. Quality Gates
  'quality-gates.spec.ts > TestQualityGates > test_no_severe_console_errors_on_load[/]':              'TC7-1',
  'quality-gates.spec.ts > TestQualityGates > test_no_severe_console_errors_on_load[/servicios]':    'TC7-2',
  'quality-gates.spec.ts > TestQualityGates > test_no_severe_console_errors_on_load[/quienes-somos]': 'TC7-3',
  'quality-gates.spec.ts > TestQualityGates > test_no_severe_console_errors_on_load[/contacto]':     'TC7-4',
  'quality-gates.spec.ts > TestQualityGates > test_unknown_route_has_expected_behavior':             'TC7-5',
};

export function tcFromInfo(testInfo: TestInfo): string {
  const titlePath = testInfo.titlePath;
  const key = [path.basename(titlePath[0] ?? ''), ...titlePath.slice(1)].join(' > ');
  return TC_MAP[key] ?? 'TCx';
}

type WebFixtures = {
  tc: string;
};

export const test = base.extend<WebFixtures>({
  tc: async ({}, use, testInfo) => {
    await use(tcFromInfo(testInfo));
  },

  page: async ({ page }, use, testInfo) => {
    await use(page);

    const tc = tcFromInfo(testInfo);
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    const screenshotPath = path.join(SCREENSHOTS_DIR, `PIC-${tc}-${ts}.png`);
    try {
      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
        timeout: 5000,
      });
    } catch { /* ignore */ }
  },
});

export { expect };
