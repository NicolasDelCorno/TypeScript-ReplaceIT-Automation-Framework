# Running the Replace IT automation suites

This repo contains:
- **Web suite**: Playwright + TypeScript (`tests/`)
- **Mobile browser suite**: WebdriverIO v9 + Appium (`mobile/tests/`) for **iOS Safari** / **Android Chrome**

---

## 0) One-time setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

---

## 1) Configure target environment (optional)

Edit `.env`:

```bash
# Example
BASE_URL=https://replaceit.ai
```

---

## 2) Web (Playwright) suite

### Run all web tests — all browsers (headless)

```bash
npm run test:web
```

### Run all web tests — all browsers (headed)

```bash
npm run test:web:headed
```

### CI mode — Chromium only

```bash
npm run test:web:ci
```

### Run a single web file

```bash
npx playwright test tests/contact.spec.ts
```

### Run a single web test by title

```bash
npx playwright test -g "logo is visible"
```

### Cross-browser smoke (web)

```bash
npx playwright test tests/quality-gates.spec.ts --project=chromium
npx playwright test tests/quality-gates.spec.ts --project=firefox
npx playwright test tests/quality-gates.spec.ts --project=webkit
```

---

## 3) Mobile browser suite (WebdriverIO + Appium)

WebdriverIO starts Appium automatically — no separate server step needed.

### Run all mobile tests on iOS Safari

```bash
npm run test:mobile:ios
```

### Run all mobile tests on Android Chrome

```bash
npm run test:mobile:android
```

---

## 4) Reports & evidence output

- **Web HTML report**: `reports/Web/Report-Web-<timestamp>.html`
- **Web screenshots & videos**: `reports/test-results/`
- **Mobile screenshots**: `reports/screenshots/ios/` or `reports/screenshots/android/`
- **Failure log (both suites)**: `failures.json` (repo root)
