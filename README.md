# Goodbye Goth V9.0 — Corrected map layout package

This package replaces the previous V9.0 patch-only workflow with a self-contained installer script. It is designed for the local repository checkout on **Testing5**.

## Why the previous attempt did not change the screen

The latest inspected `Testing5` commit (`1db12ab07228acf4978b80822fb96fa21ba9806b`) added helper documents and an `apply-v9.0.sh` file, but did not modify the live game source. The three live files still had the old sidebar, the opaque HUD card and map zoom `1.24`. The earlier shell script depended on a separate `.patch` file being present beside it; that patch was not in the commit's changed-file list. Uploading a ZIP or its instructions to GitHub does not execute the installer or apply a patch. The corrected installer in this ZIP is self-contained and does not depend on a separate patch file.

## What the corrected installer changes

- `js/game.js`: moves Olly's HP and Inventory HUD **inside `.world-wrap`**, directly over the cemetery canvas; removes the visible right sidebar; retains its legacy mini-map/objective/checkpoint/save-load nodes in a hidden compatibility container so `level1.js` does not encounter null references.
- `js/levels/level1.js`: changes both map zoom values from `1.24` to `1.30` and updates the version comment.
- `css/game.css`: adds a final high-specificity layout override. The map fills the main game area. The HUD is moved inside the map wrapper and anchored directly over the canvas. It has no background/border/shadow card, and its inventory button remains clickable. The map canvas uses flex sizing so the help text and dialogue remain visible below it.

The top level header/status pills and the dialogue strip remain as before. The Zoom and pointer-coordinate values are changed together to preserve marker-click alignment.

## Apply using Codex

1. Download and extract this ZIP somewhere accessible to Codex.
2. Open your **local Goodbye Goth repository** in Codex. Make sure it is on `Testing5` and has no uncommitted changes.
3. Give Codex the contents of `CODEX_PROMPT.txt` and ask it to run the included `apply_v9.0.py` from the repository root.
4. The installer checks the branch, checks for a clean working tree, validates all required source anchors, makes a backup folder, then changes only the three files listed above.
5. Review the diff. Do not ask Codex to commit or push automatically. Commit and push to Testing5 when you are happy.
6. Confirm Vercel has deployed the latest Testing5 commit, then hard-refresh the deployment.

## Terminal alternative

From the root of your local repository, while checked out to `Testing5`, run:

```bash
python3 "/path/to/extracted/Goodbye_Goth_V9.0_Corrected/apply_v9.0.py"
```

The script stops without changes if the branch is wrong, the worktree is dirty, or expected source structures do not match. It creates `.goodbye-goth-v9.0-backup/` before writing the three modified source files.

## Acceptance test

- Sidebar with Objectives, mini-map, Checkpoint and Game Progress is no longer visible.
- Cemetery map uses the full width previously divided with the sidebar.
- Olly's HP and Inventory sit over the map in the upper-right, with no dark card behind the HUD.
- Inventory button is clickable.
- Map zoom is slightly closer; map clicks still align with challenges and enemies.
- Movement, collision, fog of war and interactions still work.
- X still saves and title-screen Load Game still loads.
- Header status pills and bottom dialogue strip remain.

This package has not been browser-tested or deployed. The installer can prepare the source changes locally; Scarlett must review, commit/push, and test the Vercel deployment.
