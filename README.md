# Replace IT — Test Automation Suite

End-to-end test automation for [replaceit.ai](https://replaceit.ai), an AI services company. The suite covers the full public website across **web** (Playwright) and **mobile browsers** (WebdriverIO + Appium on iOS and Android), using the **Page Object Model** pattern throughout.

**46 test cases** across 7 areas: Navigation, Home, Services, About Us, Contact, Footer & Compliance, and Cross-cutting Quality Gates.

---

## Tech Stack

| Layer | Tools |
|---|---|
| Language | TypeScript 5 |
| Web automation | Playwright (`@playwright/test`) |
| Mobile automation | WebdriverIO v9 + Appium (XCUITest / UiAutomator2) |
| Test runner | Playwright (web) · WebdriverIO / Mocha (mobile) |
| Reporting | Playwright HTML report · custom failures JSON reporter |
| Evidence | Screenshots + video recording per test |

---

## Project Structure

```
replaceit/
├── src/
│   ├── pages/              # Web Page Objects (Playwright)
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── AboutPage.ts
│   │   ├── ContactPage.ts
│   │   └── ServicesPage.ts
│   ├── fixtures/
│   │   └── web-fixtures.ts # Playwright fixtures: browser context, screenshots
│   └── reporters/
│       └── failures-reporter.ts  # Custom JSON failure reporter
├── tests/                  # Web test suite (Playwright)
│   ├── navigation.spec.ts
│   ├── home.spec.ts
│   ├── services.spec.ts
│   ├── about.spec.ts
│   ├── contact.spec.ts
│   ├── footer.spec.ts
│   └── quality-gates.spec.ts
├── mobile/
│   ├── pages/              # Mobile Page Objects (WebdriverIO)
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── AboutPage.ts
│   │   ├── ContactPage.ts
│   │   └── ServicesPage.ts
│   ├── tests/              # Mobile test suite (mirrors web suite)
│   └── wdio.config.ts      # WebdriverIO config: Appium, platform selection
├── reports/                # Auto-generated (gitignored)
│   ├── Web/
│   ├── iOS/  or  Android/
│   ├── screenshots/
│   └── test-results/
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── TEST_CASES.md           # Full test case catalogue
```

---

## Test Coverage

| # | Area | Tests |
|---|---|---|
| 1 | Navigation | 9 — nav links, logo, all pages load |
| 2 | Home Page | 5 — hero, sections visible, CTA navigation |
| 3 | Services Page | 11 — hero, 8 service cards, each "Apply now" link |
| 4 | About Us Page | 2 — hero, gallery section |
| 5 | Contact Page | 8 — form fields, validation, submission, contact details |
| 6 | Footer & Compliance | 6 — legal/policy anchors + social links |
| 7 | Quality Gates | 5 — console errors + unknown route behavior |

See [TEST_CASES.md](TEST_CASES.md) for the full catalogue with descriptions.

---

## Setup

### Prerequisites

- Node.js 18+
- For mobile tests: Appium 2 running locally on port 4723, plus the relevant simulator/emulator

### Install dependencies

```bash
npm install
npx playwright install chromium
```

### Configure environment

```bash
cp .env.example .env
# Edit .env if you need to point at a different URL
```

---

## Running Tests

### Web (Playwright)

```bash
# All web tests — all browsers (headed)
npm run test:web:headed

# All web tests — all browsers (headless)
npm run test:web

# CI mode — Chromium only
npm run test:web:ci

# Single file
npx playwright test tests/contact.spec.ts

# Cross-browser smoke
npx playwright test tests/quality-gates.spec.ts --project=chromium
npx playwright test tests/quality-gates.spec.ts --project=firefox
npx playwright test tests/quality-gates.spec.ts --project=webkit
```

### Mobile (WebdriverIO + Appium)

WebdriverIO starts Appium automatically — no separate server step needed.

```bash
# iOS Safari
npm run test:mobile:ios

# Android Chrome
npm run test:mobile:android
```

> **Device configuration**: Update `deviceName` and `platformVersion` in `mobile/wdio.config.ts` to match your available simulator/emulator.

---

## Reports & Evidence

Each test run automatically generates:

- **HTML report** — saved to `reports/Web/Report-Web-<timestamp>.html`
- **Screenshots** — full-page capture after every test, named with TC number (e.g. `PIC-TC2-1-<timestamp>.png`)
- **Videos** — screen recordings for web tests, saved to `reports/test-results/`
- **failures.json** — machine-readable failure log at the repo root

---

## Design Notes

- **Page Object Model** — all locators and interactions are encapsulated in page classes under `src/pages/` and `mobile/pages/`, keeping tests clean and locator changes contained to one place.
- **TC mapping** — each test is mapped to a numbered test case (TC1-1 through TC7-5) via a `TC_MAP` in the fixtures file, so screenshots are traceable back to the test catalogue.
- **Environment-driven base URL** — the target URL is read from `.env` (defaulting to `https://replaceit.ai`), making it easy to point tests at a staging environment.
- **Shared failures reporter** — both web and mobile suites write a `failures.json` at the repo root in a common schema, used by the CI pipeline to detect regressions.
