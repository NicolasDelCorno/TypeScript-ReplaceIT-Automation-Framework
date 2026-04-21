import type { Options } from '@wdio/types';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const PLATFORM = (process.env.PLATFORM ?? 'ios').toLowerCase() as 'ios' | 'android';
const PLATFORM_LABEL = PLATFORM === 'ios' ? 'iOS' : 'Android';

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const reportsDir = path.resolve(__dirname, `../reports/${PLATFORM_LABEL}`);
const screenshotsDir = path.resolve(__dirname, `../reports/screenshots/${PLATFORM}`);
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(screenshotsDir, { recursive: true });

const iosCapabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 17',
  'appium:platformVersion': '26.1',
  'appium:browserName': 'Safari',
};

const androidCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'emulator-5554',
  'appium:browserName': 'Chrome',
  'appium:chromedriverAutodownload': true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const config: Record<string, any> = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  specs: ['./mobile/tests/**/*.spec.ts'],
  exclude: [],

  maxInstances: 1,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  capabilities: [PLATFORM === 'ios' ? iosCapabilities : androidCapabilities] as any,

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    ['appium', {
      command: 'appium',
      logPath: path.join(reportsDir, 'appium.log'),
    }],
  ],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  before() {
    (global as Record<string, unknown>).__mobileFailures = [];
    (global as Record<string, unknown>).__mobileBaseUrl = BASE_URL;
    (global as Record<string, unknown>).__mobilePlatform = PLATFORM;
    (global as Record<string, unknown>).__mobileTimestamp = timestamp;
    (global as Record<string, unknown>).__mobileScreenshotsDir = screenshotsDir;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterTest(_test: any, _context: any, { error }: { error?: Error }) {
    const mobileFailures = (global as Record<string, unknown>).__mobileFailures as Array<Record<string, unknown>>;
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const screenshotPath = path.join(screenshotsDir, `PIC-TCx-${ts}.png`);

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
    }

    try {
      // browser global is available at runtime via WDIO
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).browser?.saveScreenshot(screenshotPath);
    } catch { /* ignore */ }
  },

  onComplete(_exitCode: number, _config: Options.Testrunner, _capabilities: unknown, results: { failed: number }) {
    const mobileFailures = (global as Record<string, unknown>).__mobileFailures as unknown[];
    const payload = {
      schema_version: 1,
      suite: 'mobile',
      run_started_at: timestamp,
      exitstatus: results.failed > 0 ? 1 : 0,
      base_url: BASE_URL,
      platform: PLATFORM,
      failures: mobileFailures ?? [],
    };

    try {
      const outputPath = path.resolve(__dirname, '../failures.json');
      fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch { /* ignore */ }
  },
};
