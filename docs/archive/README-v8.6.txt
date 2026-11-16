GOODBYE GOTH v8.6
Zombie reaction + fight intro + activity presentation patch

WHAT THIS PATCH CHANGES
1. Heavy Attack reward screen:
   - Removes the “YOU’VE DEFEATED BOTH LEVEL 1 GOTHS!” heading.
   - Uses “YOU’VE UNLOCKED THE HEAVY ATTACK!” instead.

2. Activity screens:
   - Would You? and Princess Question now use the whole viewport.
   - Removes the nested panel / “screen within a screen” presentation.
   - Content is still centred and scaled for desktop and mobile.

3. Zombie Goth hurt reaction:
   - Adds the supplied recoil/fall artwork.
   - One successful hit plays 1-2-3-4-3-2-1 and then returns to the ready pose.
   - A third successful hit in the quick combo window plays the longer fall + recovery sequence.
   - Missed punches no longer count as combo hits.
   - Zombie remains unable to attack while reacting.

4. Zombie Goth grounding / scale:
   - The pre/post crouching sprite is normalised to the same visible scale as the reaction art.
   - The new pre/post and reaction frames are anchored to the combat floor, avoiding the floating / size-pop effect during attack telegraphs and recovery.
   - Existing walking speed is unchanged.

5. Zombie fight intro:
   - On entering the Zombie Goth fight, gameplay is paused for a 2-second 3-2-1-FIGHT sequence.
   - The supplied 8 selected prep frames animate during the countdown.
   - Supplied Gothic 3, 2, 1 and FIGHT artwork is displayed in the centre.
   - Player movement, jump, dodge and attacks are locked during the intro.
   - Normal Zombie AI begins immediately after FIGHT.

6. Existing Zombie death / scratch animation remains included from the previous working patch.

FILES TO COPY INTO THE GITHUB TESTING BRANCH
- js/levels/level1.js
- css/game.css
- assets/characters/combat/zombie-prepost.png
- assets/characters/combat/zombie-hurt-1.png through zombie-hurt-8.png
- assets/characters/combat/zombie-prep-1.png through zombie-prep-8.png
- assets/characters/combat/zombie-countdown-3.png
- assets/characters/combat/zombie-countdown-2.png
- assets/characters/combat/zombie-countdown-1.png
- assets/characters/combat/zombie-countdown-fight.png
- assets/characters/combat/zombie-claw-1.png through zombie-claw-5.png
- assets/characters/combat/zombie-death-1.png through zombie-death-8.png

IMPORTANT
The existing 12-frame Zombie walk PNGs are NOT replaced by this patch. Keep the walk assets already in the project.
