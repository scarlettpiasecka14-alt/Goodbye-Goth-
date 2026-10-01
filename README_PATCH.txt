Goodbye Goth v7.4 - Zombie Goth Walk + Heavy Attack Progression Fix

BASE:
- Built directly from the supplied/tested v7.0.10 build.
- Existing Zombie Goth combat behaviour, reactions, telegraphs, collision and difficulty are preserved.

CHANGES:
- Replaced the previous 4-frame Zombie Goth combat walking set with the new 3-pose cycle supplied in the latest art pass.
- Walking cycle order: Frame 1 -> Frame 2 -> Frame 3 -> loop.
- The supplied poses were cleaned to transparent PNGs and prepared facing RIGHT so the existing combat renderer can mirror them to face Olly.
- Removed the old fourth walk frame from the combat animation loader.
- Updated the combat walk-cycle loop to use 3 frames.
- Heavy Attack is now unlocked only after BOTH Level 1 Goths are defeated, regardless of fight order.
- Heavy Attack no longer unlocks simply because Chain Goth was defeated.
- The Heavy Attack reward is shown after the second Level 1 Goth is defeated.
- Reward wording is now generic to the pair of Level 1 Goths rather than incorrectly claiming Chain Goth was always the unlock trigger.
- Existing saves keep an already-recorded Heavy Attack unlock; the old automatic "Chain Goth is dead = Heavy" fallback is removed.

NEW/REPLACED ART:
assets/characters/combat/zombie-walk-1.png
assets/characters/combat/zombie-walk-2.png
assets/characters/combat/zombie-walk-3.png

PREVIEW:
assets/characters/combat/zombie-walk-preview-v7.4.png

TEST:
1. Start a new game and enter either Level 1 Goth first.
2. Defeat the first Goth. Heavy Attack should NOT unlock yet.
3. Defeat the second Goth. Heavy Attack should unlock immediately via the reward screen.
4. Repeat the order the other way around to confirm the unlock is order-independent.
5. Enter Zombie Goth combat and watch her chase animation. It should use the new 3-frame walk cycle.
6. Confirm existing attack warning, hit reactions, collision and difficulty remain unchanged.
