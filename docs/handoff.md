# Session handoff

Snapshot of project state for continuing in a new session. Written
2026-09-15, from branch `docs/session-handoff` off `main` at commit
`29a82cb` (last merge: PR #15, `feat/src-object-model-restructure`). Check
`git log --oneline -5` for the actual current tip, since this file isn't
updated automatically.

No secrets are included here. `.env` (gitignored) holds the real
`TEST_USER`/`TEST_PASS`; only variable names are referenced below.

## What's implemented

- E2E framework: Playwright + TypeScript, all tests as Gherkin scenarios via
  `playwright-bdd` (no `@cucumber/cucumber` runner — steps run on Playwright's
  own test runner).
- One scenario exists: `features/login.feature` (`@UITC001 @smoke`), login
  with valid credentials, asserting redirect to `/account` and that the
  header's user menu becomes visible.
- Object-model layer under `src/`: `src/objects/*.ts` (one class per
  HTML tag/component — `Button`, `Input`, `Link`, `AppHeader`) and
  `src/steps/*.steps.ts` (matching step definitions, same base filename).
  Generic action steps (click/fill) take the `data-test` id as a Cucumber
  Expression parameter rather than hardcoding it.
- Reporting: built-in Playwright HTML report + `allure-playwright` (raw
  results in `allure-results/`, viewable via `npm run allure:serve`/`allure:generate`
  — needs a local Java runtime).
- CI: `.github/workflows/tests.yml` runs on push/PR to `main` but **does not
  execute the suite** — see "Known limitation" below. Install/test/upload
  steps are present but commented out.
- Local automation (Claude Code only, in `.claude/settings.json`):
  - `UserPromptSubmit` hook (`.claude/hooks/git-branch-status.sh`) injects
    current branch/clean state/other-branches-with-unmerged-work into every
    prompt, driving a branch-per-feature workflow.
  - `PreToolUse` agent hook fires on `git push`, scoped to pushes touching
    `features/`, `src/objects/`, `src/steps/`, or `playwright.config.ts`: runs
    up to 3 recently-changed `@UITC###` tests (or `npm test` if only
    objects/steps changed) as a **non-blocking** check (reports failures as a
    warning only), and reviews the diff against `.claude/agents/test-reviewer.md`'s
    criteria plus TODO/FIXME/convention checks as a **blocking** check.
  - `Codex` gets the same two workflows as manual checklists in `AGENTS.md`
    (no hook system there), kept in sync with `CLAUDE.md`.

## Key decisions and why

| Decision | Why |
|---|---|
| `playwright-bdd` instead of raw `@cucumber/cucumber` | Keeps Gherkin tests on Playwright's own runner/fixtures/reporter instead of running a separate Cucumber process. |
| Object model (`src/objects/`) instead of classic Page Object Model | User's explicit choice — one class per HTML tag/component, reusable across pages, instead of one class per page. |
| Every scenario tagged `@UITCnnn` + a category (`@smoke`, ...) | Traceability (stable ID) plus grouping/filtering (`npm run test:tag`). |
| Generic steps take `data-test` as a `{string}` parameter | One step definition (e.g. `I click the "..." button`) covers any element of that kind, instead of one hardcoded step per target. |
| `headless` is `false` locally, `true` on `CI` | Runs visibly for local development; CI runners have no display. |
| CI test execution fully disabled (not just non-blocking) | practicesoftwaretesting.com is behind Cloudflare bot management, which blocks/challenges GitHub Actions' shared runner IPs — confirmed via a real CI run's page snapshot showing Cloudflare's "Performing security verification" screen instead of the app. Running anyway wastes CI minutes on a guaranteed failure **and** risks re-locking the test account (see below) via repeated failed logins from a challenged IP. |
| Pre-push hook's test check is non-blocking; code-quality check still blocks | User's explicit choice: they want to be able to push even when the (environment-dependent) test run fails, but still want TODOs/fragile-selector/convention issues caught. |
| `permissions.allow` added for `git diff`, `npm test`, etc. in `.claude/settings.json` | The pre-push agent hook's own Bash calls were denied by default (hook sub-agents run non-interactively, so an unlisted command is denied rather than prompted) — this made the hook fail closed with a permission error, not a real finding, until these were added. |
| Switched `TEST_USER`/`TEST_PASS` off the public shared demo credentials | The original public demo account (`customer@practicesoftwaretesting.com`) got genuinely locked ("Account locked, too many failed attempts") — those credentials are used by countless tutorials worldwide, not exclusive to this project. |

## Checks performed — verified vs. assumed

**Verified in this session (actually run, output inspected):**
- `npx tsc --noEmit` passes on current `src/` layout.
- `npx bddgen` + `npx playwright test --list` correctly discover the one
  scenario from `src/steps/**/*.ts` after the `elements/`→`src/objects/`,
  `steps/`→`src/steps/` move.
- A CI run's failure page snapshot (`test-results/*/error-context.md`)
  literally showed Cloudflare's bot-check page — this is real evidence, not
  inference, for the "Known CI limitation."
- The pre-push hook fires on `git push` (observed it block once on a
  permission error, then — after fixing `permissions.allow` — allow a push
  through while the test step failed, consistent with the new non-blocking
  policy). Its exact `systemMessage`/warning text wasn't captured verbatim in
  this session's transcript, only that the push succeeded.
- Manual login attempts against the live site with the current `.env`
  credentials return "Invalid email or password" (checked via a standalone
  Playwright script, twice, on different days).

**Not verified / assumed:**
- Whether `TEST_USER`/`TEST_PASS` in `.env` are simply mistyped, or the
  account needs email verification, or something else — not investigated
  beyond confirming the site rejects them. **This is the main open issue.**
- Whether the pre-push hook's code-quality check (step 2, still blocking)
  has ever actually triggered a block on a real issue — only the test-check
  block/unblock transition was observed directly.
- Whether CI would pass today if Cloudflare weren't a factor (the app/test
  code itself hasn't been proven against a non-challenged IP in this
  session — local runs get past Cloudflare but currently fail at login for
  the credential reason above).

