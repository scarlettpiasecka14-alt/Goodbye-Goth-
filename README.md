# Goodbye Goth V9.0 — Reapplication Package for Testing5

## Why this package exists
The earlier V9.0 ZIP contained a Git patch, not complete replacement source files. The Testing5 commit `ff0e4637328134c16d34ce897da35ca386c7cb83` only added the master-context document. It did not change `js/game.js`, `js/levels/level1.js`, or `css/game.css`, which is why the deployed screen stayed unchanged.

This package contains the same targeted V9.0 changes, now explicitly based on the source files currently present on `Testing5`. It also includes a guarded apply script and a ready-to-use Codex prompt.

## Current repository state checked
- Repository: `scarlettpiasecka14-alt/Goodbye-Goth-`
- Development branch: `Testing5`
- Default / safe branch: `Version-9.0-safe`
- Testing5 commit at inspection: `ff0e4637328134c16d34ce897da35ca386c7cb83`
- Active files: `js/game.js`, `js/levels/level1.js`, `css/game.css`
- Active entry point: `index.html` loads `js/game.js` and `js/screen-polish.js`.

## Important: do not upload this ZIP itself to GitHub
GitHub's web upload does not unpack ZIP files or apply `.patch` files. The patch must be applied to a local checkout of the repository.

## Easiest workflow using Codex
1. Download and extract this ZIP.
2. Open your local Goodbye Goth repository in Codex and make sure it is on branch `Testing5` with no uncommitted changes.
3. Give Codex the contents of `CODEX_APPLY_PROMPT.txt` and make the extracted `goodbye-goth-v9.0.patch` available in the workspace.
4. Review the three changed files, then commit and push them to `Testing5`.
5. Let Vercel deploy the `Testing5` branch and test the checklist below.

## Terminal alternative
From the root of your local Goodbye Goth repository, run:

```bash
bash "/path/to/extracted/goodbye_goth_v9_0/apply-v9.0.sh"
```

The script checks that the current branch is `Testing5`, stops if the working tree has uncommitted changes, verifies the patch applies cleanly, then applies it. It does not commit or push.

## What the patch changes
- `js/game.js`: removes the visible right-hand objectives, mini-map, checkpoint and Game Progress sidebar. Keeps the legacy DOM nodes hidden so existing Level 1 code can continue updating them, and preserves keyboard saving / title-screen loading.
- `js/levels/level1.js`: updates the version marker and camera zoom from `1.24` to `1.30` in both rendering and click-coordinate conversion.
- `css/game.css`: makes the map full-width and removes the background, border and shadow from Olly's floating HUD wrapper. The Inventory button retains its own visible button styling.

The top header indicators remain. The dialogue strip remains beneath the map. Zombie Goth combat is not modified.

## Test after deployment
- Right sidebar is gone.
- Map fills the freed width.
- HP and Inventory overlay the map at top-right.
- No dark rectangular HUD box appears behind them.
- Inventory button remains clickable.
- Challenge/enemy clicks still align at the new zoom.
- Fog of war, movement and collision still work.
- X saves; title-screen Load Game loads.

This patch has not been tested in the live browser deployment. Do not treat it as complete until Scarlett tests it.
