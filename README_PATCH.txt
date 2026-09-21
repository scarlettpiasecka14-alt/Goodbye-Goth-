Goodbye Goth v6.5.26 – Fog/Camera Crash Fix

IMPORTANT: v6.5.25 contained a runtime bug: rebuildFog() was referenced after the fog renderer refactor but its function definition was accidentally removed. This patch restores that helper and removes the stray braces.

No other gameplay or visual changes are intended in this patch.

Replace only: js/levels/level1.js
