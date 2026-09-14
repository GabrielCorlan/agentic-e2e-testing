#!/usr/bin/env bash
# UserPromptSubmit hook: injects current git branch/working-tree state as
# additional context, so Claude can follow the branch-per-feature workflow
# documented in CLAUDE.md without being asked to check git status manually.
set -uo pipefail

repo_root=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$repo_root" ]; then
  exit 0
fi
cd "$repo_root" || exit 0

current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$current_branch" ]; then
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  clean_state="clean"
else
  clean_state="dirty (uncommitted changes present)"
fi

unmerged=""
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  while IFS= read -r b; do
    if [ "$b" = "$current_branch" ] || [ "$b" = "main" ]; then
      continue
    fi
    count=$(git rev-list --count "origin/main..$b" 2>/dev/null || echo 0)
    if [ "$count" -gt 0 ]; then
      unmerged="${unmerged}${b} (${count} commit(s) ahead of origin/main); "
    fi
  done < <(git for-each-ref --format='%(refname:short)' refs/heads/)
fi

summary="Git branch state (auto-injected): current branch = '${current_branch}' (${clean_state})."
if [ -n "$unmerged" ]; then
  summary="${summary} OTHER LOCAL BRANCHES WITH UNMERGED WORK (not yet merged into origin/main): ${unmerged}"
else
  summary="${summary} No other local branches have unmerged work relative to origin/main."
fi

jq -n --arg ctx "$summary" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $ctx}}'
