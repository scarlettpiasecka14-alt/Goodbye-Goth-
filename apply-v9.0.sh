#!/usr/bin/env bash
set -euo pipefail
PATCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
CURRENT_BRANCH="$(git -C "$REPO_ROOT" branch --show-current)"
if [[ "$CURRENT_BRANCH" != "Testing5" ]]; then
  echo "ERROR: expected branch Testing5, found '$CURRENT_BRANCH'. Switch to Testing5 and rerun."
  exit 1
fi
if ! git -C "$REPO_ROOT" diff --quiet || ! git -C "$REPO_ROOT" diff --cached --quiet; then
  echo "ERROR: your working tree has uncommitted changes. Commit or stash them before applying V9.0."
  exit 1
fi
git -C "$REPO_ROOT" apply --check "$PATCH_DIR/goodbye-goth-v9.0.patch"
git -C "$REPO_ROOT" apply "$PATCH_DIR/goodbye-goth-v9.0.patch"
echo
echo "Goodbye Goth V9.0 applied to Testing5. Review the changed files before committing."
git -C "$REPO_ROOT" status --short
