---
name: new-e2e-test
description: Use when adding a new e2e test (a Gherkin/BDD scenario) to this repository, to follow its existing conventions for selectors, env config, tags, and BDD wiring.
---

# Adding a new e2e test

All tests in this repo are Gherkin scenarios — there are no plain Playwright specs. Add a scenario to a `features/*.feature` file (new or existing). Reuse an existing step's exact text instead of writing a near-duplicate.

This repo uses an object model (one class per HTML tag/component, not one class per page) rather than a classic Page Object Model. Step definitions and object classes live under `src/`, split into two parallel folders, one file per HTML tag/component, sharing a name:

- **`src/objects/<name>.ts`** — a class wrapping the Playwright actions available on that element (`.click()`, `.fill()`, ...), taking a `Locator` (or `Page`, for a whole component like `app-header`) in its constructor. No Gherkin wording here.
- **`src/steps/<name>.steps.ts`** — the `Given`/`When`/`Then` definitions that use the matching object file.

When a scenario needs a new interaction: check whether a `src/objects/*.ts` file for that tag/component already exists and reuse it; only add a new object file when the tag/component genuinely isn't covered yet. Don't create an object or step file with no scenario using it — the naming pairing is a convention to follow once there's a real step, not a checklist of files to pre-create. A step that isn't really an object action (e.g. a first `Given` that just navigates) doesn't have to force-fit the pairing — put it wherever it's most related.

## Conventions to follow

- **Selectors**: use the site's `data-test="..."` attributes (e.g. `[data-test="email"]`), never CSS classes or text — this is an Angular app with unstable structural classes. If a `data-test` attribute isn't already known, inspect the live page (e.g. `npx playwright codegen $BASE_URL`) rather than guessing.
- **Generic element steps take the `data-test` id as a Cucumber Expression parameter**, not hardcoded, so one step definition covers any element of that kind: `When('I click the {string} button', async ({ page }, dataTestId: string) => ...)` matches `And I click the "login-submit" button` in a `.feature` file. Follow this for any new generic action step (click, fill, ...); it doesn't apply to a step that wraps a specific composite/domain action (e.g. `AppHeader`'s sign-in navigation), where the target isn't meant to vary.
- **Base URL**: `playwright.config.ts` sets `baseURL` from `.env`'s `BASE_URL`. Use `page.goto('/relative/path')`, never a hardcoded domain.
- **Credentials**: `.env` (gitignored) is already loaded into `process.env` by `playwright.config.ts` before tests run. Reference `process.env.TEST_USER` / `process.env.TEST_PASS` directly — no per-file dotenv setup needed. Never hardcode credentials in a test.
- **BDD step definitions**: register steps with `createBdd()` from `playwright-bdd` (see `src/steps/button.steps.ts`), not `@cucumber/cucumber` directly — this keeps them on Playwright's own runner/fixtures instead of Cucumber's.
- **Tags**: every scenario gets two tags: a unique, sequential ID (`@UITC001`, `@UITC002`, ...; check existing `features/*.feature` files for the highest one in use) and a category tag (`@smoke`, `@regression`, ...). Filter with `npm run test:tag -- "@UITC001"` or `-- "@smoke"`.

## General good practices (apply anywhere, not just this repo)

- **Prefer stable selectors over structural/styling ones.** A CSS class tied to styling, a positional selector (`nth-child`), or a deep XPath breaks on unrelated changes; a purpose-built test attribute doesn't.
  - Bad: `page.locator('.btn-primary')`
  - Good: `page.locator('[data-test="submit"]')`
- **Prefer condition-based waits over fixed ones.** A sleep/timeout is both slow (waits the full duration even when ready sooner) and flaky (too short under load).
  - Bad: `await page.waitForTimeout(3000)`
  - Good: `await expect(page.locator('[data-test="result"]')).toBeVisible()`
- **Assert the actual behavior, not just that something loaded.** A test that only checks a URL or that an element exists would still pass if the real feature were broken; assert the specific content/state the scenario claims to verify.
- **Never hardcode credentials or other sensitive data** in test code — use env vars or fixtures.
- **Keep tests independent.** Don't rely on state or ordering from another test; each test should set up what it needs and clean up after itself.

## Before considering it done

1. `npx tsc --noEmit` — type-check.
2. `npm run test:tag -- "@<your-new-ID>"` — regenerates `.features-gen/` via `bddgen` and runs just the new scenario.
3. Run it at least twice in a row — a pass on the first run doesn't rule out flakiness (timing-dependent waits, order-dependent state).
