Goodbye Goth v6.5.19 - Fog Frequency + Collision Fix

Replace:
js/levels/level1.js

Also keep/add:
assets/encounters/level1/gate-interaction.png

Changes:
- Restores usable movement while retaining walkable-path collision.
- Uses the walk-grid centre point rather than an oversized collision sampling ring, which was trapping Olly at the church start.
- Keeps the 36px world boundary on every edge.
- Significantly increases fog patch frequency.
- Adds varied patch sizes and opacity, with thinner edge fog.
- Keeps the existing gate interaction.
- No changes to map rendering, character art, combat, inventory, or minigames.
