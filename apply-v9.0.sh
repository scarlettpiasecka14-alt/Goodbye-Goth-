#!/usr/bin/env bash
set -euo pipefail
PATCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" apply --check "$PATCH_DIR/goodbye-goth-v9.0.patch"
git -C "$REPO_ROOT" apply "$PATCH_DIR/goodbye-goth-v9.0.patch"
printf '\nGoodbye Goth V9.0 patch applied. Review the three changed files before committing.\n'
