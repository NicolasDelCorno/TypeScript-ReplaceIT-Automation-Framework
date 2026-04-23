import type { Options } from '@wdio/types';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import allureReporter from '@wdio/allure-reporter';
import { generateHtmlReport } from './reporters/html-reporter';
import type { TestResult } from './reporters/html-reporter';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const PLATFORM = (process.env.PLATFORM ?? 'ios').toLowerCase() as 'ios' | 'android';
const PLATFORM_LABEL = PLATFORM === 'ios' ? 'iOS' : 'Android';

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const reportsDir = path.resolve(__dirname, `../reports/${PLATFORM_LABEL}`);
const screenshotsDir = path.resolve(__dirname, `../reports/screenshots/${PLATFORM}`);
const allureResultsDir = path.resolve(__dirname, `../reports/allure-results/mobile/${PLATFORM}`);
const allResultsJsonPath = path.join(reportsDir, '.run-results.json');
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(screenshotsDir, { recursive: true });
fs.mkdirSync(allureResultsDir, { recursive: true });

const MOBILE_TC_MAP: Record<string, string> = {
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
};

// Ensure failure collection exists even if the session never starts
// (e.g. chromedriver mismatch during session creation).
(global as Record<string, unknown>).__mobileFailures =
  ((global as Record<string, unknown>).__mobileFailures as unknown[]) ?? [];

// Appium needs a writable "home" dir for drivers/plugins/cache.
// In sandboxed executions, writing to the real user home may be blocked,
// so we explicitly pin it to a workspace directory.
const appiumHomeDir = path.resolve(__dirname, '../.appium');
fs.mkdirSync(appiumHomeDir, { recursive: true });
process.env.APPIUM_HOME = process.env.APPIUM_HOME || appiumHomeDir;

// Where UIAutomator2/Appium will download chromedrivers when autodownload is enabled.
// Keeping it under `.appium/` ensures it is writable and lives in the repo.
const chromedriverDir = path.resolve(appiumHomeDir, 'chromedrivers');
fs.mkdirSync(chromedriverDir, { recursive: true });

const iosCapabilities = {
  maxInstances: 1,
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 17',
  'appium:platformVersion': '26.1',
  'appium:browserName': 'Safari',
  // iOS Safari + simulator can be slow to start/transition.
  'appium:newCommandTimeout': 180,
};

