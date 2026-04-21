import type {
  Reporter,
  Suite,
  TestCase,
  TestResult,
  FullConfig,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { TC_MAP } from '../fixtures/web-fixtures';

interface FailureEntry {
  nodeid: string;
  tc: string;
  when: string;
  outcome: string;
  message: string | null;
  longrepr: string;
  timestamp: string;
  run_started_at: string;
  base_url: string;
  pw_browser: string;
  headless: boolean;
}

interface FailuresPayload {
  schema_version: 1;
  suite: 'web';
  run_started_at: string;
  exitstatus: number;
  base_url: string;
  pw_browser: string;
  headless: boolean;
  failures: FailureEntry[];
}

const BASE_URL = (process.env.BASE_URL ?? 'https://replaceit.ai').replace(/\/$/, '');
const HEADLESS = ['1', 'true', 'yes', 'y'].includes(
  (process.env.HEADLESS ?? 'false').trim().toLowerCase()
);

export default class FailuresReporter implements Reporter {
  private failures: FailureEntry[] = [];
  private runStartedAt = '';
  private browser = 'chromium';

  onBegin(config: FullConfig, _suite: Suite): void {
    this.runStartedAt = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    this.browser = config.projects[0]?.name ?? 'chromium';
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;

    const titlePath = test.titlePath();
    const nodeId = titlePath.join('::');
    const tcKey = [path.basename(titlePath[0] ?? ''), ...titlePath.slice(1)].join(' > ');
    const tc = TC_MAP[tcKey] ?? 'TCx';

    const firstError = result.errors[0];
    this.failures.push({
      nodeid: nodeId,
      tc,
      when: 'call',
      outcome: 'failed',
      message: firstError?.message ?? null,
      longrepr: firstError?.stack ?? firstError?.message ?? '',
      timestamp: new Date().toISOString().slice(0, 19),
      run_started_at: this.runStartedAt,
      base_url: BASE_URL,
      pw_browser: this.browser,
      headless: HEADLESS,
    });
  }

  onEnd(result: FullResult): void {
    const exitStatusMap: Record<string, number> = {
      passed: 0,
      failed: 1,
      timedout: 2,
      interrupted: 130,
    };

    const payload: FailuresPayload = {
      schema_version: 1,
      suite: 'web',
      run_started_at: this.runStartedAt,
      exitstatus: exitStatusMap[result.status] ?? 1,
      base_url: BASE_URL,
      pw_browser: this.browser,
      headless: HEADLESS,
      failures: this.failures,
    };

    try {
      const outputPath = path.resolve(__dirname, '../../failures.json');
      fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch { /* ignore */ }
  }
}
