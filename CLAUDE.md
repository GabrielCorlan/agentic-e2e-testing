# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

E2E test automation framework for [https://practicesoftwaretesting.com/](https://practicesoftwaretesting.com/) (a public Angular demo/e-commerce site), built with Playwright and TypeScript. Tests are written both as plain Playwright specs and as Gherkin scenarios (via playwright-bdd), and both run through the same Playwright test runner/config.

## Commands

```bash
npm install && npx playwright install --with-deps   # install deps + browsers (one-time setup)
cp .env.example .env                                 # then fill in real BASE_URL/TEST_USER/TEST_PASS

npm test                    # run everything (specs + BDD, all browser projects); regenerates BDD tests first via `pretest`
npx playwright test tests/login.spec.ts              # run a single spec file
npx playwright test --project=chromium               # run only one browser project (chromium|firefox|webkit|bdd)
npx playwright test -g "customer can log in"          # run tests matching a title

npm run test:bdd            # regenerate + run only the Gherkin scenarios (project "bdd")
npm run test:bdd:tag -- "@UITC001"  # run BDD scenario(s) matching a tag (ID or category, e.g. "@smoke")
npm run test:bdd:headed      # run BDD scenarios with the browser window visible
npm run test:ui              # interactive UI mode
npm run test:headed          # headed (visible browser)
npm run test:debug           # Playwright inspector/debug mode
npm run report                # open the last HTML report
npm run codegen               # record a new test with Playwright Codegen

npx tsc --noEmit             # type-check without emitting
```

## Architecture

- **`playwright.config.ts`** loads `.env` via `dotenv` and exposes `BASE_URL`/`TEST_USER`/`TEST_PASS` on `process.env` for both config and tests/steps. It defines four projects: `chromium`, `firefox`, `webkit` (run everything under `testDir: './tests'`), and `bdd` (runs Playwright tests generated from `features/**/*.feature`, testDir pointed at `defineBddConfig()`'s output).
- **`tests/*.spec.ts`** — plain Playwright specs, run across all three browser projects.
- **`features/*.feature`** + **`features/steps/*.steps.ts`** — Gherkin scenarios compiled by `playwright-bdd`'s `bddgen` CLI into runnable specs under the gitignored `.features-gen/` directory (only the `bdd` project picks these up). Step definitions are registered via `createBdd()` from `playwright-bdd`, not `@cucumber/cucumber` directly — this keeps them running inside Playwright's own test runner/fixtures/reporter rather than Cucumber's. `bddgen` must be re-run (via `npm test`'s `pretest` hook, or `npm run test:bdd`) whenever a `.feature` or `.steps.ts` file changes.
- Every Gherkin scenario carries two tags: a unique sequential ID (`@UITC001`, `@UITC002`, ...) and a category (`@smoke`, `@regression`, ...), filterable via `npm run test:bdd:tag`.
- Both specs and steps select elements via the site's `data-test="..."` attributes (e.g. `[data-test="email"]`, `[data-test="login-submit"]`, `[data-test="nav-menu"]`) rather than text or CSS classes — prefer this pattern for new tests since the site is an Angular app where structural classes are unstable.
- `.env` holds real test credentials and is gitignored; `.env.example` documents the expected keys and is committed. `BASE_URL` sets Playwright's `baseURL`, so tests should `page.goto('/relative/path')` rather than hardcoding the domain.
