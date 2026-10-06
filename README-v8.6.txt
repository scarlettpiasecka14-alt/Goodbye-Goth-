GOODBYE GOTH v8.6 - ZOMBIE SCRATCH ATTACK FIX

Patch based on v8.4.

Changes:
- Includes the five new Zombie Goth scratch PNGs that were missing from the v8.4 ZIP.
- Zombie Goth no longer alternates into the old lunge/bite artwork.
- The attack warning now always describes the new CLAW SWIPE.
- The new scratch animation is authored facing LEFT and is flipped only when the player is on the Zombie's right, so the attack points toward Olly.
- Existing Zombie walk animation is unchanged.

Copy the included js/levels/level1.js and assets/characters/combat/zombie-claw-1.png ... zombie-claw-5.png into the project, preserving paths.


Changes in v8.6:
- Zombie combat pre/post/wind-up now uses the supplied Crouching Zombie Goth pose.
- Zombie scratch attack keeps the v8.5 five-pose sequence.
- Zombie death now plays an 8-frame collapse sequence made from the supplied death frames before combat victory returns to the map.
- The old front-facing idle and old lunge/bite artwork are not used for Zombie combat.
- Attack/death assets are treated as left-facing and flipped toward Olly when necessary.
