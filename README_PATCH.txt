Goodbye Goth v6.5.21 - Fog Cloud Reveal + Collision Tolerance

Changes:
- Reworked exploration fog into broad overlapping cloud banks with varied density and size.
- Objective/decoy fog can overlap, so covered locations are not visually obvious.
- Touching a fog bank triggers a 900ms whole-patch fade/dispersal. Overlapping neighbouring patches remain.
- Fog now clears from buildings/objects when the patch itself is touched, rather than requiring Olly to stand directly on the hidden object.
- Permanent edge fog remains lighter.
- Added a small walkability tolerance around the painted path mask so narrow cobblestone routes do not trap Olly on a single conservative grid cell.
- Gate interaction asset preserved unchanged.
- No combat, inventory, map-renderer, relationship, puzzle, or game.js changes.

Upload into existing project paths, not as a new root folder.
