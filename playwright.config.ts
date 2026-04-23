import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const HEADLESS = !['0', 'false', 'no', 'n'].includes(
  (process.env.HEADLESS ?? 'true').trim().toLowerCase()
);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['./src/reporters/html-reporter.ts'],
    ['list'],
    ['./src/reporters/failures-reporter.ts'],
    ['allure-playwright', { detail: true }],
  ],
  timeout: 30000,
  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    viewport: { width: 1280, height: 800 },
    video: {
      mode: 'retain-on-failure',
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
  ],
  outputDir: 'reports/test-results',
});
