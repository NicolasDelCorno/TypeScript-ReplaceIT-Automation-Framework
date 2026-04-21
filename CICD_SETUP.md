# CI/CD Setup

This document explains the steps taken to make the ReplaceIT test suite CI/CD ready using GitHub Actions.

## What Was Added

A single workflow file was created at `.github/workflows/web-tests.yml`.

## Scope Decision: Web Chrome Only

The CI pipeline runs only the **web Playwright tests** located in `tests/`. Mobile tests (`mobile/` and `ios/`) were intentionally excluded because they require real devices or emulators (via Appium) which are not available in a standard GitHub Actions runner.

## Workflow Breakdown

### Trigger

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

The pipeline runs automatically on every push to `main` and on every pull request targeting `main`.

### Runner

```yaml
runs-on: ubuntu-latest
```

Uses a GitHub-hosted Ubuntu runner, which is the standard environment for headless browser testing.

### Steps

#### 1. Checkout Code
Pulls the repository code into the runner using the official `actions/checkout@v4` action.

#### 2. Set Up Python
Installs Python 3.10 (matching the project's minimum requirement) with pip caching enabled to speed up repeated runs.

#### 3. Install Dependencies
Runs `pip install -r requirements.txt` to install all project dependencies including pytest, pytest-playwright, and pytest-html.

#### 4. Install Playwright Chromium
```bash
python -m playwright install chromium --with-deps
```
Installs only the Chromium browser binary. The `--with-deps` flag also installs the Linux system libraries (fonts, codecs, etc.) required for headless Chrome to run on Ubuntu.

Firefox and WebKit are intentionally skipped to keep the pipeline fast and focused.

#### 5. Run Web Tests
```bash
pytest tests/ --pw-browser=chromium --html=reports/web-report.html
```
- Targets the `tests/` directory only (web tests)
- Forces Chromium as the browser
- `HEADLESS=1` ensures no display is required
- `BASE_URL` points to the live site at `https://replaceit.ai`
- Generates an HTML report via `pytest-html`

#### 6. Upload Test Report
```yaml
if: always()
```
Uploads the entire `reports/` folder (HTML report, screenshots, videos) as a downloadable artifact after every run — including failed runs. Artifacts are retained for 14 days.

## Artifacts

After each run, the following are available for download in the GitHub Actions UI under the job summary:

| Artifact | Contents |
|---|---|
| `web-test-report` | HTML report, screenshots, video recordings |

## Environment Variables

| Variable | Value | Purpose |
|---|---|---|
| `BASE_URL` | `https://replaceit.ai` | Target URL for all tests |
| `HEADLESS` | `1` | Runs browser without a display (required in CI) |

## Extending the Pipeline

To add more browsers in the future, duplicate the `Run web tests` step and change `--pw-browser` to `firefox` or `webkit`, then add a corresponding `playwright install` step for that browser.

To run against a staging environment instead of production, update `BASE_URL` to your staging URL or store it as a GitHub Actions secret and reference it with `${{ secrets.BASE_URL }}`.
