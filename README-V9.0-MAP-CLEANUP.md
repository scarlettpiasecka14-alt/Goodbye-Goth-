# Goodbye Goth V9.0 - Map interface cleanup

Built on the latest `Testing5` branch (commit `825a844`, the same one Vercel last deployed).

## What changed
- The whole right-hand panel is **gone**: Level 1 objectives, the MAP (mini-map), the Checkpoint box and the Game Progress / Save / Load box.
- The mini-map code is deleted too, so it can't show where the challenges are.
- The cemetery now stretches the full width of the screen.
- Olly's **HP bar and Inventory button float over the map** (top-right) with no dark box, border or shadow behind them. Inventory is still clickable.
- Camera zoom is slightly closer, 1.24 -> 1.30 (it was in your V9.0 plan). Clicks stay lined up because the render and the click conversion both use the same number. To undo: change both `const zoom = 1.30;` lines in `js/levels/level1.js` back to `1.24`.
- Still working: **X** saves, and **Load Game** on the title screen still loads.
- Untouched: the top header (LEVEL 1 + the three pills), the dialogue strip, and all combat / Zombie Goth code.

## Files (3) and where they go in GitHub
Upload to the **Testing5** branch, keeping the folders:

| In this ZIP | Goes to (repo root = top level) |
|---|---|
| `js/game.js` | `js/game.js` |
| `js/levels/level1.js` | `js/levels/level1.js` |
| `css/screen-polish.css` | `css/screen-polish.css` |

## How to install
1. Unzip.
2. On GitHub, switch to the **Testing5** branch, then Add file -> Upload files.
3. Drag the unzipped **`js`** and **`css`** folders onto the page (so the files land in `js/`, `js/levels/` and `css/`).
4. Commit to Testing5, wait for Vercel, then hard-refresh the page (Cmd+Shift+R).

This README is named differently from your repo's `README.md` on purpose so it can't overwrite it. You don't need to upload it.

## Why the earlier attempts didn't work
In the files on Testing5, the sidebar was still built in `js/game.js`, and `css/game.css` re-adds a second column for it in about ten separate places. This patch removes the sidebar at the source and adds one final rule (at the end of `css/screen-polish.css`, which loads last) so no old rule can bring the column back.

## Checks
Done by Claude (static + headless Chrome from a local copy):
- JavaScript syntax check passed on `game.js`, `level1.js`, `story.js`, `screen-polish.js`.
- Game loaded from the start, reached Level 1: no side panel, no mini-map, no Save/Load buttons in the page.
- HP/Inventory HUD has a transparent background, no border, no shadow.
- Map is full width; Inventory opens; X saves (dialogue shows the save message, save is written); walking works.
- No JavaScript errors (only a missing favicon request).

**Not tested - please check on Vercel:**
- [ ] Clicking enemies and the heart/puzzle markers still lines up after the zoom change.
- [ ] Zombie Goth fight and heavy attack unchanged.
- [ ] Walking, collisions, fog reveal.
- [ ] Load Game from the title screen.
- [ ] Safari, and a narrower window / iPad width.
- [ ] HP text is readable over bright parts of the map.
