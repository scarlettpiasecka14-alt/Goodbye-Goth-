GOODBYE GOTH — LOADING BAT PATCH
Target: Testing4 branch, applied on top of the existing Screen Polish Patch.

WHAT THIS ADDS
- Shows one complete loading-bat illustration while the Level 1 gate cutscene video is loading.
- Gently floats the whole illustration; no separate sprite frames or complex animation.
- Fades the artwork away when video playback begins.
- Keeps the existing PLAY CUTSCENE fallback visible if autoplay is blocked.
- Keeps the existing playback-failure message if both video formats fail.
- Hides the old “LOADING CUTSCENE...” label while the illustrated loading screen is shown.

FILES TO REPLACE / ADD
- Replace: js/screen-polish.js
- Replace: css/screen-polish.css
- Add: assets/story/loading-bat.webp

INSTALL
1. Unzip this patch into the project root, preserving folder paths.
2. Replace the two existing screen-polish files when prompted.
3. Add the new WebP asset at assets/story/loading-bat.webp.
4. Commit to Testing4 only and test the locked-gate cutscene.

NOT CHANGED
- js/game.js and js/levels/level1.js are not replaced or edited.
- No combat, challenge, map, save/load, or progression logic is changed.
- Image sizing for other screens is intentionally unchanged in this patch; see the chat recommendation before deciding on a separate sizing adjustment.

CHECKS
- JavaScript syntax checked.
- CSS parsing checked.
- WebP alpha channel verified and file optimized from the original 1.78 MB PNG to a roughly 0.38 MB WebP.
- Live browser playback still needs to be tested in the Testing4 deployment.
