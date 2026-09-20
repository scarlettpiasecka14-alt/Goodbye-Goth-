GOODBYE GOTH v6.5.18
FOG + WALKABILITY + LOCKED GATE INTERACTION

Replace/upload these files into the EXISTING project paths:
- js/levels/level1.js
- assets/encounters/level1/gate-interaction.png

Changes:
1. Fog frequency increased substantially. Fog is made from separate cartoon-like cloud patches with varied size and opacity. Dense patches are placed around objectives/gate, with additional decoy patches elsewhere. Edge patches are deliberately lighter so the permanent map edges remain visible.
2. Level 1 walkability now follows a baked 96x64 walkable-route grid derived from the cemetery artwork, rather than the previous oversized collision rectangles. Trees, gardens, buildings and the outer boundary are blocked while the cobblestone routes remain open. A small collision footprint prevents Olly from clipping through corners.
3. Added a 36px top/left map boundary, plus matching outer safety boundaries, so Olly cannot leave the map.
4. Added the supplied GateInteraction.png as the locked-gate encounter art.
5. Approaching the boss gate automatically triggers the gate encounter while the four Level 1 challenges are incomplete. The encounter text is:
   "You hear a rustling from beyond the gate. You peer through the bars, trying to get a better look, but the gate's locked! You'll have to find the key."
   The only button shown is KEEP EXPLORING.
6. Existing Would You, Princess Question, combat, jump, dodge, inventory, save/load and map rendering are otherwise left alone.

Version label: v6.5.18
