# agentic-e2e-testing

E2E test automation framework built with [Playwright](https://playwright.dev/) and TypeScript.

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

## Running tests

```bash
npm test           # run all tests (also regenerates BDD tests, see below)
npm run test:ui     # interactive UI mode
npm run test:headed # run with browser windows visible
npm run test:debug  # step-through debug mode
npm run report       # open the last HTML report
npm run codegen      # record a new test via Playwright Codegen
```

## BDD (Cucumber / Gherkin)

Gherkin scenarios live in `features/*.feature`, with their step definitions in
`features/steps/*.steps.ts`. [playwright-bdd](https://vitalets.github.io/playwright-bdd/)
compiles them into Playwright tests, so they run with the same runner, fixtures,
and HTML report as the rest of the suite.

```bash
npm run test:bdd   # generate + run the BDD scenarios (project "bdd")
```

`npm test` also regenerates the BDD tests first (via the `pretest` script), so
they're included whenever you run the full suite.
