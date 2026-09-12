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

All tests are written as Gherkin scenarios in `features/*.feature`, with their
step definitions in `features/steps/*.steps.ts`.
[playwright-bdd](https://vitalets.github.io/playwright-bdd/) compiles them into
Playwright tests, so they run with the same runner, fixtures, and HTML report
as any other Playwright suite.

Every scenario carries two tags: a unique test-case ID (`@UITC001`, `@UITC002`, ...)
for traceability, and a category tag (`@smoke`, `@regression`, ...) for grouping:

```gherkin
@UITC001 @smoke
Scenario: Successful login with valid credentials
```

## Running tests

```bash
npm test                              # regenerate + run all scenarios, all browsers
npm run test:tag -- "@UITC001"        # run scenario(s) matching a tag
npm run test:tag -- "@smoke"          # run all scenarios in a category
npm run test:headed                    # run with browser windows visible
npm run test:tag:headed -- "@UITC001"  # tag-filtered + headed
npm run test:ui                        # interactive UI mode
npm run test:debug                     # step-through debug mode
npm run report                          # open the last HTML report
npm run codegen                         # record a new test via Playwright Codegen
```

`npm test` (and the other `test:*` scripts) regenerate the Playwright tests
from the `.feature` files first, so edits to a scenario or step file are
always picked up.
