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

Every scenario carries two tags: a unique test-case ID (`@UI-TC-001`, `@UI-TC-002`, ...)
for traceability, and a category tag (`@smoke`, `@regression`, ...) for grouping:

```gherkin
@UI-TC-001 @smoke
Scenario: Successful login with valid credentials
```

### Objects & steps

This repo uses an object model — one class per HTML tag/component — rather
than a classic Page Object Model. Step definitions and object classes live
under `src/`, split into two parallel folders, one file per HTML tag /
component:

- **`src/objects/*.ts`** — a small class per element type (`button.ts`, `input.ts`,
  `link.ts`, `app-header.ts`, ...) exposing the actions you can take on it
  (`.click()`, `.fill()`, ...). These hold no Gherkin wording, only Playwright
  actions.
- **`src/steps/*.steps.ts`** — the `Given`/`When`/`Then` definitions behind the
  Gherkin sentences, named to match the object file they use (`button.steps.ts`
  uses `src/objects/button.ts`, etc.).

A step file is only added once a scenario actually needs it — the pairing is a
naming convention, not a requirement to pre-create every possible object.

## Running tests

Tests run with a visible browser window by default; they run headless
automatically when `CI` is set (see [CI/CD](#cicd) below).

```bash
npm test                        # regenerate + run all scenarios, all browsers
npm run test:tag -- "@UI-TC-001"  # run scenario(s) matching a tag
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

`.github/workflows/tests.yml` runs on every push to `main` and every pull
request targeting it, but **it does not execute the test suite** — see
"Known limitation" below for why. It only checks out the repo and prints a
`::notice::` disclaimer explaining that tests must be run locally instead.

The steps that would install dependencies, install Playwright browsers, run
`npm test`, and upload the HTML report / `allure-results/` are kept in the
file, commented out, for whenever CI execution becomes viable again (e.g. a
different runner/IP strategy). If you re-enable them, you'll also need to
add these as **repository secrets** (Settings → Secrets and variables →
Actions) — the same values as your local `.env`:

| Secret      | Same as `.env`'s |
| ----------- | ---------------- |
| `BASE_URL`  | `BASE_URL`       |
| `TEST_USER` | `TEST_USER`      |
| `TEST_PASS` | `TEST_PASS`      |

### Known limitation: Cloudflare on the GitHub-hosted runner

The suite tests a real third-party site, and practicesoftwaretesting.com
sits behind Cloudflare bot management, which blocks/challenges GitHub
Actions' shared runner IPs — a page snapshot captured while investigating
this showed Cloudflare's bot-check screen ("Performing security
verification") instead of the real app, with the post-login account-menu
check never finding what it expects, even though the login steps and the
redirect to `/account` succeeded. It doesn't reproduce locally (a
residential IP isn't challenged) either headed or headless, so it isn't
fixable from Playwright config, and it fails essentially every time on the
GitHub-hosted runner — not flaky, but guaranteed.

Because of that, CI execution is disabled entirely (see above) rather than
just made non-blocking: running a guaranteed-to-fail suite on every push
would waste CI minutes, and repeatedly attempting to log in with
`TEST_USER` from a blocked/challenged IP risks the site's login-attempt
rate limiting locking that account again (it happened once already, from
the accumulated attempts across manual debugging and CI retries). Run the
suite locally, where it works reliably (`npm test`).
