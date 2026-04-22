import type { Options } from '@wdio/types';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { generateHtmlReport } from './reporters/html-reporter';
import type { TestResult } from './reporters/html-reporter';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const PLATFORM = (process.env.PLATFORM ?? 'ios').toLowerCase() as 'ios' | 'android';
const PLATFORM_LABEL = PLATFORM === 'ios' ? 'iOS' : 'Android';

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const reportsDir = path.resolve(__dirname, `../reports/${PLATFORM_LABEL}`);
const screenshotsDir = path.resolve(__dirname, `../reports/screenshots/${PLATFORM}`);
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(screenshotsDir, { recursive: true });

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
  reporters: ['spec'],

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

  // Best-effort writer so we still get failures.json even if the run aborts early
  // or crashes before onComplete. We intentionally swallow any FS errors to avoid
  // masking the real test failure.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _flushFailuresSnapshot(resultsFailed?: number) {
    try {
      const mobileFailures = ((global as Record<string, unknown>).__mobileFailures as unknown[]) ?? [];
      const payload = {
        schema_version: 1,
        suite: 'mobile',
        run_started_at: timestamp,
        exitstatus: (resultsFailed ?? 0) > 0 ? 1 : 0,
        base_url: BASE_URL,
        platform: PLATFORM,
        failures: mobileFailures ?? [],
      };
      const outputPath = path.resolve(__dirname, '../failures.json');
      fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch { /* ignore */ }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterTest(test: any, _context: any, { error, duration }: { error?: Error; duration?: number }) {
    const mobileFailures = (global as Record<string, unknown>).__mobileFailures as Array<Record<string, unknown>>;
    const mobileAllResults = (global as Record<string, unknown>).__mobileAllResults as TestResult[];
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const screenshotPath = path.join(screenshotsDir, `PIC-TCx-${ts}.png`);

    const testId = [
      path.basename((test.file as string) ?? ''),
      test.parent,
      test.title,
    ].filter(Boolean).join(' > ');

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
    } catch { /* ignore */ }
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

    const mobileAllResults = (((global as Record<string, unknown>).__mobileAllResults as TestResult[]) ?? []);
    const reportPath = path.join(reportsDir, `Report-${PLATFORM_LABEL}-${timestamp}.html`);
    try {
      generateHtmlReport(mobileAllResults, reportPath, PLATFORM_LABEL);
    } catch { /* ignore */ }
  },
};
