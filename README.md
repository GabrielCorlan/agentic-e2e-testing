# agentic-e2e-testing

E2E test automation framework built with [Playwright](https://playwright.dev/) and TypeScript, using Gherkin/BDD for all test scenarios.

Site under test: [https://practicesoftwaretesting.com/](https://practicesoftwaretesting.com/)

## Setup

1. Install dependencies:
   ```bash
   npm install
   npx playwright install --with-deps
   ```
2. Copy `.env.example` to `.env` and fill in real values (`.env` is gitignored and never committed):
   ```bash
   cp .env.example .env
   ```

   | Variable    | Description                          |
   | ----------- | ------------------------------------- |
   | `BASE_URL`  | Site under test (used as Playwright's `baseURL`) |
   | `TEST_USER` | Test account email/username           |
   | `TEST_PASS` | Test account password                 |

## BDD (Cucumber / Gherkin)

All tests are written as Gherkin scenarios in `features/*.feature`.
[playwright-bdd](https://vitalets.github.io/playwright-bdd/) compiles them into
Playwright tests, so they run with the same runner, fixtures, and HTML report
as any other Playwright suite.

Every scenario carries two tags: a unique test-case ID (`@UITC001`, `@UITC002`, ...)
for traceability, and a category tag (`@smoke`, `@regression`, ...) for grouping:

```gherkin
@UITC001 @smoke
Scenario: Successful login with valid credentials
```

### Elements & steps

Step definitions and page interactions are split into two parallel top-level
folders, one file per HTML tag / component:

- **`elements/*.ts`** — a small class per element type (`button.ts`, `input.ts`,
  `link.ts`, `app-header.ts`, ...) exposing the actions you can take on it
  (`.click()`, `.fill()`, ...). These hold no Gherkin wording, only Playwright
  actions.
- **`steps/*.steps.ts`** — the `Given`/`When`/`Then` definitions behind the
  Gherkin sentences, named to match the element file they use (`button.steps.ts`
  uses `elements/button.ts`, etc.).

A step file is only added once a scenario actually needs it — the pairing is a
naming convention, not a requirement to pre-create every possible element.

## Running tests

Tests run with a visible browser window by default; they run headless
automatically when `CI` is set (see [CI/CD](#cicd) below).

```bash
npm test                        # regenerate + run all scenarios, all browsers
npm run test:tag -- "@UITC001"  # run scenario(s) matching a tag
npm run test:tag -- "@smoke"    # run all scenarios in a category
npm run test:ui                  # interactive UI mode
npm run test:debug               # step-through debug mode
npm run report                    # open the last HTML report
npm run codegen                   # record a new test via Playwright Codegen
```

`npm test` (and the other `test:*` scripts) regenerate the Playwright tests
from the `.feature` files first, so edits to a scenario or step file are
always picked up.

## Allure report

Tests also write raw results to `allure-results/` via
[allure-playwright](https://github.com/allure-framework/allure-js), alongside
the built-in Playwright HTML reporter. Generating/viewing the Allure report
requires a Java runtime (the `allure` CLI is Java-based).

```bash
npm run allure:serve      # generate a temp report from allure-results/ and open it
npm run allure:generate   # generate a static report into allure-report/
npm run allure:open        # open the last generated allure-report/
```

## CI/CD

`.github/workflows/tests.yml` runs the full suite on every push to `main` and
every pull request targeting it: install deps, install Playwright browsers,
`npm test` (headless, since `CI` is set), then upload the HTML report and the
raw `allure-results/` as artifacts.

Add these as **repository secrets** (Settings → Secrets and variables →
Actions) before the workflow can log in — they're the same values as your
local `.env`:

| Secret      | Same as `.env`'s |
| ----------- | ---------------- |
| `BASE_URL`  | `BASE_URL`       |
| `TEST_USER` | `TEST_USER`      |
| `TEST_PASS` | `TEST_PASS`      |
