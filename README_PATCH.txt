Goodbye Goth v6.5.24 — Fog Persistence, Smooth Camera, Gate Lock Prep, Collision

ACTIVE FILE:
- js/levels/level1.js

NEW ASSET:
- assets/encounters/level1/gate-lock.png

Changes:
1. Smooth camera follow restored after the slower movement patch.
2. Fog reveal masks are persistent, so cleared fog cannot repaint itself when the canvas rebuilds.
3. Animated fog wisps are more visible, longer and softly curved.
4. Movement now slides around tiny baked-grid seams rather than getting pinned.
5. Gate physical exclusion reduced so Olly can pass the nearby path more naturally.
6. Added the supplied gate-lock sprite over the locked gate.
7. Removed automatic gate encounter triggering. The locked-gate encounter is now opened by clicking the gate, not by merely walking near it.

Not changed:
- Olly movement speed value
- map artwork / map renderer
- combat
- cutscenes
- inventory
- relationship / puzzle mechanics
