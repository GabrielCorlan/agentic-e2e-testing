# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

E2E test automation framework for [https://practicesoftwaretesting.com/](https://practicesoftwaretesting.com/) (a public Angular demo/e-commerce site), built with Playwright and TypeScript. All tests are Gherkin scenarios (via playwright-bdd), compiled into and run through Playwright's own test runner/config — there is no separate Cucumber runner.

## Commands

```bash
npm install && npx playwright install --with-deps   # install deps + browsers (one-time setup)
cp .env.example .env                                 # then fill in real BASE_URL/TEST_USER/TEST_PASS

npm test                              # regenerate + run all scenarios, all browser projects
npx playwright test --project=chromium               # run only one browser project (chromium|firefox|webkit)
npm run test:tag -- "@UITC001"        # run scenario(s) matching a tag (ID or category, e.g. "@smoke")
npm run test:ui                        # interactive UI mode
npm run test:debug                     # Playwright inspector/debug mode
npm run report                          # open the last HTML report
npm run codegen                         # record a new scenario's steps with Playwright Codegen

npx tsc --noEmit             # type-check without emitting
```

## Architecture

- **`playwright.config.ts`** loads `.env` via `dotenv`, exposing `BASE_URL`/`TEST_USER`/`TEST_PASS` on `process.env`, and sets `testDir` to the output of `defineBddConfig()` (from `playwright-bdd`) — i.e. every project (`chromium`, `firefox`, `webkit`) runs tests generated from Gherkin, not hand-written specs. `use.headless` is `false`, so tests run with a visible browser window by default.
- **`features/*.feature`** — Gherkin scenarios, compiled by `playwright-bdd`'s `bddgen` CLI into runnable specs under the gitignored `.features-gen/` directory. `bddgen` must be re-run whenever a `.feature`, `elements/*.ts`, or `steps/*.steps.ts` file changes; every `test:*` script does this via `bddgen &&` (or, for plain `npm test`, the `pretest` hook).
- **`elements/*.ts`** + **`steps/*.steps.ts`** — a page-object-style split, one file per HTML tag/component, sharing a name: `elements/button.ts` holds a `Button` class wrapping actions (`.click()`, ...) on a `Locator`; `steps/button.steps.ts` registers the `When`/`Then` step(s) that use it via `createBdd()` from `playwright-bdd` (not `@cucumber/cucumber` directly — this keeps steps on Playwright's own runner/fixtures rather than Cucumber's). Only create a step/element file pair when a scenario actually needs it; a step that isn't tied to one specific element type (e.g. a plain navigation `Given`) can live wherever it's most related, it doesn't have to force-fit the pairing.
- Every scenario carries two tags: a unique sequential ID (`@UITC001`, `@UITC002`, ...) and a category (`@smoke`, `@regression`, ...), filterable via `npm run test:tag`.
- Elements select on the site's `data-test="..."` attributes (e.g. `[data-test="email"]`, `[data-test="login-submit"]`, `[data-test="nav-menu"]`) rather than text or CSS classes — prefer this pattern for new elements since the site is an Angular app where structural classes are unstable.
- `.env` holds real test credentials and is gitignored; `.env.example` documents the expected keys and is committed. `BASE_URL` sets Playwright's `baseURL`, so steps should `page.goto('/relative/path')` rather than hardcoding the domain.
