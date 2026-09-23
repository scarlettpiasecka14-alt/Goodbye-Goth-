GOODBYE GOTH v7.0.7
ZOMBIE GOTH COMBAT-ONLY PATCH

IMPORTANT
This patch is built directly from the current working Level 1 source supplied on 23 September 2026.
The exploration/map renderer is intentionally preserved. Do not replace game.js, story.js, or game.css.

FILES
- js/levels/level1.js
- assets/characters/combat/zombie-idle-1.png ... zombie-idle-4.png
- assets/characters/combat/zombie-walk-1.png ... zombie-walk-4.png
- assets/characters/combat/zombie-claw-1.png ... zombie-claw-5.png
- assets/characters/combat/zombie-lunge-1.png ... zombie-lunge-3.png

WHAT CHANGED
- Zombie Goth uses the supplied cropped individual combat frames.
- Zombie follows Olly continuously around the combat arena.
- Punch/heavy/dodge now use the Zombie's current combat position.
- Olly is not boxed to one side of the enemy. While grounded he keeps a small body gap; while jumping/dodging he can cross her and reposition.
- Zombie alternates claw and lunge for reliable testing.
- No exploration/map code was intentionally changed.

GITHUB
1. Unzip this folder.
2. Merge the assets/ and js/ folders into the existing repository.
3. Replace js/levels/level1.js.
4. Do NOT replace any other game files.
5. Commit and let Vercel redeploy.