## Open issues

1. **`.env`'s `TEST_USER`/`TEST_PASS` are rejected by the live site**
   ("Invalid email or password"). Blocks getting a real green local test run
   until fixed. Do **not** just retry login repeatedly to debug this — that's
   exactly the pattern that locked the previous test account.
2. Many local/remote feature branches from earlier work are still present
   after merging (e.g. `feat/allure-report`, `feat/ci-github-actions`, ...) —
   harmless clutter, not cleaned up as part of this handoff (out of scope: no
   implementation changes were made).
3. CI executing the real suite again depends on resolving the Cloudflare/IP
   problem (self-hosted runner, different browser-testing infra, or
   accepting it stays local-only) — no action planned unless raised again
   (see `CLAUDE.md`'s "Known CI limitation").

## Recommended next step

Fix the `TEST_USER`/`TEST_PASS` credentials in `.env` (verify the account
via its registration email, or re-check for a typo), then run `npm test`
locally once to confirm a real green run end-to-end post-restructure. That's
the one thing this session could not confirm.

## Relevant files for continuation

| File | Why it matters |
|---|---|
| `CLAUDE.md` | Stable project rules: stack, architecture, conventions, commands — read this first. |
| `README.md` | Human-facing setup/usage, including the CI "Known limitation" writeup. |
| `.env.example` | The three required env vars (`BASE_URL`, `TEST_USER`, `TEST_PASS`) — no real values. |
| `features/login.feature` | The one existing scenario, tagged `@UITC001 @smoke`. |
| `src/objects/`, `src/steps/` | Object-model classes and their step definitions. |
| `.claude/settings.json` | Both hooks' exact configuration (paths, permissions, prompts). |
| `.claude/agents/test-reviewer.md` | Code-quality criteria the pre-push hook and the `test-reviewer` subagent both use. |
| `.github/workflows/tests.yml` | CI workflow — disabled test execution, commented-out steps ready to restore. |
