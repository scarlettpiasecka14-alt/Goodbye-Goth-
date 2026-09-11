# Goodbye Goth — v6.0 Level 1 Map Rebuild

- Level 1 cemetery map has been rebuilt around the approved 1536x1024 illustrated cemetery map.
- The map is one continuous cobblestone cemetery with no artificial black walkable gaps.
- Church, small mausoleum and large mausoleum are visually separate.
- Goth 1, Goth 2, WOULD YOU?, Puzzle, Key and Boss Gate have dedicated clear locations.
- Walking is passive: walking into an interactive location does NOT start it. The player must click the marker.
- The camera follows Olly using the same world/camera foundation intended for larger future maps.
- Save/load remains available through localStorage.
- Chain Goth remains the second Level 1 enemy.


## v6.0: Level 1 full map rebuild
Replaced the previous cemetery background and grid-based movement presentation with a clean 1536x1024 character-free cemetery backdrop. Olly, both Goths, the Would You icon, the Princess Question icon, and the key are separate runtime sprites/objects. Movement uses continuous world coordinates and explicit collision rectangles.
