GOODBYE GOTH v6.5.22
Fog Parting + Collision Tolerance Fix

Patch scope: LEVEL 1 fog and map collision only.

Changes:
- Removed the hard square/grid look from fog reveals by rebuilding revealed space with soft overlapping feathered circles.
- Fog banks now fade more gradually when touched (1.25s).
- Added a short expanding "parting" reveal around Olly when he enters a fog bank.
- Preserved whole-patch reveal behaviour so buildings and hidden markers clear with the fog rather than leaving fog stuck over them.
- Increased fog density variation so patches do not all read as identical opacity.
- Slightly softened the continuous reveal trail so it does not create harsh lines.
- Increased the existing walkability tolerance modestly around the hand-drawn walkable path, targeting narrow path seams without changing the map architecture.

Intentionally NOT changed:
- Olly movement speed
- Gate interaction
- Gate lock sprite
- Cutscenes
- Combat / Goth AI
- Map artwork or renderer
- Inventory / HUD / minigames

Upload into the existing repository path:
js/levels/level1.js

The gate interaction image is included unchanged because this package is based on the previous active Level 1 patch.
