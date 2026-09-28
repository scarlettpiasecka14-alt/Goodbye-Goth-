Goodbye Goth v7.0.9 - Zombie facing / telegraph / combat asset fix

BASE:
- Built from the v7.0.8 Zombie Combat Baseline.
- Map/exploration structure is preserved.
- No AI balance changes.

CHANGES:
- Zombie combat frames are cleaned from the existing supplied sheets rather than regenerated.
- Baked checkerboard/background and detached frame-number artefacts are removed from the combat PNGs.
- Zombie combat artwork is treated as facing RIGHT by default and is mirrored only when Olly is on the left, so she faces Olly.
- Attack telegraph is now a small pulsing ring around OLly during the wind-up, not underneath the Zombie.
- Knockback is directional away from the Zombie and reduced to avoid repetitive full-distance corner shoves.
- New canonical Olly sprite is included as assets/characters/olly.png.
- No changes to map collision, challenges, gate, progression, Chain Goth logic, story.js, or game.js.

TEST:
1. Check the map first. Olly should keep the same proportions and movement.
2. Enter Zombie Goth combat.
3. Check Zombie faces Olly while she walks and attacks.
4. Check the attack warning appears around Olly.
5. Let her land a hit and check knockback.
6. Check no one gets duplicated or trapped because of the attack animation.
