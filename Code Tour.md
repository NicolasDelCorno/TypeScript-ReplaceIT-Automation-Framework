Folder & file tree:

replaceit-TS/
├── .appium/                        ← Appium driver storage (auto-managed)
│   ├── package.json
│   └── package-lock.json
│
├── .github/
│   └── workflows/
│       └── web-tests.yml           ← CI/CD pipeline configuration
│
├── src/                            ← Web test support code
│   ├── pages/
│   │   ├── BasePage.ts             ← Shared web page actions (navigation, footer)
│   │   ├── HomePage.ts             ← Home page locators & actions
│   │   ├── ServicesPage.ts         ← Services page locators & actions
│   │   ├── AboutPage.ts            ← About page locators & actions
│   │   └── ContactPage.ts          ← Contact page locators & form actions
│   ├── fixtures/
│   │   └── web-fixtures.ts         ← Test case mapping & automatic screenshots
│   └── reporters/
│       └── failures-reporter.ts    ← Writes failures.json after each run
│
├── tests/                          ← Web test files (the actual tests)
│   ├── navigation.spec.ts          ← 9 navigation tests
│   ├── home.spec.ts                ← 5 home page tests
│   ├── services.spec.ts            ← 11 services page tests
│   ├── about.spec.ts               ← 2 about page tests
│   ├── contact.spec.ts             ← 8 contact form tests
│   ├── footer.spec.ts              ← 6 footer tests
│   └── quality-gates.spec.ts       ← 5 cross-cutting quality checks
│
├── mobile/                         ← Mobile test support code & tests
│   ├── pages/
│   │   ├── BasePage.ts             ← Shared mobile page actions
│   │   ├── HomePage.ts             ← Mobile home page locators & actions
│   │   ├── ServicesPage.ts         ← Mobile services (with scroll handling)
│   │   ├── AboutPage.ts            ← Mobile about page
│   │   └── ContactPage.ts          ← Mobile contact form
│   ├── tests/
│   │   ├── navigation.spec.ts      ← Mobile navigation tests
│   │   ├── home.spec.ts            ← Mobile home tests
│   │   ├── services.spec.ts        ← Mobile services tests
│   │   ├── about.spec.ts           ← Mobile about tests
│   │   ├── contact.spec.ts         ← Mobile contact tests
│   │   └── footer.spec.ts          ← Mobile footer tests
│   ├── wdio.config.ts              ← Mobile test runner configuration
│   └── tsconfig.json               ← TypeScript settings for mobile code
│
├── reports/                        ← Auto-generated test output (not in git)
│   ├── Web/                        ← HTML test reports (web)
│   ├── iOS/ or Android/            ← HTML test reports (mobile)
│   ├── screenshots/
│   │   ├── web/                    ← Screenshots from each web test
│   │   ├── ios/                    ← Screenshots from each iOS test
│   │   └── android/                ← Screenshots from each Android test
│   └── test-results/               ← Video recordings (kept on failure)
│
├── Notes/                          ← Miscellaneous project notes
│
├── .env                            ← Local environment settings (not committed)
├── .gitignore                      ← Files/folders git should ignore
├── failures.json                   ← Machine-readable failure log (auto-generated)
├── playwright.config.ts            ← Playwright configuration
├── tsconfig.json                   ← Root TypeScript settings
├── package.json                    ← Project scripts & library list
├── package-lock.json               ← Locked library versions
├── README.md                       ← Project overview
└── TEST_CASES.md                   ← Full catalogue of all 46 test cases