const androidCapabilities = {
  maxInstances: 1,
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'emulator-5554',
  'appium:browserName': 'Chrome',
  'appium:chromedriverAutodownload': true,
  'appium:chromedriverExecutableDir': chromedriverDir,
  'appium:newCommandTimeout': 180,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const config: Record<string, any> = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  // Resolve specs relative to this config file so running from repo root works.
  specs: [path.resolve(__dirname, './tests/**/*.spec.ts')],
  exclude: [],

  //
  // Stability defaults
  // - mobile browser tests are much slower than Playwright web
  // - keep sessions single-threaded to avoid simulator/Appium flakiness
  //
  maxInstances: 1,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  capabilities: [PLATFORM === 'ios' ? iosCapabilities : androidCapabilities] as any,

  logLevel: (process.env.WDIO_LOG_LEVEL ?? 'warn') as Options.WebDriverLogTypes,
  bail: 0,
  waitforTimeout: 20000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  services: [
    ['appium', {
      command: 'appium',
      args: {
        // Avoid dynamic host/port detection; keep it explicit and stable.
        address: '127.0.0.1',
        port: 4723,
        basePath: '/',

        // Required for `appium:chromedriverAutodownload` on Appium 2:
        // Appium gates this behind an "insecure" feature flag.
        // Without it, Android Chrome sessions fail at creation with:
        // "No Chromedriver found that can automate Chrome 'X.Y.Z'".
        // Enable Chromedriver autodownload (required for recent Chrome versions).
        // For UIAutomator2, the feature is namespaced.
        //
        // Appium CLI equivalent:
        // `appium server --allow-insecure uiautomator2:chromedriver_autodownload`
        //
        // Note: the WDIO Appium service maps camelCase keys to Appium CLI flags.
        // This should become: `--allow-insecure uiautomator2:chromedriver_autodownload`
        allowInsecure: ['uiautomator2:chromedriver_autodownload'],

        // For local runs, relaxed security is fine and avoids feature-gate
        // surprises if a future Appium version changes the allowlist behavior.
        relaxedSecurity: true,
      },
      logPath: path.join(reportsDir, 'appium.log'),
    }],
  ],

  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', { outputDir: allureResultsDir }],
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  before() {
    (global as Record<string, unknown>).__mobileFailures = [];
    (global as Record<string, unknown>).__mobileAllResults = [];
    (global as Record<string, unknown>).__mobileBaseUrl = BASE_URL;
    (global as Record<string, unknown>).__mobilePlatform = PLATFORM;
    (global as Record<string, unknown>).__mobileTimestamp = timestamp;
    (global as Record<string, unknown>).__mobileScreenshotsDir = screenshotsDir;
  },

  // Persist all results to disk so onComplete (main process) can read them.
  // Worker globals are not shared with the launcher process.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _flushAllResultsSnapshot() {
    try {
      const results = ((global as Record<string, unknown>).__mobileAllResults as TestResult[]) ?? [];
      fs.writeFileSync(allResultsJsonPath, JSON.stringify(results, null, 2), 'utf-8');
    } catch { /* ignore */ }
  },

  // Best-effort writer so we still get failures.json even if the run aborts early
  // or crashes before onComplete. We intentionally swallow any FS errors to avoid
  // masking the real test failure.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _flushFailuresSnapshot(resultsFailed?: number) {
    try {
      const mobileFailures = ((global as Record<string, unknown>).__mobileFailures as unknown[]) ?? [];
      const platformSection = {
        run_started_at: timestamp,
        exitstatus: (resultsFailed ?? 0) > 0 ? 1 : 0,
        base_url: BASE_URL,
        failures: mobileFailures,
      };
      const outputPath = path.resolve(__dirname, '../failures.json');
      let existing: Record<string, unknown> = {};
      try {
        const raw = JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as Record<string, unknown>;
        if (raw?.schema_version === 2) existing = raw;
      } catch { /* first run or corrupt — start fresh */ }
      const payload = { ...existing, schema_version: 2, [PLATFORM]: platformSection };
      fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch { /* ignore */ }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterTest(test: any, _context: any, { error, duration }: { error?: Error; duration?: number }) {
    const mobileFailures = (global as Record<string, unknown>).__mobileFailures as Array<Record<string, unknown>>;
    const mobileAllResults = (global as Record<string, unknown>).__mobileAllResults as TestResult[];
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

    const testId = [
      path.basename((test.file as string) ?? ''),
      test.parent,
      test.title,
    ].filter(Boolean).join(' > ');

    const tc = MOBILE_TC_MAP[testId] ?? 'TCx';
    const screenshotPath = path.join(screenshotsDir, `PIC-${tc}-${ts}.png`);

    mobileAllResults.push({
      testId,
      result: error ? 'failed' : 'passed',
      duration: duration ?? 0,
      error: error ? (error.stack ?? error.message) : undefined,
    });

    if (error) {
      mobileFailures.push({
        when: 'call',
        outcome: 'failed',
        message: error.message ?? null,
        longrepr: error.stack ?? error.message ?? '',
        timestamp: new Date().toISOString().slice(0, 19),
        run_started_at: timestamp,
        base_url: BASE_URL,
        platform: PLATFORM,
      });

      // Persist as soon as we record a failure so CI/local runs still get a useful
      // snapshot even if the runner aborts before onComplete.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any)._flushFailuresSnapshot?.(1);
    }

    try {
      // browser global is available at runtime via WDIO
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).browser?.saveScreenshot(screenshotPath);
      if (error) {
        try {
          allureReporter.addAttachment(
            'screenshot',
            fs.readFileSync(screenshotPath),
            'image/png',
          );
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any)._flushAllResultsSnapshot?.();
  },

  // Capture hook failures (e.g. "before each" hook) which do not consistently
  // propagate through afterTest(error).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterHook(_test: any, _context: any, { error }: { error?: Error }) {
    if (!error) return;
    const mobileFailures = (global as Record<string, unknown>).__mobileFailures as Array<Record<string, unknown>>;
    mobileFailures.push({
      when: 'hook',
      outcome: 'failed',
      message: error.message ?? null,
      longrepr: error.stack ?? error.message ?? '',
      timestamp: new Date().toISOString().slice(0, 19),
      run_started_at: timestamp,
      base_url: BASE_URL,
      platform: PLATFORM,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any)._flushFailuresSnapshot?.(1);

    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const screenshotPath = path.join(screenshotsDir, `PIC-TCx-${ts}.png`);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).browser?.saveScreenshot(screenshotPath);
      try {
        allureReporter.addAttachment(
          'screenshot',
          fs.readFileSync(screenshotPath),
          'image/png',
        );
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  },

  // Capture failures that occur before Mocha hooks/tests run, e.g.:
  // - session creation failures (Chromedriver mismatch, device offline, etc.)
  // - worker bootstrap issues
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWorkerEnd(_cid: string, exitCode: number, _specs: string[], _retries: number) {
    if (exitCode === 0) return;

    const mobileFailures =
      (((global as Record<string, unknown>).__mobileFailures as Array<Record<string, unknown>>) ?? []);
    if (mobileFailures.length > 0) {
      // We already captured a more specific error via afterTest/afterHook.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any)._flushFailuresSnapshot?.(1);
      return;
    }

    let appiumExcerpt = '';
    try {
      const logPath = path.join(reportsDir, 'appium.log');
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf-8');
        appiumExcerpt = content.slice(Math.max(0, content.length - 8000));
      }
    } catch { /* ignore */ }

    mobileFailures.push({
      when: 'setup',
      outcome: 'failed',
      message: `Worker exited with code ${exitCode} (session likely failed to start)`,
      longrepr: appiumExcerpt || `Worker exited with code ${exitCode}`,
      timestamp: new Date().toISOString().slice(0, 19),
      run_started_at: timestamp,
      base_url: BASE_URL,
      platform: PLATFORM,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any)._flushFailuresSnapshot?.(1);
  },

  onComplete(_exitCode: number, _config: Options.Testrunner, _capabilities: unknown, results: { failed: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any)._flushFailuresSnapshot?.(results.failed);

    let mobileAllResults: TestResult[] = [];
    try {
      mobileAllResults = JSON.parse(fs.readFileSync(allResultsJsonPath, 'utf-8')) as TestResult[];
    } catch { /* ignore — no results file means 0 tests ran */ }

    const reportPath = path.join(reportsDir, `Report-${PLATFORM_LABEL}-${timestamp}.html`);
    try {
      generateHtmlReport(mobileAllResults, reportPath, PLATFORM_LABEL);
    } catch { /* ignore */ }
  },
};
