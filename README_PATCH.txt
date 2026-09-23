GOODBYE GOTH v7.0.2 - ZOMBIE GOTH AI BUG-FIX PATCH

THIS PATCH FIXES THE PROBLEMS FOUND IN v7.0.1:
1. Zombie Goth no longer walks backwards. Her sprite is flipped correctly when she faces Olly.
2. Sprite-sheet headings, labels, frame numbers, divider lines and checkerboard/white background remnants have been removed from the individual PNG frames.
3. The Zombie Goth is smaller and more consistent in size with the existing combat characters.
4. The supplied lunge/grab/bite source frames that visibly contain a second Olly are NOT used. Lunge now uses enemy-only art: Prepare -> Lunge -> Recover.
5. The Zombie Goth stops a safe distance from Olly during the lunge instead of passing through him or leaving him trapped behind her.
6. Attack telegraphs are longer and clearer. The Zombie pauses before attacking and shows a pulsing warning.
7. The AI remains simple: Chase -> Wind-up -> Attack -> Recovery -> Chase.

INSTALL

1. Unzip this folder.
2. Merge the `assets` folder into the existing Goodbye Goth repository.
3. Replace `js/levels/level1.js` with the file in this patch.
4. Commit the changes to GitHub and let Vercel redeploy.

IMPORTANT

Do NOT upload the original large Zombie Goth sprite sheets for this version. They are not needed by the game. The game loads only the small individual PNG frames in `assets/characters/combat/`.

TEST

Start a Zombie Goth fight and check:
- She walks toward Olly while facing him, not backwards.
- Her sprites have no headings, numbers, divider lines or white/checkerboard rectangles.
- Her size stays readable and does not suddenly become enormous.
- Before a claw or lunge, she stops and clearly telegraphs the attack.
- There is NEVER a second Olly inside the Zombie Goth sprite.
- She never walks through Olly during the lunge.

NEXT COMBAT PASS

The next pass should add proper Olly hurt/reaction animations and Zombie Goth hurt/death reactions. The lunge/bite will also get a dedicated two-character reaction once the reaction animations are prepared, rather than using the source frames that already contain Olly.
