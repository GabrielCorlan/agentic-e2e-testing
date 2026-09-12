---
name: new-e2e-test
description: Use when adding a new e2e test (Playwright spec or Gherkin/BDD scenario) to this repository, to follow its existing conventions for selectors, env config, and BDD wiring.
---

# Adding a new e2e test

Two supported formats — pick based on the task, not both by default:

- **Plain spec**: add a `*.spec.ts` file under `tests/`. Runs automatically across the `chromium`/`firefox`/`webkit` projects.
- **Gherkin/BDD**: add a scenario to a `features/*.feature` file (new or existing) and its step definitions in `features/steps/*.steps.ts`. Reuse an existing step's exact text instead of writing a near-duplicate.

## Conventions to follow

- **Selectors**: use the site's `data-test="..."` attributes (e.g. `[data-test="email"]`), never CSS classes or text — this is an Angular app with unstable structural classes. If a `data-test` attribute isn't already known, inspect the live page (e.g. `npx playwright codegen $BASE_URL`) rather than guessing.
- **Base URL**: `playwright.config.ts` sets `baseURL` from `.env`'s `BASE_URL`. Use `page.goto('/relative/path')`, never a hardcoded domain.
- **Credentials**: `.env` (gitignored) is already loaded into `process.env` by `playwright.config.ts` before tests run. Reference `process.env.TEST_USER` / `process.env.TEST_PASS` directly — no per-file dotenv setup needed. Never hardcode credentials in a test.
- **BDD step definitions**: register steps with `createBdd()` from `playwright-bdd` (see `features/steps/login.steps.ts`), not `@cucumber/cucumber` directly — this keeps them on Playwright's own runner/fixtures instead of Cucumber's.

## Before considering it done

1. `npx tsc --noEmit` — type-check.
2. For BDD changes: `npm run test:bdd` (regenerates `.features-gen/` via `bddgen`, then runs the `bdd` project).
3. For spec changes: `npx playwright test <path-to-file>`.
