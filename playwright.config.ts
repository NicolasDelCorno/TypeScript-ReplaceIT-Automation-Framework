import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const HEADLESS = ['1', 'true', 'yes', 'y'].includes(
  (process.env.HEADLESS ?? 'false').trim().toLowerCase()
);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', {
      outputFolder: 'reports/Web',
      fileName: `Report-Web-${timestamp}.html`,
      open: 'never',
    }],
    ['list'],
    ['./src/reporters/failures-reporter.ts'],
  ],
  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    viewport: { width: 1280, height: 800 },
    video: {
      mode: 'on',
      size: { width: 1280, height: 800 },
    },
    screenshot: 'on',
    trace: 'off',
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  outputDir: 'reports/test-results',
});
