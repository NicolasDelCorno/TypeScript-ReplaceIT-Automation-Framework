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

interface ReportEntry {
  testId: string;
  result: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

function formatDuration(ms: number): string {
  if (ms >= 3600000) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  if (ms >= 60000) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms} ms`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateHtmlReport(results: ReportEntry[], outputPath: string): void {
  const passed = results.filter(r => r.result === 'passed').length;
  const failed = results.filter(r => r.result === 'failed').length;
  const total = results.length;
  const totalMs = results.reduce((sum, r) => sum + r.duration, 0);
  const title = path.basename(outputPath, '.html');
  const generatedOn = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const rows = results.map(r => {
    const resultLabel = r.result === 'passed' ? 'Passed' : r.result === 'failed' ? 'Failed' : 'Skipped';
    const resultClass = r.result === 'skipped' ? 'skipped' : r.result;
    const errorRow = r.error
      ? `\n        <tr class="extras-row"><td colspan="3"><div class="log">${escapeHtml(r.error)}</div></td></tr>`
      : '';
    return `        <tr class="collapsible ${resultClass}">
          <td class="col-result ${resultClass}">${resultLabel}</td>
          <td class="col-testId">${escapeHtml(r.testId)}</td>
          <td class="col-duration">${formatDuration(r.duration)}</td>
        </tr>${errorRow}`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; min-width: 800px; color: #999; }
h1 { font-size: 24px; color: black; }
h2 { font-size: 16px; color: black; }
p { color: black; }
a { color: #999; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 5px; border: 1px solid #e6e6e6; text-align: left; font-size: 12px; }
th { font-weight: bold; }
#results-table { border: 1px solid #e6e6e6; color: #999; }
.passed .col-result, span.passed { color: green; }
.failed .col-result, span.failed { color: red; }
.skipped .col-result, span.skipped { color: #999; }
.log { background-color: #e6e6e6; font-family: "Courier New", Courier, monospace; padding: 5px; white-space: pre-wrap; color: black; display: block; margin-top: 4px; }
.col-result { width: 130px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>Report generated on ${generatedOn} by <a href="https://playwright.dev">Playwright</a> (Web/Chromium)</p>
    <h2>Summary</h2>
    <p class="run-count">${total} tests took ${formatDuration(totalMs)}.</p>
    <p>
      <span class="failed">${failed} Failed,</span>
      <span class="passed">${passed} Passed</span>
    </p>
    <table id="results-table">
      <thead>
        <tr>
          <th>Result</th>
          <th>Test</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </body>
</html>`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');
}

export default class WebHtmlReporter implements Reporter {
  private results: ReportEntry[] = [];

  onBegin(_config: FullConfig, _suite: Suite): void {
    // timestamp captured at module load so it matches the run start
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath();
    const tcKey = [path.basename(titlePath[0] ?? ''), ...titlePath.slice(1)].join(' > ');
    const tc = TC_MAP[tcKey] ?? 'TCx';
    const label = titlePath.slice(1).join(' > ');
    const testId = `[${tc}] ${label}`;

    const firstError = result.errors[0];
    const errorText = firstError
      ? (firstError.stack ?? firstError.message ?? '')
      : undefined;

    const resultStatus: ReportEntry['result'] =
      result.status === 'passed' ? 'passed'
      : result.status === 'skipped' ? 'skipped'
      : 'failed';

    this.results.push({
      testId,
      result: resultStatus,
      duration: result.duration,
      error: errorText,
    });
  }

  onEnd(_result: FullResult): void {
    const outputPath = path.resolve(
      __dirname,
      `../../reports/Web/Report-Web-${timestamp}.html`,
    );
    try {
      generateHtmlReport(this.results, outputPath);
    } catch { /* ignore */ }
  }
}
