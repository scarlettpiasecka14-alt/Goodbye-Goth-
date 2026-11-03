# Goodbye Goth V9.0

## Purpose
This patch removes the visible right-hand sidebar and lets the cemetery canvas use the full gameplay width. Olly's HP and inventory HUD remain floating over the map. The HUD container itself has no background, border, or shadow, so there is no black card behind it. The inventory control remains a normal visible button.

The map camera zoom increases slightly from 1.24 to 1.30. The same value is changed in both rendering and mouse-coordinate conversion so interaction clicks stay aligned with the world.

## Source baseline
- Repository: https://github.com/scarlettpiasecka14-alt/Goodbye-Goth-
- Branch: `Testing4`
- Branch head checked: `2a6702bc8c02ed53a715b97f978438b8937fee0`
- Active files: `js/game.js`, `js/levels/level1.js`, `css/game.css`

The root-level `game.js` and `level1.js` are not the active files for this build. `index.html` loads `js/game.js`, which imports `js/levels/level1.js`.

## Files changed
1. `js/game.js`
   - Removes the visible objectives, mini-map, checkpoint and Game Progress sidebar.
   - Retains the legacy elements in a hidden support container. This matters because Level 1 still updates the objective elements and draws to the mini-map canvas internally. It also avoids breaking existing save/load event wiring.
   - The visible top header status indicators are intentionally unchanged.
2. `js/levels/level1.js`
   - Labels the update V9.0.
   - Changes camera zoom from 1.24 to 1.30 in both world rendering and click-coordinate conversion.
3. `css/game.css`
   - Makes the gameplay layout a single full-width column.
   - Expands the world canvas.
   - Removes the HUD card background/border/shadow while preserving the HP text, bar and inventory button.

## Apply the patch
1. Make sure your local repository is on branch `Testing4` and is up to date.
2. Extract this ZIP outside the repository folder.
3. Open Terminal and change directory into the local Goodbye Goth repository.
4. Run the following command, replacing `/path/to/extracted/goodbye_goth_v9_0` with the extracted patch folder location:

   `git apply --check "/path/to/extracted/goodbye_goth_v9_0/goodbye-goth-v9.0.patch"`

5. If the check succeeds, apply it:

   `git apply "/path/to/extracted/goodbye_goth_v9_0/goodbye-goth-v9.0.patch"`

6. Review the three changed files, commit them to `Testing4`, and allow Vercel to deploy.

Do not upload the `.patch` file itself to GitHub. It is a set of source edits to apply to the three listed files.

## What should remain working
- Olly's HP display and inventory button.
- X-key saving and title-screen Load Game.
- Enemy progression, challenge completion, checkpoint/save data and fog-of-war logic.
- Map marker hit-testing and clicks, because the camera zoom used for rendering and coordinate conversion is kept in sync.
- Existing combat and AI systems.

## Testing checklist
- [ ] The right-hand sidebar is gone.
- [ ] The map expands to the newly available width.
- [ ] There is no black HUD card behind Olly's HP bar.
- [ ] The inventory button remains clickable.
- [ ] Map clicks on enemies and puzzle/challenge markers still line up.
- [ ] Movement and fog of war work normally.
- [ ] Pressing X still saves.
- [ ] Loading from the title screen still works.
- [ ] Test at desktop and narrower browser widths.

This patch has not been tested in the live browser game. Apply it to a local copy first and verify the checklist before relying on the deployment.
