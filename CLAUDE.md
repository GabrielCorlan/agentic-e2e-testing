# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

E2E test automation framework for [https://practicesoftwaretesting.com/](https://practicesoftwaretesting.com/) (a public Angular demo/e-commerce site), built with Playwright and TypeScript. All tests are Gherkin scenarios (via playwright-bdd), compiled into and run through Playwright's own test runner/config — there is no separate Cucumber runner.

### Directory map

| Path | Holds |
|---|---|
| `features/` | Gherkin `.feature` files (the scenarios) |
| `src/objects/` | One class per HTML tag/component (the object model) |
| `src/steps/` | Step definitions, one file per matching object |
| `.claude/` | Claude Code hooks, agents, skills for this repo |
| `.github/workflows/` | CI (currently disabled — see Architecture below) |
| `docs/` | Session handoff notes (`docs/handoff.md`) — not stable rules, see that file for current state |

## Git branch workflow (check this first, every prompt)

A `UserPromptSubmit` hook (`.claude/hooks/git-branch-status.sh`) injects the
current git branch, whether the working tree is clean, and whether any other
local branch has commits not yet merged into `origin/main` — as additional
context on every prompt. Before starting work on a new request, read that
injected state and act on it:

- **On `main`, clean, no other branch has unmerged work**: propose exactly 2
  branch-name options (`feat/<short-kebab-description>`, derived from the
  request) and wait for the user to pick one (or give their own name) before
  creating the branch and starting the actual task. Don't start editing
  files first and branch afterward.
- **Another local branch has commits not yet merged into `origin/main`**:
  don't silently create yet another branch. Tell the user which branch has
  unmerged/unpushed work and ask them to push it / open a PR / merge it
  first, so work continues from a clean `main`.
- **Already on a feature branch with no other unmerged branches**: that's
  the branch for the current request (matches the pattern used throughout
  this repo's history) — keep working on it, no need to re-branch.

This mirrors the manual branch-per-feature workflow already used across this
repo's git history; the hook makes checking it automatic instead of relying
on remembering to run `git status` at the start of each task.

## Pre-push validation (automatic)

A `PreToolUse` agent hook fires on every `git push` and **can block it**.
It's a no-op unless the push touches `features/`, `src/objects/`, `src/steps/`, or
`playwright.config.ts` (checked via `git diff origin/main...HEAD --name-only`);
pushes that don't touch those paths (docs-only, config-only, etc.) go
through untouched. When it does apply, the hook:

1. Runs the up-to-3 most recently added/changed `@UITC###`-tagged scenarios
   (`npm run test:tag`), or `npm test` if `src/objects/`/`src/steps/` changed without
   a new/changed scenario tag — **non-blocking**: a failure is reported as a
   clear warning (which test, the error) but never blocks the push, since
   the suite depends on a live third-party site's login and can fail for
   reasons unrelated to code (invalid/locked test credentials, Cloudflare,
   network issues).
2. Reviews the diff using the same criteria as the `test-reviewer` agent
   (`.claude/agents/test-reviewer.md`) plus leftover `TODO`/`FIXME` comments
   and this file's documented conventions — **blocks the push on a concrete
   issue** (not a style preference).

Don't try to work around a block by bypassing the hook — fix the reported
issue and push again. If the hook's verdict looks wrong, that's worth
raising with the user rather than silently overriding it.

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

- **`playwright.config.ts`** loads `.env` via `dotenv` (existing `process.env` vars, e.g. from CI secrets, are not overridden), exposing `BASE_URL`/`TEST_USER`/`TEST_PASS`, and sets `testDir` to the output of `defineBddConfig()` (from `playwright-bdd`) — i.e. every project (`chromium`, `firefox`, `webkit`) runs tests generated from Gherkin, not hand-written specs. `use.headless` is `!!process.env.CI` — headed locally, headless on CI (no display there).
- **`.github/workflows/tests.yml`** runs on push/PR to `main` but does **not** execute the suite — it only prints a disclaimer. The install/test/upload steps are kept, commented out, for if CI execution ever becomes viable again (see "Known CI limitation" below).
- Reporting is dual: the built-in Playwright HTML reporter, plus `allure-playwright` writing raw results to `allure-results/`. Turning those into a viewable Allure report (`npm run allure:generate`/`allure:serve`) needs a Java runtime — the `allure` CLI (from `allure-commandline`) is Java-based.
- **`features/*.feature`** — Gherkin scenarios, compiled by `playwright-bdd`'s `bddgen` CLI into runnable specs under the gitignored `.features-gen/` directory. `bddgen` must be re-run whenever a `.feature`, `src/objects/*.ts`, or `src/steps/*.steps.ts` file changes; every `test:*` script does this via `bddgen &&` (or, for plain `npm test`, the `pretest` hook).
- **`src/objects/*.ts`** + **`src/steps/*.steps.ts`** — an object-model split (one class per HTML tag/component, not one per page — this repo deliberately doesn't use a classic Page Object Model), one file per HTML tag/component, sharing a name: `src/objects/button.ts` holds a `Button` class wrapping actions (`.click()`, ...) on a `Locator`; `src/steps/button.steps.ts` registers the `When`/`Then` step(s) that use it via `createBdd()` from `playwright-bdd` (not `@cucumber/cucumber` directly — this keeps steps on Playwright's own runner/fixtures rather than Cucumber's). Only create a step/object file pair when a scenario actually needs it; a step that isn't tied to one specific element type (e.g. a plain navigation `Given`) can live wherever it's most related, it doesn't have to force-fit the pairing.
- Every scenario carries two tags: a unique sequential ID (`@UITC001`, `@UITC002`, ...) and a category (`@smoke`, `@regression`, ...), filterable via `npm run test:tag`.
- Objects select on the site's `data-test="..."` attributes (e.g. `[data-test="email"]`, `[data-test="login-submit"]`, `[data-test="nav-menu"]`) rather than text or CSS classes — prefer this pattern for new objects since the site is an Angular app where structural classes are unstable.
- Generic element steps take the `data-test` id as a Cucumber Expression parameter instead of hardcoding it, so a scenario names the target directly: `When('I click the {string} button', ...)` matches `And I click the "login-submit" button` (see `src/steps/button.steps.ts`). This doesn't apply to steps wrapping a composite/domain action with a fixed target (e.g. `AppHeader`'s sign-in navigation).
- `.env` holds real test credentials and is gitignored; `.env.example` documents the expected keys and is committed. `BASE_URL` sets Playwright's `baseURL`, so steps should `page.goto('/relative/path')` rather than hardcoding the domain.
- **Known CI limitation, not a code bug**: Cloudflare blocks/challenges GitHub Actions' shared runner IPs on this third-party site essentially every time (not flaky — guaranteed), unrelated to code changes. Because of that, CI execution is disabled entirely (see above) rather than made non-blocking, since running a guaranteed-to-fail suite would also waste CI minutes and risks re-locking the shared `TEST_USER` account via repeated failed-login rate limiting (happened once already). Don't try to "fix" this with more selectors/timeouts, and don't re-enable CI execution without addressing the underlying IP/runner problem first. Run the suite locally instead. See the README's "Known limitation" section.
